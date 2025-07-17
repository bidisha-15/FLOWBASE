import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import type { Route } from "./+types/archived";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetArchivedItemsQuery, useGetWorkspaceQuery } from "@/hooks/use-workspace";
import { useArchivedTaskMutation } from "@/hooks/use-task";
import { Archive, Calendar, FolderOpen, Users, Clock, AlertCircle, CheckCircle, ArrowUpRight } from "lucide-react";

import { Loader } from "@/components/loader";
import type { Project, Task, Workspace } from "@/types";
import { format } from "date-fns";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";


const ArchivedPage = () => {
  const [searchParams] = useSearchParams();
  const workspaceId = searchParams.get("workspaceId");
  const queryClient = useQueryClient();
  const [selectedProject, setSelectedProject] = useState<string>("all");

  // Get workspace projects for the dropdown
  const { data: workspaceData } = useGetWorkspaceQuery(workspaceId!) as {
    data: {
      projects: Project[];
      workspace: Workspace;
    } | undefined;
  };

  const { data, isLoading } = useGetArchivedItemsQuery(workspaceId!) as {
    data: {
      archivedTasks: Task[];
    } | undefined,
    isLoading: boolean;
  };

  // Filter tasks based on selected project
  const filteredTasks = selectedProject === "all" 
    ? data?.archivedTasks || []
    : data?.archivedTasks?.filter(task => task.project._id === selectedProject) || [];

  const { mutate: toggleTaskArchive, isPending: isToggling } = useArchivedTaskMutation();

  const handleUnarchiveTask = (taskId: string) => {
    toggleTaskArchive({
      taskId
    }, {
      onSuccess: () => {
        toast.success("Task unarchived successfully");
        // Refresh the archived items list
        queryClient.invalidateQueries({
          queryKey: ["workspace", workspaceId, "archived"]
        });
        // Also refresh workspace stats if needed
        queryClient.invalidateQueries({
          queryKey: ["workspace", workspaceId, "stats"]
        });
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || "Failed to unarchive task");
      }
    });
  };

  if (!workspaceId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg font-medium">No workspace selected</p>
          <p className="text-gray-500">Please select a workspace to view archived items</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <Loader />;
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg font-medium">Failed to load archived items</p>
          <p className="text-gray-500">Please try again later</p>
        </div>
      </div>
    );
  }


  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start md:items-center justify-between">
        <div className="flex flex-col items-start gap-3 w-full">
          <div className="flex items-center gap-2">
            <Archive className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Archived Items</h1>
          </div>

          {/* Project Filter Dropdown */}
          <div className="flex items-center gap-4 mb-4">
            <label htmlFor="project-filter" className="text-sm font-medium">
              Filter by Project:
            </label>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {workspaceData?.projects?.map((project) => (
                  <SelectItem key={project._id} value={project._id}>
                    {project.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Card className="w-full">
            <CardHeader>
              <CardDescription>
                {filteredTasks.length} tasks archived {selectedProject === "all" ? "across all projects" : `in ${workspaceData?.projects?.find(p => p._id === selectedProject)?.title || "selected project"}`}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="divide-y">
                {filteredTasks.map((task) => (
                  <div key={task._id} className="p-4 hover:bg-muted/50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 gap-3">
                      <div className="flex">
                        <div className="flex gap-2 mr-2">
                          {task.status === "Done" ? (
                            <CheckCircle className="size-4 text-green-500" />
                          ) : (
                            <Clock className="size-4 text-yellow-500" />
                          )}
                        </div>

                        <div>
                          <Link
                            to={`/workspaces/${workspaceId}/projects/${task.project._id}/tasks/${task._id}`}
                            className="font-medium hover:text-primary hover:underline transition-colors flex items-center"
                          >
                            {task.title}
                            <ArrowUpRight className="size-4 ml-1" />
                          </Link>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge
                              variant={
                                task.status === "Done" ? "default" : "outline"
                              }
                            >
                              {task.status}
                            </Badge>

                            {task.priority && (
                              <Badge
                                variant={
                                  task.priority === "High"
                                    ? "destructive"
                                    : "secondary"
                                }
                              >
                                {task.priority}
                              </Badge>
                            )}

                            {task.isArchived && (
                              <Badge variant={"outline"}>Archived</Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-sm text-muted-foreground space-y-1">

<div className="flex justify-end mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnarchiveTask(task._id)}
                        disabled={isToggling}
                      >
                        {isToggling ? "Unarchiving..." : "Unarchive"}
                      </Button>
                    </div>
                    
                        {task.dueDate && (
                          <div>Due: {format(task.dueDate, "PPPP")}</div>
                        )}

                        

                        <div>Modified on: {format(new Date(task.updatedAt), "PPPP")}</div>
                      </div>
                    </div>

                    {/* <div className="flex justify-end mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnarchiveTask(task._id)}
                        disabled={isToggling}
                      >
                        {isToggling ? "Unarchiving..." : "Unarchive"}
                      </Button>
                    </div> */}
                  </div>
                ))}

                {filteredTasks.length === 0 && (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    {selectedProject === "all" 
                      ? "No archived tasks found in this workspace" 
                      : `No archived tasks found in ${workspaceData?.projects?.find(p => p._id === selectedProject)?.title || "selected project"}`
                    }
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
         
        </div>
      </div>
</div>
   
  );
};

export default ArchivedPage;