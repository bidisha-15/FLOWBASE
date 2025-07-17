import { fetchData } from "@/lib/fetch-util";
import { useQuery } from "@tanstack/react-query";
import { Loader } from "../loader";
import type { ActivityLog } from "@/types";
import { getActivityIcon } from "./task-icon";
import { Activity } from "lucide-react";

export const TaskActivity = ({ resourceId }: { resourceId: string }) => {
  const { data, isPending } = useQuery({
    queryKey: ["task-activity", resourceId],
    queryFn: () => fetchData(`/tasks/${resourceId}/activity`),
  }) as {
    data: ActivityLog[];
    isPending: boolean;
  };

  if (isPending) return <Loader />;

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-lg font-medium">Activity</h3>
      </div>

      <div className="space-y-4">
        {data?.map((activity) => (
          <div key={activity._id} className="flex gap-3">
            <div className="flex-shrink-0">
              {getActivityIcon(activity.type)}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm">
                <span className="font-medium">{activity.user.name}</span>{" "}
                {activity.details?.description}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(activity.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};