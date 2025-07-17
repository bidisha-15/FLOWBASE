import Workspace from "../models/workspace.js";
import Project from "../models/projects.js";
import User from "../models/user.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../libs/send-nodemail.js";
import { recordActivity } from "../libs/index.js";
import WorkspaceInvite from "../models/workspace-invite.js";
import Task from "../models/task.js";

const createWorkspace = async (req, res) => {
  try {
    const { name, description, color } = req.body;

    const workspace = await Workspace.create({
      name,
      description,
      color,
      owner: req.user._id,
      members: [
        {
          user: req.user._id,
          role: "owner",
          joinedAt: new Date(),
        },
      ],
    });

    res.status(201).json(workspace);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.find({
      "members.user": req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json(workspaces);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getWorkspaceDetails = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findById({
      _id: workspaceId,
    }).populate("members.user", "name email profilePicture");

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    res.status(200).json(workspace);
  } catch (error) {}
};

const getWorkspaceProjects = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findOne({
      _id: workspaceId,
      "members.user": req.user._id,
    }).populate("members.user", "name email profilePicture");

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const projects = await Project.find({
      workspace: workspaceId,
      isArchived: false,
      members: { $elemMatch: { user: req.user._id } },
    })
      .populate("tasks", "status")
      .sort({ createdAt: -1 });

    res.status(200).json({ projects, workspace });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getWorkspaceStats = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    // Validate workspaceId
    if (!workspaceId || workspaceId === 'null' || workspaceId === '' || workspaceId === 'undefined') {
      return res.status(400).json({
        message: "Invalid workspace ID",
      });
    }

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const isMember = workspace.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this workspace",
      });
    }

    const [totalProjects, projects] = await Promise.all([
      Project.countDocuments({ workspace: workspaceId }),
      Project.find({ workspace: workspaceId })
        .populate(
          "tasks",
          "title status dueDate project updatedAt isArchived priority"
        )
        .sort({ createdAt: -1 }),
    ]);

    const totalTasks = projects.reduce((acc, project) => {
      return acc + project.tasks.length;
    }, 0);

    const totalProjectInProgress = projects.filter(
      (project) => project.status === "In Progress"
    ).length;
    // const totalProjectCompleted = projects.filter(
    //   (project) => project.status === "Completed"
    // ).length;

    const totalTaskCompleted = projects.reduce((acc, project) => {
      return (
        acc + project.tasks.filter((task) => task.status === "Done").length
      );
    }, 0);

    const totalTaskToDo = projects.reduce((acc, project) => {
      return (
        acc + project.tasks.filter((task) => task.status === "To Do").length
      );
    }, 0);

    const totalTaskInProgress = projects.reduce((acc, project) => {
      return (
        acc +
        project.tasks.filter((task) => task.status === "In Progress").length
      );
    }, 0);

    const tasks = projects.flatMap((project) => project.tasks);

    // get upcoming task in next 7 days

    const upcomingTasks = tasks.filter((task) => {
      const taskDate = new Date(task.dueDate);
      const today = new Date();
      return (
        taskDate > today &&
        taskDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      );
    });

    const taskTrendsData = [
      { name: "Sun", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Mon", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Tue", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Wed", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Thu", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Fri", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Sat", completed: 0, inProgress: 0, toDo: 0 },
    ];

    // get last 7 days tasks date
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date;
    }).reverse();

    // populate

    for (const project of projects) {
      for (const task in project.tasks) {
        const taskDate = new Date(task.updatedAt);

        const dayInDate = last7Days.findIndex(
          (date) =>
            date.getDate() === taskDate.getDate() &&
            date.getMonth() === taskDate.getMonth() &&
            date.getFullYear() === taskDate.getFullYear()
        );

        if (dayInDate !== -1) {
          const dayName = last7Days[dayInDate].toLocaleDateString("en-US", {
            weekday: "short",
          });

          const dayData = taskTrendsData.find((day) => day.name === dayName);

          if (dayData) {
            switch (task.status) {
              case "Done":
                dayData.completed++;
                break;
              case "In Progress":
                dayData.inProgress++;
                break;
              case "To Do":
                dayData.toDo++;
                break;
            }
          }
        }
      }
    }

    // get project status distribution
    const projectStatusData = [
      { name: "Completed", value: 0, color: "#10b981" },
      { name: "In Progress", value: 0, color: "#3b82f6" },
      { name: "Planning", value: 0, color: "#f59e0b" },
    ];

    for (const project of projects) {
      switch (project.status) {
        case "Completed":
          projectStatusData[0].value++;
          break;
        case "In Progress":
          projectStatusData[1].value++;
          break;
        case "Planning":
          projectStatusData[2].value++;
          break;
      }
    }

    // Task priority distribution
    const taskPriorityData = [
      { name: "High", value: 0, color: "#ef4444" },
      { name: "Medium", value: 0, color: "#f59e0b" },
      { name: "Low", value: 0, color: "#6b7280" },
    ];

    for (const task of tasks) {
      switch (task.priority) {
        case "High":
          taskPriorityData[0].value++;
          break;
        case "Medium":
          taskPriorityData[1].value++;
          break;
        case "Low":
          taskPriorityData[2].value++;
          break;
      }
    }

    const workspaceProductivityData = [];

    for (const project of projects) {
      const projectTask = tasks.filter(
        (task) => task.project.toString() === project._id.toString()
      );

      const completedTask = projectTask.filter(
        (task) => task.status === "Done" && task.isArchived === false
      );

      workspaceProductivityData.push({
        name: project.title,
        completed: completedTask.length,
        total: projectTask.length,
      });
    }

    const stats = {
      totalProjects,
      totalTasks,
      totalProjectInProgress,
      totalTaskCompleted,
      totalTaskToDo,
      totalTaskInProgress,
    };

    res.status(200).json({
      stats,
      taskTrendsData,
      projectStatusData,
      taskPriorityData,
      workspaceProductivityData,
      upcomingTasks,
      recentProjects: projects.slice(0, 5),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const inviteUserToWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { email, role } = req.body;

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const userMemberInfo = workspace.members.find(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!userMemberInfo || !["admin", "owner"].includes(userMemberInfo.role)) {
      return res.status(403).json({
        message: "You are not authorized to invite members to this workspace",
      });
    }

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    const isMember = workspace.members.some(
      (member) => member.user.toString() === existingUser._id.toString()
    );

    if (isMember) {
      return res.status(400).json({
        message: "User already a member of this workspace",
      });
    }

    const isInvited = await WorkspaceInvite.findOne({
      user: existingUser._id,
      workspaceId: workspaceId,
    });

    if (isInvited && isInvited.expiresAt > new Date()) {
      return res.status(400).json({
        message: "User already invited to this workspace",
      });
    }

    if (isInvited && isInvited.expiresAt < new Date()) {
      await WorkspaceInvite.deleteOne({ _id: isInvited._id });
    }

    const inviteToken = jwt.sign(
      {
        user: existingUser._id,
        workspaceId: workspaceId,
        role: role || "member",
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    await WorkspaceInvite.create({
      user: existingUser._id,
      workspaceId: workspaceId,
      token: inviteToken,
      role: role || "member",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    const invitationLink = `${process.env.FRONTEND_URL}/workspace-invite/${workspace._id}?tk=${inviteToken}`;

    const emailContent = `
      <p>You have been invited to join ${workspace.name} workspace</p>
      <p>Click here to join: <a href="${invitationLink}">${invitationLink}</a></p>
    `;

    await sendEmail(
      email,
      "You have been invited to join a workspace",
      emailContent
    );

    res.status(200).json({
      message: "Invitation sent successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const acceptGeneralInvite = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const isMember = workspace.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (isMember) {
      return res.status(400).json({
        message: "You are already a member of this workspace",
      });
    }

    workspace.members.push({
      user: req.user._id,
      role: "member",
      joinedAt: new Date(),
    });

    await workspace.save();

    await recordActivity(
      req.user._id,
      "joined_workspace",
      "Workspace",
      workspaceId,
      {
        description: `Joined ${workspace.name} workspace`,
      }
    );

    res.status(200).json({
      message: "Invitation accepted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const acceptInviteByToken = async (req, res) => {
  try {
    const { token } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { user, workspaceId, role } = decoded;

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const isMember = workspace.members.some(
      (member) => member.user.toString() === user.toString()
    );

    if (isMember) {
      return res.status(400).json({
        message: "User already a member of this workspace",
      });
    }

    const inviteInfo = await WorkspaceInvite.findOne({
      user: user,
      workspaceId: workspaceId,
    });

    if (!inviteInfo) {
      return res.status(404).json({
        message: "Invitation not found",
      });
    }

    if (inviteInfo.expiresAt < new Date()) {
      return res.status(400).json({
        message: "Invitation has expired",
      });
    }

    workspace.members.push({
      user: user,
      role: role || "member",
      joinedAt: new Date(),
    });

    await workspace.save();

    // Always return success once the user is added to workspace
    res.status(200).json({
      message: "Invitation accepted successfully",
    });

    // Cleanup operations (non-critical)
    try {
      await Promise.all([
        WorkspaceInvite.deleteOne({ _id: inviteInfo._id }),
        recordActivity(user, "joined_workspace", "Workspace", workspaceId, {
          description: `Joined ${workspace.name} workspace`,
        }),
      ]);
    } catch (cleanupError) {
      console.log("Cleanup error after successful invite acceptance:", cleanupError);
      // Don't throw or return error - invitation was already accepted successfully
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getArchivedItems = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    console.log("Workspace ID:", workspaceId);
    // Validate workspaceId
    if (!workspaceId || workspaceId === 'null' || workspaceId === '' || workspaceId === 'undefined') {
      return res.status(400).json({
        message: "Invalid workspace ID",
      });
    }

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const isMember = workspace.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this workspace",
      });
    }

    const projects = await Project.find({
      workspace: workspaceId
    })
      .populate("tasks", "status")
      .sort({ createdAt: -1 });


    // Get archived projects
    const archivedTasks = await Task.find({
      isArchived: true,
      project: { $in: projects.map((project) => project._id) },
    })
      .sort({ updatedAt: -1 });



    // Extract archived tasks from active projects
    // const archivedTasks = activeProjects
    //   .map((project) => project.tasks)
    //   .flat()
    //   .filter((task) => task)
    //   .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    console.log("Archived Tasks:", archivedTasks);

    res.status(200).json({
      
      archivedTasks,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const deleteWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    console.log("Deleting workspace:", workspaceId);

    // Validate required fields
    if (!workspaceId) {
      return res.status(400).json({ message: "Workspace ID is required" });
    }

    // Check if workspace exists
    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // Check if user is the owner (only owners can delete workspaces)
    const userMember = workspace.members.find(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!userMember || userMember.role !== "owner") {
      return res.status(403).json({
        message: "Only workspace owners can delete workspaces",
      });
    }

    // Delete all projects associated with this workspace
    const projects = await Project.find({ workspace: workspaceId });

    // Delete all tasks associated with these projects
    for (const project of projects) {
      await Task.deleteMany({ project: project._id });
    }

    // Delete all projects in this workspace
    await Project.deleteMany({ workspace: workspaceId });

    // Delete all workspace invites
    await WorkspaceInvite.deleteMany({ workspaceId: workspaceId });

    // Finally delete the workspace
    await Workspace.findByIdAndDelete(workspaceId);

    res.status(200).json({
      message: "Workspace deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting workspace:", error);

    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid workspace ID format" });
    }

    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const transferWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { newOwner } = req.body;

    // Validate required fields
    if (!workspaceId || !newOwner) {
      return res
        .status(400)
        .json({ message: "Workspace ID and new owner email are required" });
    }

    // Check if workspace exists
    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // Check if user is the owner (only owners can transfer workspaces)
    const userMember = workspace.members.find(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!userMember || userMember.role !== "owner") {
      return res.status(403).json({
        message: "Only workspace owners can transfer workspaces",
      });
    }

    // Find the new owner by email
    const newOwnerUser = await User.findOne({ email: newOwner });

    if (!newOwnerUser) {
      return res.status(404).json({ message: "New owner not found" });
    }

    // Check if the new owner is already a member
    const isAlreadyMember = workspace.members.some(
      (member) => member.user.toString() === newOwnerUser._id.toString()
    );

    // If not a member, add them as a member first
    if (!isAlreadyMember) {
      workspace.members.push({
        user: newOwnerUser._id,
        role: "member",
        joinedAt: new Date(),
      });
    }

    // Update the current owner's role to admin
    const currentOwnerIndex = workspace.members.findIndex(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (currentOwnerIndex !== -1) {
      workspace.members[currentOwnerIndex].role = "admin";
    }

    // Update the new owner's role to owner
    const newOwnerIndex = workspace.members.findIndex(
      (member) => member.user.toString() === newOwnerUser._id.toString()
    );

    if (newOwnerIndex !== -1) {
      workspace.members[newOwnerIndex].role = "owner";
    }

    // Transfer ownership in the workspace document
    workspace.owner = newOwnerUser._id;

    await workspace.save();

    res.status(200).json({
      message: "Workspace ownership transferred successfully",
    });
  } catch (error) {
    console.error("Error transferring workspace:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const updateWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { name, description, color } = req.body;

    const workspace = await Workspace.findByIdAndUpdate(
      workspaceId,
      { name, description, color },
      { new: true }
    );

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    res.status(200).json(workspace);
  } catch (error) {
    console.error("Error updating workspace:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export {
  createWorkspace,
  getWorkspaces,
  getWorkspaceDetails,
  getWorkspaceProjects,
  getWorkspaceStats,
  inviteUserToWorkspace,
  acceptGeneralInvite,
  acceptInviteByToken,
  getArchivedItems,
  deleteWorkspace,
  transferWorkspace,
  updateWorkspace,
};