export interface User{
    _id: string;
    name: string;
    email: string;
    createdAt: Date;
    isEmailVerified: boolean;
    updatedAt: Date;
    profilePicture?: string;
}

export interface Workspace {
    _id: string;
    name: string;
    description?: string;
    owner: User;
    color: string;
    createdAt: Date;
    updatedAt: Date;
    members: {
        user: User;
        role: 'owner' | 'admin' | 'member' | 'viewer';
        joinedAt: Date;
    }[]
}

export enum ProjectStatus {
  PLANNING = "Planning",
  IN_PROGRESS = "In Progress",
  ON_HOLD = "On Hold",
  COMPLETED = "Completed",
  CANCELLED = "Cancelled",
}

export interface Project {
  _id: string;
  title: string;
  description?: string;
  status: ProjectStatus;
  workspace: Workspace;
  startDate: Date;
  dueDate: Date;
  progress: number;
  tasks: Task[];
  members: {
    user: User;
    role: "admin" | "member" | "owner" | "viewer";
  }[];
  createdAt: Date;
  updatedAt: Date;
  isArchived: boolean;
}

export type TaskStatus = "To Do" | "In Progress" | "Done";
export type TaskPriority = "High" | "Medium" | "Low";
export enum ProjectMemberRole {
  MANAGER = "manager",
  CONTRIBUTOR = "contributor",
  VIEWER = "viewer",
}

export interface Subtask {
  _id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  project: Project;
  createdAt: Date;
  updatedAt: Date;
  isArchived: boolean;
  dueDate: Date;
  priority: TaskPriority;
  assignee: User | string;
  createdBy: User | string;
  assignees: User[];
  subtasks?: Subtask[];
  watchers?: User[];
  attachments?: Attachment[];
}


export interface Attachment {
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: Date;
  _id: string;
}

export interface MemberProps {
  _id: string;
  user: User;
  role: "admin" | "member" | "owner" | "viewer";
  joinedAt: Date;
}

export type ResourceType =
  | "Task"
  | "Project"
  | "Workspace"
  | "Comment"
  | "User";

export type ActionType =
  | "task_created"
  | "task_updated"
  | "task_completed"
  | "task_deleted"
  | "task_watched"
  | "subtask_created"
  | "subtask_updated"
  | "project_created"
  | "project_updated"
  | "project_deleted"
  | "workspace_created"
  | "workspace_updated"
  | "member_added"
  | "member_removed"
  | "comment_added"
  | "file_uploaded";

export interface ActivityLog {
  _id: string;
  user: User;
  type: ActionType;
  resourceType: ResourceType;
  resourceId: string;
  details: any;
  createdAt: Date;
}

export interface CommentReaction {
  emoji: string;
  user: User;
}

export interface Comment {
  _id: string;
  author: User;
  text: string;
  createdAt: Date;
  reactions?: CommentReaction[];
  attachments?: {
    fileName: string;
    fileUrl: string;
    fileType?: string;
    fileSize?: number;
  }[];
}

export interface StatsCardProps {
  totalProjects: number;
  totalTasks: number;
  totalProjectInProgress: number;
  totalTaskCompleted: number;
  totalTaskToDo: number;
  totalTaskInProgress: number;
}

export interface TaskTrendsData {
  name: string;
  completed: number;
  inProgress: number;
  todo: number;
}

export interface TaskPriorityData {
  name: string;
  value: number;
  color: string;
}

export interface ProjectStatusData {
  name: string;
  value: number;
  color: string;
}

export interface WorkspaceProductivityData {
  name: string;
  completed: number;
  total: number;
}

