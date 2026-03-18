import { useEffect, useMemo, useRef, useState } from "react";

type Option = { value: string; label: string };

type Props = {
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  accentColor: string;
  disabled?: boolean;
  className?: string;
};

export default function ThemedSelect({ value, options, onChange, accentColor, disabled, className }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = useMemo(() => options.find((o) => o.value === value), [options, value]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, []);

  return (
    <div className={className} ref={rootRef} style={{ ["--select-accent" as string]: accentColor } as any}>
      <button
        type="button"
        className="fancySelectTrigger"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{selected?.label || "No category"}</span>
        <span className={open ? "caret open" : "caret"}>⌄</span>
      </button>

      {open && !disabled && (
        <div className="fancySelectMenu">
          {options.map((opt) => (
            <button
              key={`${opt.value}-${opt.label}`}
              type="button"
              className={opt.value === value ? "fancySelectOption active" : "fancySelectOption"}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
