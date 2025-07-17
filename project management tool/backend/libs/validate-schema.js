import { z } from "zod";
export const registerSchema = z.object({
    name: z.string().min(3, { message: "Name is required" }),
    email:z.string().email("Invalid email address"),
    password:z.string().min(6,  "Password is required" ),
});

export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, { message: "Password is required" }),
});

export const verifyEmailSchema = z.object({
    token: z.string().min(1, { message: "Token is required" }),
});

export const resetPasswordSchema = z.object({
    token:z.string().min(1, { message: "Token is required" }),
    newPassword: z.string().min(6, { message: "Password is required" }),
    confirmPassword: z.string().min(6, { message: "Confirm Password is required" }),
});

export const emailSchema = z.object({
    email: z.string().email("Invalid email address"),
});

export const workspaceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  color: z.string().min(1, "Color is required"),
});

export const projectSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  status: z.enum(["Planning", "In Progress", "On Hold", "Completed", "Cancelled"]),
  startDate: z.string().min(1, "Start date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  members: z.array(z.object({
    user: z.string(),
    role: z.enum(["manager", "contributor", "viewer"]),
  })).optional(),
  tags: z.string().optional(),
});

export const inviteMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const tokenSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

export const taskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional(),
  status: z.enum(["To Do", "In Progress", "Done"]),
  priority: z.enum(["Low", "Medium", "High"]),
  dueDate: z.string().optional(),
  assignees: z.array(z.string()).optional(),
});