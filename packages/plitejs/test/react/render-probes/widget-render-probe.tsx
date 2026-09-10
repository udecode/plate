import { NodeApi } from 'plitejs';
import React from 'react';

import { useEditorSelector } from '../../../src/react';

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
  const value = useEditorSelector((editor) =>
    editor.read((state) => {
      const entry = state.nodes.get([slot === 'left' ? 0 : 1]);
      return entry ? NodeApi.string(entry[0]) : '';
    })
  );

  // This probe intentionally records renders without scheduling another render.
  counts[slot] += 1;

  return <span id={`${slot}-text`}>{value}</span>;
}
