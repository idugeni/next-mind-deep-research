import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-background/80">
    <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
  </div>
  );
}
