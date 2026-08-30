'use client';

import type { FindReplacePlugin } from 'platejs/find-replace';
import { type PlateLeafProps, PlateLeaf } from 'platejs/react';

export function SearchHighlightLeaf(
  props: PlateLeafProps<typeof FindReplacePlugin>
) {
  return <PlateLeaf {...props} className="bg-yellow-100" />;
}
