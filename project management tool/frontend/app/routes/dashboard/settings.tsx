import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
// import { Loader, Loader2, SettingsIcon } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGetWorkspaceDetailsQuery } from "@/hooks/use-workspace";
import type { Task, Workspace } from "@/types";
import { useSearchParams } from "react-router";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useUpdateWorkspace, useDeleteWorkspace } from "@/hooks/use-settings";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { TransferWorkspace } from "@/components/settings/transfer-workspace";
import { DeleteWorkspace } from "@/components/settings/delete-workspace";
import { set } from "date-fns";
import { Loader } from "@/components/ui/loader";
import { AlertCircle, Loader2, SettingsIcon } from "lucide-react";

// Define 8 predefined colors
export const colorOptions = [
  "#FF5733", // Red-Orange
  "#33C1FF", // Blue
  "#28A745", // Green
  "#FFC300", // Yellow
  "#8E44AD", // Purple
  "#E67E22", // Orange
  "#2ECC71", // Light Green
  "#34495E", // Navy
];

const settingsSchema = z.object({
  name: z.string().min(1, { message: "Workspace name is required" }),
  description: z.string().optional(),
  color: z
    .string()
    .refine((value) => colorOptions.includes(value), "Invalid color selected"),
});

export type settingsFormData = z.infer<typeof settingsSchema>;

const Settings = () => {
  const [isTransferringWorkspace, setIsTransferringWorkspace] = useState(false);
  const [isDeletingWorkspace, setIsDeletingWorkspace] = useState(false);
  const [searchParams] = useSearchParams();
  const workspaceId = searchParams.get("workspaceId");
  const navigate = useNavigate();
  const isPending = false;

  const { data, isLoading } = useGetWorkspaceDetailsQuery(workspaceId!) as {
    data: Workspace;
    isLoading: boolean;
  };

  const form = useForm<settingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: data?.name || "",
      description: data?.description || "",
      color: data?.color || colorOptions[0],
    },
    values: {
      name: data?.name || "",
      description: data?.description || "",
      color: data?.color || colorOptions[0],
    },
  });

  const { mutate: updateWorkspace, isPending: isUpdatingWorkspace } =
    useUpdateWorkspace(workspaceId!);

  const handleSettingsFormSubmit = (values: settingsFormData) => {
    console.log("Form submitted with values:", values);
    updateWorkspace(
      {
        name: values.name,
        description: values.description || "",
        color: values.color,
      },
      {
        onSuccess: () => {
          toast.success("Workspace updated successfully");
        },
        onError: (error: any) => {
          const errorMessage =
            error.response?.data?.error || "Failed to update workspace";
          toast.error(errorMessage);
          console.log(error);
        },
      }
    );
  };


  if (!workspaceId || isLoading) {
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
  
  // if (isLoading)
  //   return (
  //     <div>
  //       <Loader />
  //     </div>
  //   );

  return (
    <>
      <div className="container max-w-3xl mx-auto py-8 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg font-semibold">
              <SettingsIcon className="mr-2" />
              Workspace Settings
            </CardTitle>
            <CardDescription>
              Configure your workspace settings and preferences.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSettingsFormSubmit)}
                className="grid gap-4"
              >
                <div className="space-y-4 py-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Workspace Name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Workspace Description"
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Color</FormLabel>
                        <FormControl>
                          <div className="flex gap-3 flex-wrap">
                            {colorOptions.map((color) => (
                              <div
                                key={color}
                                onClick={() => field.onChange(color)}
                                className={cn(
                                  "w-6 h-6 rounded-full cursor-pointer hover:opacity-80 transition-all duration-300",
                                  field.value === color &&
                                    "ring-2 ring-offset-2 ring-blue-500"
                                )}
                                style={{ backgroundColor: color }}
                              ></div>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-fit"
                  disabled={isUpdatingWorkspace || isPending}
                >
                  {isUpdatingWorkspace ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg font-semibold">
              Transfer Workspace
            </CardTitle>
            <CardDescription>
              Transfer ownership of the workspace to another user.
            </CardDescription>
            <Button
              variant="outline"
              onClick={() => setIsTransferringWorkspace(true)}
              className="w-fit"
            >
              Transfer Workspace
            </Button>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg font-semibold">
              Danger Zone
            </CardTitle>
            <CardDescription>
              Irreversible actions that can affect your workspace.
            </CardDescription>
            <Button
              onClick={() => setIsDeletingWorkspace(true)}
              variant="destructive"
              className="w-fit"
              disabled={isDeletingWorkspace}
            >
              {isDeletingWorkspace ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Workspace"
              )}
            </Button>
          </CardHeader>
        </Card>
      </div>
      <TransferWorkspace
        isTransferringWorkspace={isTransferringWorkspace}
        setIsTransferringWorkspace={setIsTransferringWorkspace}
      />
      <DeleteWorkspace
        isDeletingWorkspace={isDeletingWorkspace}
        setIsDeletingWorkspace={setIsDeletingWorkspace}
      />
    </>
  );
};

export default Settings;