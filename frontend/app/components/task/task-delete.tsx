import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { useDeleteTaskMutation } from "@/hooks/use-task";
import { toast } from "sonner";
import { useNavigate } from "react-router";

interface DeleteTaskProps {
  isDeletingTask: boolean;
  setIsDeletingTask: (isDeletingTask: boolean) => void;
  taskId: string;
  taskTitle?: string; // Optional title for the task
}

const DeleteTaskModal = ({
  isDeletingTask,
  setIsDeletingTask,
  taskId,
  taskTitle,
}: DeleteTaskProps) => {
  const navigate = useNavigate();
  const { mutate: deleteTask, isPending } = useDeleteTaskMutation();

  const handleDelete = () => {
    deleteTask(taskId, {
      onSuccess: () => {
        toast.success("Task deleted successfully");
        setIsDeletingTask(false);

        // Navigate back if no custom success handler
        navigate(-1);
      },
      onError: (error: any) => {
        const errorMessage =
          error?.response?.data?.message || "Failed to delete task";
        toast.error(errorMessage);
      },
    });
  };
  return (
    <Dialog open={isDeletingTask} onOpenChange={setIsDeletingTask} modal={true}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Task</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            {taskTitle ? taskTitle : "this task"}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-3 justify-end mt-4">
          <Button
            variant="outline"
            onClick={() => setIsDeletingTask(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteTaskModal;