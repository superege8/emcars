interface Props {
  min: number;
  max: number;
  step?: number;
  valueMin: number;
  valueMax: number;
  onChange: (min: number, max: number) => void;
}

export default function DualRangeSlider({ min, max, step = 1, valueMin, valueMax, onChange }: Props) {
  const span = Math.max(max - min, 1);
  const minPct = ((valueMin - min) / span) * 100;
  const maxPct = ((valueMax - min) / span) * 100;

  function handleMinChange(next: number) {
    onChange(Math.min(next, valueMax - step), valueMax);
  }

  function handleMaxChange(next: number) {
    onChange(valueMin, Math.max(next, valueMin + step));
  }

  return (
    <div className="range-slider relative h-5">
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 rounded-full bg-ink/10" />
      <div
        className="absolute top-1/2 -translate-y-1/2 h-1 rounded-full bg-ink"
        style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={valueMin}
        onChange={(e) => handleMinChange(Number(e.target.value))}
        aria-label="Fra"
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={valueMax}
        onChange={(e) => handleMaxChange(Number(e.target.value))}
        aria-label="Til"
      />
    </div>
  );
}
