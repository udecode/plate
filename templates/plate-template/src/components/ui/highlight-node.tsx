'use client';

import type { PlateLeafProps } from 'platejs/react';
import { PlateLeaf } from 'platejs/react';

export function HighlightLeaf(props: PlateLeafProps) {
  return (
    <PlateLeaf {...props} as="mark" className="bg-highlight/30 text-inherit">
      {props.children}
    </PlateLeaf>
  );
}
