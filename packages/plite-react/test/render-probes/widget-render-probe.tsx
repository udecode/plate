import React from 'react';

import { useEditorSelector } from '../../src';

export const createRenderCounts = () => ({
  left: 0,
  right: 0,
  selection: 0,
});

export type RenderCounts = ReturnType<typeof createRenderCounts>;

export function TextSlice({
  counts,
  slot,
}: {
  counts: RenderCounts;
  slot: 'left' | 'right';
}) {
  const value = useEditorSelector((snapshot) =>
    snapshot?.children?.[slot === 'left' ? 0 : 1] &&
    'children' in snapshot.children[slot === 'left' ? 0 : 1]
      ? String(
          (
            snapshot.children[slot === 'left' ? 0 : 1] as {
              children: Array<{ text: string }>;
            }
          ).children[0]?.text ?? ''
        )
      : ''
  );

  counts[slot] += 1;

  return <span id={`${slot}-text`}>{value}</span>;
}
