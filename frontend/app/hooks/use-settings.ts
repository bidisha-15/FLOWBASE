
import { deleteData, postData } from "@/lib/fetch-util";
import type { settingsFormData } from "@/routes/dashboard/settings";
import { useMutation, useQuery } from "@tanstack/react-query";


export const useUpdateWorkspace = (workspaceId: string) => {
  return useMutation({
    mutationFn: async (data: settingsFormData) =>
      postData(`/workspaces/${workspaceId}/update`, data),
  });
};

export const useDeleteWorkspace = (workspaceId: string) => {
  return useMutation({
    mutationFn: async () => deleteData(`/workspaces/${workspaceId}/delete`),
  });
};