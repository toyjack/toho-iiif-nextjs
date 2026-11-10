import type { ReactNode } from "react";

/**
 * Label + control + optional hint (§4.2). The control must carry
 * `id={htmlFor}` and, when there is a hint, `aria-describedby={`${htmlFor}-hint`}`.
 */
export default function Field({
  label,
  htmlFor,
  hint,
  hideLabel = false,
  children,
}: {
  label: ReactNode;
  htmlFor: string;
  hint?: ReactNode;
  /** keep the label for assistive technology only (the control is self-evident) */
  hideLabel?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className={hideLabel ? "sr-only" : "text-xs leading-[1.4] font-bold text-muted"}>
        {label}
      </label>
      {children}
      {hint && (
        <p id={`${htmlFor}-hint`} className="text-[0.8125rem] leading-normal text-muted">
          {hint}
        </p>
      )}
    </div>
  );
}
