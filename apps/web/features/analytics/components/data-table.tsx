import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/components/ui/cn";

export interface Column<T> {
  header: string;
  align?: "left" | "right";
  /** 좁은 화면에서 가로 스크롤 대신 감출 보조 컬럼 */
  secondary?: boolean;
  cell: (row: T) => ReactNode;
}

/**
 * 운영 화면의 목록 표.
 * 다섯 패널이 같은 골격을 쓰므로 헤더·빈 상태·가로 스크롤 처리를 한 곳에 둔다.
 */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  empty = "데이터가 없습니다.",
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  empty?: string;
}) {
  if (rows.length === 0) {
    return (
      <Card padding="sm">
        <p className="text-sm text-muted">{empty}</p>
      </Card>
    );
  }

  return (
    <Card padding="none">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted">
              {columns.map((column) => (
                <th
                  key={column.header}
                  scope="col"
                  className={cn(
                    "whitespace-nowrap px-4 py-2 font-medium",
                    column.align === "right" && "text-right",
                    column.secondary && "hidden lg:table-cell",
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={rowKey(row)} className="border-b border-border last:border-0 align-top">
                {columns.map((column) => (
                  <td
                    key={column.header}
                    className={cn(
                      "px-4 py-2",
                      column.align === "right" && "text-right tabular-nums",
                      column.secondary && "hidden lg:table-cell",
                    )}
                  >
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
