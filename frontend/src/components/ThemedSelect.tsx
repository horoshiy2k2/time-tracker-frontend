import { useEffect, useMemo, useRef, useState } from "react";

type Option = {
  value: string;
  label: string;
};

type ThemedSelectProps = {
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  accentColor: string;
  isNightMode?: boolean;
  className?: string;
};

const hexToRgba = (hex: string, alpha: number) => {
  const normalized = hex.replace("#", "");
  const full =
    normalized.length === 3
      ? normalized
          .split("")
          .map((ch) => ch + ch)
          .join("")
      : normalized;

  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);

  if ([r, g, b].some((n) => Number.isNaN(n))) {
    return `rgba(100,108,255,${alpha})`;
  }

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default function ThemedSelect({
  value,
  options,
  onChange,
  disabled = false,
  placeholder = "Select",
  accentColor,
  isNightMode = false,
  className,
}: ThemedSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const selected = useMemo(() => options.find((opt) => opt.value === value), [options, value]);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);

    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

  const surfaceColor = isNightMode
    ? "linear-gradient(145deg, #171c26, #10141c)"
    : "linear-gradient(145deg, #ffffff, #f5f8ff)";

  const border = isNightMode ? "#2e3442" : "#d5d9e2";

  return (
    <div className={className} ref={rootRef} style={{ position: "relative" }}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{
          width: "100%",
          margin: 0,
          minHeight: "48px",
          borderRadius: "14px",
          border: `1px solid ${open ? accentColor : border}`,
          background: surfaceColor,
          color: isNightMode ? "#f2f5ff" : "#1f2937",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.65em 0.9em",
          boxShadow: open ? `0 0 0 4px ${hexToRgba(accentColor, 0.2)}` : "none",
          transition: "all 0.2s ease",
          cursor: disabled ? "not-allowed" : "pointer",
          fontWeight: 600,
        }}
      >
        <span>{selected?.label || placeholder}</span>
        <span style={{ color: accentColor, transform: open ? "rotate(180deg)" : "none", transition: "0.2s" }}>▾</span>
      </button>

      {open && !disabled && (
        <ul
          role="listbox"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            right: 0,
            listStyle: "none",
            margin: 0,
            padding: "0.4em",
            borderRadius: "14px",
            border: `1px solid ${hexToRgba(accentColor, 0.45)}`,
            background: isNightMode ? "#131925" : "#ffffff",
            boxShadow: `0 16px 38px ${hexToRgba(accentColor, 0.25)}`,
            maxHeight: "220px",
            overflowY: "auto",
            zIndex: 40,
          }}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <li key={opt.value || "empty-option"}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  style={{
                    width: "100%",
                    margin: 0,
                    textAlign: "left",
                    border: "none",
                    borderRadius: "10px",
                    padding: "0.65em 0.7em",
                    background: isSelected
                      ? hexToRgba(accentColor, isNightMode ? 0.35 : 0.18)
                      : "transparent",
                    color: isNightMode ? "#e5e7eb" : "#111827",
                    fontWeight: isSelected ? 700 : 500,
                  }}
                >
                  {opt.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
