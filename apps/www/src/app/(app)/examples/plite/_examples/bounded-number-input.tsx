import { useState } from 'react';

import { Input } from '@/components/ui/input';

import { clampNumber } from './query-controls';

export function BoundedNumberInput({
  className,
  id,
  max,
  min,
  onValueChange,
  step,
  value,
}: {
  className?: string;
  id: string;
  max: number;
  min: number;
  onValueChange: (value: number) => void;
  step?: number;
  value: number;
}) {
  const [draft, setDraft] = useState<string | null>(null);

  const commitDraft = (raw: string) => {
    setDraft(null);

    if (raw.trim() === '') return;

    const parsed = Number(raw);

    if (Number.isFinite(parsed)) {
      const clamped = clampNumber(Math.trunc(parsed), min, max);

      if (clamped !== value) {
        onValueChange(clamped);
      }
    }
  };

  return (
    <Input
      className={className}
      id={id}
      max={max}
      min={min}
      onBlur={() => {
        if (draft !== null) {
          commitDraft(draft);
        }
      }}
      onChange={(event) => {
        const raw = event.currentTarget.value;
        const parsed = Number(raw);

        if (
          raw !== '' &&
          Number.isInteger(parsed) &&
          raw === String(parsed) &&
          parsed >= min &&
          parsed <= max
        ) {
          setDraft(null);

          if (parsed !== value) {
            onValueChange(parsed);
          }

          return;
        }

        setDraft(raw);
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' && draft !== null) {
          commitDraft(draft);
        }
      }}
      step={step}
      type="number"
      value={draft ?? value}
    />
  );
}
