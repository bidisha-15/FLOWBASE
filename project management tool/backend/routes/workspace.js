import express from "express";
import { validateRequest } from "zod-express-middleware";
import {
  createWorkspace,
  getWorkspaces,
  getWorkspaceDetails,
  getWorkspaceProjects,
  getWorkspaceStats,
  acceptInviteByToken,
  inviteUserToWorkspace,
  acceptGeneralInvite,
  getArchivedItems,
  deleteWorkspace,
  transferWorkspace,
  updateWorkspace
} from "../controllers/workspace.js";
import {
  inviteMemberSchema,
  workspaceSchema,
} from "../libs/validate-schema.js";
import authMiddleware from "../middleware/auth-middleware.js";
import { z } from "zod";
const router = express.Router();

router.post(
  "/",
  authMiddleware,
  validateRequest({ body: workspaceSchema }),
  createWorkspace
);

router.post(
  "/accept-invite-token",
  authMiddleware,
  validateRequest({ body: z.object({ token: z.string() }) }),
  acceptInviteByToken
);

router.post(
  "/:workspaceId/invite-member",
  authMiddleware,
  validateRequest({
    params: z.object({ workspaceId: z.string() }),
    body: inviteMemberSchema,
  }),
  inviteUserToWorkspace
);

router.post(
  "/:workspaceId/accept-general-invite",
  authMiddleware,
  validateRequest({ params: z.object({ workspaceId: z.string() }) }),
  acceptGeneralInvite
);

router.get("/", authMiddleware, getWorkspaces);

router.get("/:workspaceId", authMiddleware, getWorkspaceDetails);
router.get("/:workspaceId/projects", authMiddleware, getWorkspaceProjects);
router.get("/:workspaceId/stats", authMiddleware, getWorkspaceStats);
router.get("/:workspaceId/archived-items", authMiddleware, getArchivedItems);

router.post(
  "/:workspaceId/update",
  authMiddleware,
  validateRequest({
    params: z.object({ workspaceId: z.string() }),
    body: workspaceSchema,
  }),
  updateWorkspace
);

router.delete(
  "/:workspaceId/delete",
  authMiddleware,
  validateRequest({
    params: z.object({ workspaceId: z.string() }),
  }),
  deleteWorkspace
);

router.post(
  "/:workspaceId/transfer",
  authMiddleware,
  validateRequest({
    params: z.object({ workspaceId: z.string() }),
    body: z.object({
      newOwner: z.string().email(),
    }),
  }),
  transferWorkspace
);
export default router;