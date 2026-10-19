'use client';

import { useSearchParams } from 'next/navigation';
import * as React from 'react';

import {
  type SelectItem,
  SelectEditor,
} from '@/registry/components/editor/select-editor';

// Every tenth item is a Zeta, so typing z narrows the open list to a strict
// subset, and Target is never a chip.
const createCatalog = (size: number): SelectItem[] => [
  ...Array.from({ length: size }, (_, index) => ({
    value: `${(index + 1) % 10 === 0 ? 'Zeta' : 'Item'} ${String(index + 1).padStart(5, '0')}`,
  })),
  { value: 'Target' },
];

function SelectEditorScale() {
  const params = useSearchParams();
  const size = Number(params?.get('items') ?? 20);
  const chips = Number(params?.get('chips') ?? 1);
  const formRefusesChanges = params?.get('refuse') === '1';
  const items = React.useMemo(() => createCatalog(size), [size]);
  const initial = React.useMemo(() => items.slice(0, chips), [items, chips]);
  const [mount, setMount] = React.useState(0);
  const [value, setValue] = React.useState(initial);

  return (
    <main
      className="p-8"
      data-scale-catalog={items.length}
      data-scale-chips={value.length}
      data-scale-last={value.at(-1)?.value ?? ''}
      data-scale-mount={mount}
    >
      <button
        data-scale-remount=""
        type="button"
        onClick={() => {
          setValue(initial);
          setMount((count) => count + 1);
        }}
      >
        Remount
      </button>
      <div className="mt-4 w-[480px]">
        <SelectEditor
          key={mount}
          aria-label="Labels"
          items={items}
          placeholder="Select labels..."
          value={value}
          onValueChange={formRefusesChanges ? undefined : setValue}
        />
      </div>
    </main>
  );
}

export default function SelectEditorScalePage() {
  return (
    <React.Suspense fallback={<p>Loading select editor scale probe…</p>}>
      <SelectEditorScale />
    </React.Suspense>
  );
}
