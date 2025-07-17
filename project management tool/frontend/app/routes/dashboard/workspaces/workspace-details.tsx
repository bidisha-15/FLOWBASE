import { useGetWorkspaceDetailsQuery, useGetWorkspaceQuery } from "@/hooks/use-workspace";
import type { Project, Workspace } from "@/types";
import { Loader } from "@/components/loader";
import { useState } from "react";
import { useParams } from "react-router";
import {WorkspaceHeader} from "@/components/workspace/workspace-header";
import { ProjectList } from "@/components/workspace/project-list";
import { CreateProjectDialog } from "@/components/project/create-project";
import { InviteMemberDialog } from "@/components/workspace/invite-member";


const WorkspaceDetails = () => {
    const {workspaceId} = useParams<{workspaceId: string}>();
    const [isCreateProject, setIsCreateProject] = useState(false);
    const [isInviteMember, setIsInviteMember] = useState(false);
    if(!workspaceId) {
        return (
            <div className="flex items-center justify-center h-64">
                <h1 className="text-2xl font-bold">Workspace ID is missing</h1>
            </div>
        );
    }

    const {data: workspace, isLoading} = useGetWorkspaceDetailsQuery(workspaceId) as {
        data: Workspace;
        isLoading: boolean;
    };

    const {data: projectsData, isLoading: isProjectsLoading} = useGetWorkspaceQuery(workspaceId) as {
        data: {
            projects: Project[];
            workspace: Workspace;
        };
        isLoading: boolean;
    };

    if(isLoading || isProjectsLoading){
        return(
            <div className="flex items-center justify-center h-64">
                <Loader />
            </div>
        )
    }

    if(!workspace) {
        return (
            <div className="flex items-center justify-center h-64">
                <h1 className="text-2xl font-bold">Workspace not found</h1>
            </div>
        );
    }

    const projects = projectsData?.projects || [];

    return (
        <div className="space-y-8">
            <WorkspaceHeader
        workspace={workspace}
        members={workspace?.members as any}
        onCreateProject={() => setIsCreateProject(true)}
        onInviteMember={() => setIsInviteMember(true)}
      />

      <ProjectList
        workspaceId={workspaceId}
        projects={projects}
        onCreateProject={() => setIsCreateProject(true)}
      />

      <CreateProjectDialog
        isOpen={isCreateProject}
        onOpenChange={setIsCreateProject}
        workspaceId={workspaceId}
        workspaceMembers={workspace.members as any}
      />

      <InviteMemberDialog
        isOpen={isInviteMember}
        onOpenChange={setIsInviteMember}
        workspaceId={workspaceId}
      />
        </div>
    );
}
    export default WorkspaceDetails;