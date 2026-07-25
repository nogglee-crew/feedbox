import { Tag } from "@/components/ui/badge";

export function RoleBadge({ role }: { role: "owner" | "member" }) {
  return <Tag tone={role === "owner" ? "primary" : "neutral"}>{role}</Tag>;
}
