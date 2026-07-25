import { AlertCircle, CalendarDays } from "lucide-react";

interface ModuleStateProps {
  readonly kind: "empty" | "error";
  readonly title: string;
  readonly detail: string;
}

export function ModuleState({ kind, title, detail }: ModuleStateProps) {
  const Icon = kind === "error" ? AlertCircle : CalendarDays;

  return (
    <div className={`module-state module-state--${kind}`} role={kind === "error" ? "status" : undefined}>
      <Icon aria-hidden="true" size={22} strokeWidth={1.5} />
      <div>
        <h3>{title}</h3>
        <p>{detail}</p>
      </div>
    </div>
  );
}
