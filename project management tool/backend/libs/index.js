import ActivityLog from "../models/activity.js";

export const recordActivity = async (type, resourceId, resourceType, userId, details = {}) => {
  try {
    const activity = new ActivityLog({
      type,
      resourceId,
      resourceType,
      user: userId,
      details,
      timestamp: new Date()
    });
    
    await activity.save();
    return activity;
  } catch (error) {
    console.error('Error recording activity:', error);
    throw error;
  }
};

export const getActivitiesByResource = async (resourceId, resourceType) => {
  try {
    const activities = await ActivityLog.find({
      resourceId,
      resourceType
    })
    .populate('user', 'name profilePicture')
    .sort({ timestamp: -1 });
    
    return activities;
  } catch (error) {
    console.error('Error fetching activities:', error);
    throw error;
  }
};
