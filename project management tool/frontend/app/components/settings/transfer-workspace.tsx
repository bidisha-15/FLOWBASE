import { workspaceSchema } from "@/lib/schema";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
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
import { Textarea } from "../ui/textarea";
import {
  useTransferWorkspace,
} from "@/hooks/use-workspace";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router";

interface TransferWorkspaceProps {
  isTransferringWorkspace: boolean;
  setIsTransferringWorkspace: (isTransferringWorkspace: boolean) => void;
}

const transferWorkspaceSchema = z.object({
  newOwner: z.string().email("Invalid email address"),
});

export type TransferWorkspaceForm = z.infer<typeof transferWorkspaceSchema>;

export const TransferWorkspace = ({
  isTransferringWorkspace,
  setIsTransferringWorkspace,
}: TransferWorkspaceProps) => {
  const navigate = useNavigate();
  const form = useForm<TransferWorkspaceForm>({
    resolver: zodResolver(transferWorkspaceSchema),
    defaultValues: {
      newOwner: "",
    },
  });
  const [searchParams] = useSearchParams();
  const workspaceId = searchParams.get("workspaceId");
  const { mutate, isPending } = useTransferWorkspace(workspaceId!);
  const onSubmit = (data: TransferWorkspaceForm) => {
    mutate(data, {
      onSuccess: (data: any) => {
        form.reset();
        setIsTransferringWorkspace(false);
        toast.success("Workspace transferred successfully");
        navigate(`/workspaces`);
      },
      onError: (error: any) => {
        const errorMessage = error.response.data.message;
        toast.error(errorMessage);
        console.error(error);
      },
    });
  };

  return (
    <Dialog
      open={isTransferringWorkspace}
      onOpenChange={setIsTransferringWorkspace}
      modal={true}
    >
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Transfer Workspace</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="newOwner"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Owner Email</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter new owner's email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  variant="destructive"
                  type="submit"
                  disabled={isPending}
                >
                  {isPending ? "Transferring..." : "Transfer"}
                </Button>
              </DialogFooter>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};