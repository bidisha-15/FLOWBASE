import { useGetWorkspaceQuery } from "@/hooks/use-workspace";
import type { Project, Workspace } from "@/types";
import { Loader } from "@/components/loader";
import { useState } from "react";
import { useParams } from "react-router";
import { ProjectList } from "@/components/workspace/project-list";
import { CreateProjectDialog } from "@/components/project/create-project";
import { BackButton } from "@/components/back-button";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const WorkspaceProjects = () => {
    const { workspaceId } = useParams<{ workspaceId: string }>();
    const [isCreateProject, setIsCreateProject] = useState(false);

    if (!workspaceId) {
        return (
            <div className="flex items-center justify-center h-64">
                <h1 className="text-2xl font-bold">Workspace ID is missing</h1>
            </div>
        );
    }

    const { data: projectsData, isLoading } = useGetWorkspaceQuery(workspaceId) as {
        data: {
            projects: Project[];
            workspace: Workspace;
        };
        isLoading: boolean;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader />
            </div>
        );
    }

    if (!projectsData) {
        return (
            <div className="flex items-center justify-center h-64">
                <h1 className="text-2xl font-bold">Workspace not found</h1>
            </div>
        );
    }

    const { projects, workspace } = projectsData;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <BackButton />
                    <div>
                        <h1 className="text-3xl font-bold">Projects</h1>
                        <p className="text-muted-foreground">
                            Manage projects in {workspace?.name || 'this workspace'}
                        </p>
                    </div>
                </div>
                <Button onClick={() => setIsCreateProject(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Project
                </Button>
            </div>

            {/* Projects List */}
            <ProjectList
                workspaceId={workspaceId}
                projects={projects}
                onCreateProject={() => setIsCreateProject(true)}
            />

            {/* Create Project Dialog */}
            <CreateProjectDialog
                isOpen={isCreateProject}
                onOpenChange={setIsCreateProject}
                workspaceId={workspaceId}
                workspaceMembers={workspace?.members as any}
            />
        </div>
    );
};

export default WorkspaceProjects;
