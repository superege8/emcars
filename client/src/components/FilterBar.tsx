import { useEffect, useRef, useState } from "react";
import { FilterOption, FilterOptions } from "../types";
import DualRangeSlider from "./DualRangeSlider";

export interface FilterState {
  make: string[];
  model: string[];
  fuel: string[];
  transmission: string[];
  price: [number, number] | null;
  year: [number, number] | null;
  km: [number, number] | null;
  q: string;
  sort: string;
}

export const emptyFilters: FilterState = {
  make: [],
  model: [],
  fuel: [],
  transmission: [],
  price: null,
  year: null,
  km: null,
  q: "",
  sort: "newest",
};

export function hasActiveFilters(f: FilterState): boolean {
  return (
    f.make.length > 0 ||
    f.model.length > 0 ||
    f.fuel.length > 0 ||
    f.transmission.length > 0 ||
    f.price !== null ||
    f.year !== null ||
    f.km !== null ||
    f.q.trim() !== ""
  );
}

const fuelLabels: Record<string, string> = {
  BENZIN: "Benzin",
  DIESEL: "Diesel",
  EL: "El",
  HYBRID: "Hybrid",
  PLUGIN_HYBRID: "Plugin-hybrid",
};

const transmissionLabels: Record<string, string> = {
  MANUEL: "Manuel",
  AUTOMATIK: "Automatik",
};

function useClickOutside(onOutside: () => void) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onOutside();
      }
    }

    document.addEventListener("mousedown", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, [onOutside]);

  return ref;
}

function FilterButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium transition-all duration-200 ease-out whitespace-nowrap hover:-translate-y-0.5 ${
        active
          ? "border-white/20 bg-white text-[#131316]"
          : "border-white/10 bg-[#1c1c1f] text-white/75 hover:border-white/25 hover:text-white"
      }`}
    >
      {label}

      <svg
        width="10"
        height="6"
        viewBox="0 0 10 6"
        fill="none"
        className={active ? "opacity-60" : "opacity-40"}
      >
        <path
          d="M1 1L5 5L9 1"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

function MultiSelectFilter({
  label,
  options,
  selected,
  onChange,
  formatOption = (v: string) => v,
}: {
  label: string;
  options: FilterOption[];
  selected: string[];
  onChange: (next: string[]) => void;
  formatOption?: (value: string) => string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside(() => setOpen(false));

  function toggle(value: string) {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value]
    );
  }

  const buttonLabel =
    selected.length === 0
      ? label
      : selected.length <= 2
      ? `${label} · ${selected.map(formatOption).join(", ")}`
      : `${label} · ${selected.length} valgt`;

  return (
    <div className="relative" ref={ref}>
      <FilterButton
        label={buttonLabel}
        active={selected.length > 0}
        onClick={() => setOpen((o) => !o)}
      />

      {open && (
        <div className="absolute z-30 mt-2 w-64 rounded-lg border border-white/10 bg-[#1c1c1f] p-3 text-white shadow-xl animate-pop-in origin-top">
          {options.length === 0 ? (
            <p className="px-2 py-3 text-sm text-white/40">
              Ingen muligheder.
            </p>
          ) : (
            <div className="max-h-64 overflow-y-auto space-y-0.5">
              {options.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center justify-between gap-3 rounded-md px-2 py-2 text-sm text-white/80 hover:bg-white/5 cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={selected.includes(opt.value)}
                      onChange={() => toggle(opt.value)}
                      className="h-4 w-4 rounded-sm border-white/30 bg-[#131316] text-white focus:ring-white/20"
                    />

                    {formatOption(opt.value)}
                  </span>

                  <span className="text-xs text-white/35">
                    {opt.count}
                  </span>
                </label>
              ))}
            </div>
          )}

          {selected.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="mt-2 w-full border-t border-white/10 pt-2 text-xs font-medium text-white/50 hover:text-white"
            >
              Nulstil
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function RangeFilter({
  label,
  bounds,
  value,
  onChange,
  step = 1,
  formatValue = (v: number) => String(v),
}: {
  label: string;
  bounds: [number, number];
  value: [number, number] | null;
  onChange: (next: [number, number] | null) => void;
  step?: number;
  formatValue?: (v: number) => string;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<[number, number]>(
    value ?? bounds
  );

  const commitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function commit(
    next: [number, number],
    immediate = false
  ) {
    const isFullRange =
      next[0] <= bounds[0] &&
      next[1] >= bounds[1];

    const doCommit = () =>
      onChange(isFullRange ? null : next);

    if (commitTimer.current) {
      clearTimeout(commitTimer.current);
    }

    if (immediate) {
      doCommit();
    } else {
      commitTimer.current = setTimeout(doCommit, 250);
    }
  }

  const ref = useClickOutside(() => {
    if (open) {
      commit(draft, true);
    }

    setOpen(false);
  });

  useEffect(() => {
    if (open) {
      setDraft(value ?? bounds);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function updateDraft(next: [number, number]) {
    setDraft(next);
    commit(next);
  }

  function reset() {
    setDraft(bounds);
    onChange(null);
    setOpen(false);
  }

  const buttonLabel = value
    ? `${label} · ${formatValue(value[0])}–${formatValue(value[1])}`
    : label;

  return (
    <div className="relative" ref={ref}>
      <FilterButton
        label={buttonLabel}
        active={value !== null}
        onClick={() => setOpen((o) => !o)}
      />

      {open && (
        <div className="absolute z-30 mt-2 w-72 rounded-lg border border-white/10 bg-[#1c1c1f] p-5 text-white shadow-xl animate-pop-in origin-top">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <label className="mb-1 block text-xs text-white/50">
                Fra
              </label>

              <input
                type="number"
                className="input w-28 !border-white/10 !bg-[#131316] !text-white"
                value={draft[0]}
                onChange={(e) =>
                  updateDraft([
                    Number(e.target.value),
                    draft[1],
                  ])
                }
              />
            </div>

            <span className="text-white/30 mt-4">
              —
            </span>

            <div>
              <label className="mb-1 block text-xs text-white/50">
                Til
              </label>

              <input
                type="number"
                className="input w-28 !border-white/10 !bg-[#131316] !text-white"
                value={draft[1]}
                onChange={(e) =>
                  updateDraft([
                    draft[0],
                    Number(e.target.value),
                  ])
                }
              />
            </div>
          </div>

          <DualRangeSlider
            min={bounds[0]}
            max={bounds[1]}
            step={step}
            valueMin={draft[0]}
            valueMax={draft[1]}
            onChange={(min, max) =>
              updateDraft([min, max])
            }
          />

          <button
            type="button"
            onClick={reset}
            className="mt-5 w-full border-t border-white/10 pt-3 text-xs font-medium text-white/50 hover:text-white"
          >
            Nulstil
          </button>
        </div>
      )}
    </div>
  );
}

export default function FilterBar({
  options,
  value,
  onChange,
}: {
  options: FilterOptions | null;
  value: FilterState;
  onChange: (next: FilterState) => void;
}) {
  const priceBounds: [number, number] =
    options?.priceRange ?? [0, 1_000_000];

  const yearBounds: [number, number] =
    options?.yearRange ?? [1990, new Date().getFullYear()];

  const kmBounds: [number, number] =
    options?.kmRange ?? [0, 300_000];

  return (
    <div className="rounded-xl border border-white/10 bg-[#1c1c1f] p-4 text-white">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <input
          className="input lg:w-56 !border-white/10 !bg-[#131316] !text-white"
          placeholder="Søg på mærke eller model..."
          value={value.q}
          onChange={(e) =>
            onChange({
              ...value,
              q: e.target.value,
            })
          }
        />

        <div className="flex flex-wrap gap-2.5">
          <MultiSelectFilter
            label="Mærke"
            options={options?.makes ?? []}
            selected={value.make}
            onChange={(make) =>
              onChange({
                ...value,
                make,
              })
            }
          />

          <MultiSelectFilter
            label="Model"
            options={options?.models ?? []}
            selected={value.model}
            onChange={(model) =>
              onChange({
                ...value,
                model,
              })
            }
          />

          <RangeFilter
            label="Pris"
            bounds={priceBounds}
            value={value.price}
            step={5000}
            formatValue={(v) =>
              `${v.toLocaleString("da-DK")} kr.`
            }
            onChange={(price) =>
              onChange({
                ...value,
                price,
              })
            }
          />

          <RangeFilter
            label="Årgang"
            bounds={yearBounds}
            value={value.year}
            onChange={(year) =>
              onChange({
                ...value,
                year,
              })
            }
          />

          <RangeFilter
            label="Kilometer"
            bounds={kmBounds}
            value={value.km}
            step={1000}
            formatValue={(v) =>
              `${v.toLocaleString("da-DK")} km`
            }
            onChange={(km) =>
              onChange({
                ...value,
                km,
              })
            }
          />

          <MultiSelectFilter
            label="Brændstof"
            options={options?.fuels ?? []}
            selected={value.fuel}
            formatOption={(v) =>
              fuelLabels[v] || v
            }
            onChange={(fuel) =>
              onChange({
                ...value,
                fuel,
              })
            }
          />

          <MultiSelectFilter
            label="Gearkasse"
            options={options?.transmissions ?? []}
            selected={value.transmission}
            formatOption={(v) =>
              transmissionLabels[v] || v
            }
            onChange={(transmission) =>
              onChange({
                ...value,
                transmission,
              })
            }
          />

          {hasActiveFilters(value) && (
            <button
              type="button"
              onClick={() =>
                onChange({
                  ...emptyFilters,
                  sort: value.sort,
                })
              }
              className="text-sm font-medium text-white/50 hover:text-white px-2"
            >
              Nulstil filtre
            </button>
          )}
        </div>
      </div>
    </div>
  );
}