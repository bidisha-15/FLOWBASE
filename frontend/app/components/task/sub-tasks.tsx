import type { Subtask } from "@/types";
import { useState } from "react";
import { Checkbox } from "../ui/checkbox";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  useAddSubTaskMutation,
  useUpdateSubTaskMutation,
} from "@/hooks/use-task";
import { toast } from "sonner";

export const SubTasksDetails = ({
  subTasks,
  taskId,
}: {
  subTasks: Subtask[];
  taskId: string;
}) => {
  const [newSubTask, setNewSubTask] = useState("");
  const { mutate: addSubTask, isPending } = useAddSubTaskMutation();
  const { mutate: updateSubTask, isPending: isUpdating } =
    useUpdateSubTaskMutation();

  const handleToggleTask = (subTaskId: string, checked: boolean) => {
    updateSubTask(
      { taskId, subTaskId, completed: checked },
      {
        onSuccess: () => {
          toast.success("Sub task updated successfully");
        },
        onError: (error: any) => {
          const errMessage = error?.response?.data?.message || error?.message || "Failed to update sub task";
          console.error("Update subtask error:", error);
          toast.error(errMessage);
        },
      }
    );
  };

  const handleAddSubTask = () => {
    if (!newSubTask.trim()) {
      toast.error("Sub task title cannot be empty");
      return;
    }
    
    addSubTask(
      { taskId, title: newSubTask.trim() },
      {
        onSuccess: () => {
          setNewSubTask("");
          toast.success("Sub task added successfully");
        },
        onError: (error: any) => {
          const errMessage = error?.response?.data?.message || error?.message || "Failed to add sub task";
          console.error("Add subtask error:", error);
          toast.error(errMessage);
        },
      }
    );
  };

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-muted-foreground mb-0">
        Sub Tasks
      </h3>

      <div className="space-y-2 mb-4">
        {subTasks.length > 0 ? (
          subTasks.map((subTask) => (
            <div key={subTask._id} className="flex items-center space-x-2">
              <Checkbox
                id={subTask._id}
                checked={subTask.completed}
                onCheckedChange={(checked) =>
                  handleToggleTask(subTask._id, !!checked)
                }
                disabled={isUpdating}
              />

              <label
                htmlFor={subTask._id}
                className={cn(
                  "text-sm cursor-pointer",
                  subTask.completed ? "line-through text-muted-foreground" : ""
                )}
              >
                {subTask.title}
              </label>
            </div>
          ))
        ) : (
          <div className="text-sm text-muted-foreground">No sub tasks</div>
        )}
      </div>

      <div className="flex ">
        <Input
          placeholder="Add a sub task"
          value={newSubTask}
          onChange={(e) => setNewSubTask(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !isPending && newSubTask.trim()) {
              handleAddSubTask();
            }
          }}
          className="mr-1"
          disabled={isPending}
        />

        <Button
          onClick={handleAddSubTask}
          disabled={isPending || !newSubTask.trim()}
        >
          Add
        </Button>
      </div>
    </div>
  );
};