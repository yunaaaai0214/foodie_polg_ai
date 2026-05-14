import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--olive)]">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-[var(--ink-subtle)]">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

