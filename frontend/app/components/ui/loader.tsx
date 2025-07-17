import { Loader2 } from "lucide-react";

export const Loader = () => {
  return (
    <div className="flex items-center h-full justify-center min-h-screen bg-gray-100">
     <Loader2 className="w-10 h-10 animate-spin" />
    </div>
  );
}