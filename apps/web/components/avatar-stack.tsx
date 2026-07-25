import type { OrgMemberProfile } from "@/lib/types";

function Avatar({ member, className = "" }: { member: OrgMemberProfile; className?: string }) {
  const label = member.name ?? member.email;
  if (member.avatar_url) {
    return (
      // Google 프로필 이미지는 referrer 정책 때문에 no-referrer가 필요하다
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={member.avatar_url}
        alt={label}
        title={label}
        referrerPolicy="no-referrer"
        className={`h-7 w-7 rounded-full ring-2 ring-surface ${className}`}
      />
    );
  }
  // 아직 로그인하지 않은 초대 멤버: 이니셜 fallback
  return (
    <span
      title={label}
      className={`flex h-7 w-7 items-center justify-center rounded-full bg-primary-subtle text-xs font-bold text-primary-strong ring-2 ring-surface ${className}`}
    >
      {label.slice(0, 1).toUpperCase()}
    </span>
  );
}

/** 멤버 프로필 사진을 겹쳐서 나열한다. 예: ((( ) 3명, ( ) 1명 */
export function AvatarStack({ members, max = 5 }: { members: OrgMemberProfile[]; max?: number }) {
  const shown = members.slice(0, max);
  const rest = members.length - shown.length;
  return (
    <div className="flex items-center">
      <div className="flex">
        {shown.map((member, i) => (
          <Avatar key={member.email} member={member} className={i > 0 ? "-ml-2" : ""} />
        ))}
      </div>
      {rest > 0 && <span className="ml-1.5 text-xs text-subtle">+{rest}</span>}
      <span className="ml-2 text-xs text-muted">{members.length}명</span>
    </div>
  );
}

export { Avatar as MemberAvatar };
