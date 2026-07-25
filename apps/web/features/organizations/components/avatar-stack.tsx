import { Avatar } from "@/components/ui/avatar";
import type { OrgMemberProfile } from "@/lib/types";

export function MemberAvatar({ member, className }: { member: OrgMemberProfile; className?: string }) {
  return <Avatar name={member.name ?? member.email} src={member.avatar_url} ring size="lg" className={className} />;
}

export function AvatarStack({ members, max = 5 }: { members: OrgMemberProfile[]; max?: number }) {
  const shown = members.slice(0, max);
  const rest = members.length - shown.length;
  return (
    <div className="flex items-center">
      <div className="flex">
        {shown.map((member, i) => (
          <MemberAvatar key={member.email} member={member} className={i > 0 ? "-ml-2" : ""} />
        ))}
      </div>
      {rest > 0 && <span className="ml-1.5 text-xs text-subtle">+{rest}</span>}
      <span className="ml-2 text-xs text-muted">{members.length}명</span>
    </div>
  );
}
