import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router";
import { useGetWorkspaceDetailsQuery } from "@/hooks/use-workspace";
import type { Workspace } from "@/types";
import { useDeleteWorkspace } from "@/hooks/use-settings";


interface DeleteWorkspaceProps {
  isDeletingWorkspace: boolean;
  setIsDeletingWorkspace: (isDeletingWorkspace: boolean) => void;
}

const deleteWorkspaceSchema = z.object({
  name: z.string().min(1, "Workspace name is required"),
});

export type DeleteWorkspaceForm = z.infer<typeof deleteWorkspaceSchema>;

export const DeleteWorkspace = ({
  isDeletingWorkspace,
  setIsDeletingWorkspace,
}: DeleteWorkspaceProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const workspaceId = searchParams.get("workspaceId");

  const { data: workspace, isLoading } = useGetWorkspaceDetailsQuery(
    workspaceId!
  ) as {
    data: Workspace;
    isLoading: boolean;
  };

  const form = useForm<DeleteWorkspaceForm>({
    resolver: zodResolver(deleteWorkspaceSchema),
    defaultValues: {
      name: "",
    },
  });

  const { mutate: deleteWorkspace, isPending } = useDeleteWorkspace(
    workspaceId!
  );

  const onSubmit = (data: DeleteWorkspaceForm) => {
    // Validate workspace name matches
    if (data.name !== workspace?.name) {
      toast.error(
        `Workspace name doesn't match. Please type "${workspace?.name}" exactly.`
      );
      return;
    }

    deleteWorkspace(undefined, {
      onSuccess: () => {
        toast.success("Workspace deleted successfully");
        setIsDeletingWorkspace(false);
        navigate("/dashboard");
      },
      onError: (error: any) => {
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to delete workspace";
        toast.error(errorMessage);
        console.error("Delete workspace error:", error);
      },
    });
  };
  return (
    <Dialog
      open={isDeletingWorkspace}
      onOpenChange={setIsDeletingWorkspace}
      modal={true}
    >
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Delete Workspace</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the{" "}
            <span className="font-semibold text-destructive">
              "{workspace?.name}"
            </span>{" "}
            workspace and all of its projects, tasks, and data.
            <br />
            <br />
            Please type{" "}
            <span className="font-semibold">"{workspace?.name}"</span> to
            confirm.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Type the workspace name to confirm:{" "}
                      <span className="font-semibold text-destructive">
                        {workspace?.name}
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={`Type "${workspace?.name}" here`}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsDeletingWorkspace(false)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  type="submit"
                  disabled={
                    isPending ||
                    isLoading ||
                    form.watch("name") !== workspace?.name
                  }
                >
                  {isPending ? "Deleting..." : "Delete Workspace"}
                </Button>
              </DialogFooter>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};