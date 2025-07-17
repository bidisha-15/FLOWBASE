import { ProjectStatus } from "@/types";
import { z } from "zod";

export const signInSchema = z.object({
    email:z.string().email(),
    password:z.string().min(6, { message: "Password is required" }),
});

export const signUpSchema = z.object({
    name: z.string().min(3, { message: "Name is required" }),
    email: z.string().email(),
    password: z.string().min(6, { message: "Password must be 6 characters long" }),
    confirmPassword: z.string().min(6, { message: "Confirm Password is required" }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})

export const resetPasswordSchema = z.object({
    newPassword: z.string().min(6, { message: "Password is required" }),
    confirmPassword: z.string().min(6, { message: "Confirm Password is required" }),
}).refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
})

export const forgotPasswordSchema = z.object({
    email: z.string().email("invalid email address"),
});

export const workspaceSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  color: z.string().min(3, "Color is required"),
  description: z.string().optional(),
});

export const projectSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  status: z.nativeEnum(ProjectStatus),
  // priority: z.enum(["Low", "Medium", "High"]),
  dueDate: z.string().optional(),
  startDate: z.string().optional(),
  members: z.array(z.object({user: z.string(), role: z.enum(["manager", "contributor", "viewer"])})).optional(),
  tags: z.string().optional(),
});

export const createTaskSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  status: z.enum(["To Do", "In Progress", "Completed"]),
  priority: z.enum(["Low", "Medium", "High"]),
  dueDate: z.string().optional(),
  assignees: z.array(z.string()).optional(),
  watchers: z.array(z.string()).optional(),
});

export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(["admin", "member", "viewer"]),
});