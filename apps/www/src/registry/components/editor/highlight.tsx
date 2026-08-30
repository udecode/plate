'use client';

import {
  type HighlightPlugin,
  type PlateLeafProps,
  PlateLeaf,
} from 'platejs/react';
import * as React from 'react';

export function HighlightLeaf(props: PlateLeafProps<typeof HighlightPlugin>) {
  return (
    <PlateLeaf {...props} as="mark" className="bg-highlight/30 text-inherit">
      {props.children}
    </PlateLeaf>
  );
}
