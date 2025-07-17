import type { Project } from "@/types";
import { Link } from "react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { cn } from "@/lib/utils";
import { getTaskStatusColor, getProjectProgress, getDynamicProjectStatus } from "@/lib";
import { Progress } from "../ui/progress";
import { format } from "date-fns";
import { CalendarDays } from "lucide-react";

interface ProjectCardProps {
  project: Project;
  workspaceId: string;
}

export const ProjectCard = ({
  project,
  workspaceId,
}: ProjectCardProps) => {
  // Calculate progress dynamically from project tasks
  const progress = getProjectProgress(project.tasks);
  
  // Calculate dynamic project status based on task completion
  const dynamicStatus = getDynamicProjectStatus(project.tasks);
  
  // Generate dynamic status message based on progress and task counts
  const getStatusMessage = () => {
    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter(task => task.status === "Done").length;
    
    if (totalTasks === 0) {
      return "Ready for planning";
    }
    
    if (progress === 100) {
      return "Project completed!";
    }
    
    if (progress === 0) {
      return "Planning complete, ready to start";
    }
    
    if (progress >= 75) {
      return `Almost done! ${totalTasks - completedTasks} task${totalTasks - completedTasks === 1 ? '' : 's'} left`;
    }
    
    if (progress >= 50) {
      return `Making good progress`;
    }
    
    if (progress >= 25) {
      return `Work in progress`;
    }
    
    return `${completedTasks} of ${totalTasks} tasks completed`;
  };
  return (
    <Link to={`/workspaces/${workspaceId}/projects/${project._id}`}>
      <Card className="transition-all duration-300 hover:shadow-md hover:translate-y-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{project.title}</CardTitle>
            <span
              className={cn(
                "text-xs rounded-full",
                getTaskStatusColor(dynamicStatus as any)
              )}
            >
              {dynamicStatus}
            </span>
          </div>
          <CardDescription className="line-clamp-2">
            {project.description || "No description"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>

              <Progress value={progress} className="h-2" />

              <div className="text-xs text-muted-foreground">
                {getStatusMessage()}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm gap-2 text-muted-foreground">
                <span>{project.tasks.length}</span>
                <span>Tasks</span>
              </div>

              {project.dueDate && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <CalendarDays className="w-4 h-4" />
                  <span>{format(project.dueDate, "MMM d, yyyy")}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};