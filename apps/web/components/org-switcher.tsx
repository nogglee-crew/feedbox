"use client";

import { setActiveOrg } from "@/app/org-actions";

export function OrgSwitcher({
  orgs,
  activeId,
}: {
  orgs: { id: string; name: string }[];
  activeId: string;
}) {
  if (orgs.length <= 1) {
    return <span className="text-sm font-semibold text-gray-700">{orgs[0]?.name}</span>;
  }
  return (
    <form action={setActiveOrg}>
      <select
        name="org_id"
        defaultValue={activeId}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="rounded-md border border-gray-300 px-2 py-1 text-sm font-semibold"
      >
        {orgs.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>
    </form>
  );
}
