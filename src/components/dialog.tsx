// Used inside the client component books.tsx, so it needs no "use client" of its own.
import { useEffect, useId, useRef, type ReactNode } from "react";
import { UI } from "@/lib/ui-text";
import Icon from "./icon";

/**
 * Native <dialog> opened with showModal() (§4.5): focus trap, Esc and an
 * inert background come from the browser. Focus returns to whatever had it
 * before opening. Slides up from the bottom below `sm`.
 */
export default function Dialog({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      returnTo.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      // Focuses the first control (globals.css keeps the opening modal visible for this).
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      className="modal modal-bottom sm:modal-middle"
      // Esc, the backdrop button and our own close button all end up here.
      onClose={() => {
        onClose();
        returnTo.current?.focus();
      }}
    >
      <div className="modal-box flex max-h-[85dvh] flex-col gap-0 p-0 shadow-xl sm:max-w-md">
        <div className="flex items-center justify-between gap-2 border-b border-base-300 py-2 pr-2 pl-4">
          <h2 id={titleId} className="font-serif text-xl leading-[1.4] font-bold">
            {title}
          </h2>
          <form method="dialog">
            <button type="submit" className="btn btn-ghost btn-square" aria-label={UI.close}>
              <Icon name="close" size={20} />
            </button>
          </form>
        </div>
        <div className="overflow-y-auto p-4">{children}</div>
        {footer && <div className="border-t border-base-300 p-4">{footer}</div>}
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="submit" tabIndex={-1} aria-hidden="true">
          {UI.close}
        </button>
      </form>
    </dialog>
  );
}
