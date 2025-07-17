import type { ActionType } from "@/types";
import {
  Building2,
  CheckCircle,
  CheckCircle2,
  CheckSquare,
  Eye,
  EyeOff,
  FileEdit,
  FolderEdit,
  FolderPlus,
  LogIn,
  MessageSquare,
  Plus,
  Trash2,
  Upload,
  UserMinus,
  UserPlus,
  Activity,
} from "lucide-react";

export const getActivityIcon = (action: ActionType) => {
  switch (action) {
    case "task_created":
      return (
        <div className="bg-green-100 p-2 rounded-full">
          <Plus className="h-4 w-4 text-green-600" />
        </div>
      );
    case "subtask_created":
      return (
        <div className="bg-emerald-100 p-2 rounded-full">
          <CheckSquare className="h-4 w-4 text-emerald-600" />
        </div>
      );
    case "task_updated":
      return (
        <div className="bg-blue-100 p-2 rounded-full">
          <FileEdit className="h-4 w-4 text-blue-600" />
        </div>
      );
    case "subtask_updated":
      return (
        <div className="bg-indigo-100 p-2 rounded-full">
          <CheckCircle className="h-4 w-4 text-indigo-600" />
        </div>
      );
    case "task_completed":
      return (
        <div className="bg-green-100 p-2 rounded-full">
          <CheckCircle className="h-4 w-4 text-green-600" />
        </div>
      );
    case "task_deleted":
      return (
        <div className="bg-red-100 p-2 rounded-full">
          <Trash2 className="h-4 w-4 text-red-600" />
        </div>
      );
    case "task_watched":
      return (
        <div className="bg-purple-100 p-2 rounded-full">
          <Eye className="h-4 w-4 text-purple-600" />
        </div>
      );
    case "project_created":
      return (
        <div className="bg-blue-100 p-2 rounded-full">
          <FolderPlus className="h-4 w-4 text-blue-600" />
        </div>
      );
    case "project_updated":
      return (
        <div className="bg-blue-100 p-2 rounded-full">
          <FolderEdit className="h-4 w-4 text-blue-600" />
        </div>
      );
    case "project_deleted":
      return (
        <div className="bg-red-100 p-2 rounded-full">
          <Trash2 className="h-4 w-4 text-red-600" />
        </div>
      );
    case "workspace_created":
      return (
        <div className="bg-blue-100 p-2 rounded-full">
          <Building2 className="h-4 w-4 text-blue-600" />
        </div>
      );
    case "workspace_updated":
      return (
        <div className="bg-blue-100 p-2 rounded-full">
          <Building2 className="h-4 w-4 text-blue-600" />
        </div>
      );
    case "comment_added":
      return (
        <div className="bg-orange-100 p-2 rounded-full">
          <MessageSquare className="h-4 w-4 text-orange-600" />
        </div>
      );
    case "member_added":
      return (
        <div className="bg-green-100 p-2 rounded-full">
          <UserPlus className="h-4 w-4 text-green-600" />
        </div>
      );
    case "member_removed":
      return (
        <div className="bg-red-100 p-2 rounded-full">
          <UserMinus className="h-4 w-4 text-red-600" />
        </div>
      );
    case "file_uploaded":
      return (
        <div className="bg-gray-100 p-2 rounded-full">
          <Upload className="h-4 w-4 text-gray-600" />
        </div>
      );
    default:
      return (
        <div className="bg-gray-100 p-2 rounded-full">
          <Activity className="h-4 w-4 text-gray-600" />
        </div>
      );
  }
};