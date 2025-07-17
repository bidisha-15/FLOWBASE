import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: [
      'task_created', 'task_updated', 'task_completed', 'task_deleted', 'task_watched',
      'subtask_created', 'subtask_updated',
      'project_created', 'project_updated', 'project_deleted',
      'workspace_created', 'workspace_updated', 'member_added', 'member_removed',
      'comment_added', 'file_uploaded'
    ]
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'resourceType'
  },
  resourceType: {
    type: String,
    required: true,
    enum: ['Task', 'Project', 'Workspace', 'User']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient querying
activityLogSchema.index({ resourceId: 1, resourceType: 1, timestamp: -1 });
activityLogSchema.index({ user: 1, timestamp: -1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

export default ActivityLog;
