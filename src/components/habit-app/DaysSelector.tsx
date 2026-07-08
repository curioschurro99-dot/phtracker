import { ALL_DAYS, DAYS, WEEKDAYS, WEEKENDS } from "@/lib/habit-data";
import { COLORS } from "./ui";

export function DaysSelector({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (d: string) => {
    onChange(value.includes(d) ? value.filter((x) => x !== d) : [...value, d]);
  };
  return (
    <div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
        <PresetBtn label="Every day" onClick={() => onChange(ALL_DAYS)} />
        <PresetBtn label="Weekdays" onClick={() => onChange(WEEKDAYS)} />
        <PresetBtn label="Weekends" onClick={() => onChange(WEEKENDS)} />
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {DAYS.map((d) => {
          const on = value.includes(d);
          return (
            <button
              key={d}
              type="button"
              onClick={() => toggle(d)}
              style={{
                border: `1px solid ${on ? COLORS.text : COLORS.border}`,
                background: on ? COLORS.text : "#fff",
                color: on ? "#fff" : COLORS.sub,
                borderRadius: 999,
                padding: "6px 12px",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PresetBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: `1px solid ${COLORS.border}`,
        background: "#fff",
        color: COLORS.text,
        borderRadius: 999,
        padding: "5px 12px",
        fontSize: 12,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}
