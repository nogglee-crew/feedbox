import { Tag } from "@/components/ui/badge";

export function PlanBadge({ paid }: { paid: boolean }) {
  return <Tag tone={paid ? "success" : "neutral"}>{paid ? "Pro" : "Free"}</Tag>;
}
