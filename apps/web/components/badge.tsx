const TONES = {
  indigo: "bg-indigo-50 text-indigo-700",
  gray: "bg-gray-100 text-gray-600",
  emerald: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-700",
} as const;

export type BadgeTone = keyof typeof TONES;

/** 역할(owner/member), 플랜(Free/Pro) 등 공용 배지 */
export function Badge({ tone = "gray", children }: { tone?: BadgeTone; children: React.ReactNode }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${TONES[tone]}`}>
      {children}
    </span>
  );
}

export function RoleBadge({ role }: { role: "owner" | "member" }) {
  return <Badge tone={role === "owner" ? "indigo" : "gray"}>{role}</Badge>;
}

export function PlanBadge({ paid }: { paid: boolean }) {
  return <Badge tone={paid ? "emerald" : "gray"}>{paid ? "Pro" : "Free"}</Badge>;
}
