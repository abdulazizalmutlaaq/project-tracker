export const PHASES = [
  { key: "foundations_only", label: "قواعد فقط" },
  { key: "foundations_basement", label: "قواعد + قبو" },
  { key: "basement_only", label: "قبو فقط" },
];

export function phaseLabel(key) {
  return PHASES.find((p) => p.key === key)?.label || key;
}

export const STATUS_STYLES = {
  "مكتمل": "bg-green-100 text-ok",
  "قيد التنفيذ": "bg-amber-100 text-rust-600",
  "لم يبدأ": "bg-gray-100 text-idle",
  "غير محدد": "bg-gray-100 text-idle",
};
