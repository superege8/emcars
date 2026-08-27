import { CarStatus } from "../types";

const styles: Record<CarStatus, string> = {
  DRAFT: "bg-ink/8 text-ink/50",
  FOR_SALE: "bg-ink text-white",
  RESERVED: "bg-accent/12 text-accent",
  SOLD: "bg-ink/8 text-ink/40",
};

const labels: Record<CarStatus, string> = {
  DRAFT: "Kladde",
  FOR_SALE: "Til salg",
  RESERVED: "Reserveret",
  SOLD: "Solgt",
};

export default function StatusBadge({ status }: { status: CarStatus }) {
  return (
    <span className={`inline-flex items-center rounded-sm px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
