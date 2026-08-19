'use client';

import * as React from 'react';

import type { HighlightPlugin } from '@platejs/basic-nodes/react';
import type { PlateLeafProps } from 'platejs/react';

import { PlateLeaf } from 'platejs/react';

export function HighlightLeaf(props: PlateLeafProps<typeof HighlightPlugin>) {
  return (
    <PlateLeaf {...props} as="mark" className="bg-highlight/30 text-inherit">
      {props.children}
    </PlateLeaf>
  );
}
