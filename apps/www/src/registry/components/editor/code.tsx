'use client';

import type { CodePlugin } from '@platejs/basic-nodes/react';
import type { PlateLeafProps } from 'platejs/react';
import { PlateLeaf } from 'platejs/react';
import * as React from 'react';

export function CodeLeaf(props: PlateLeafProps<typeof CodePlugin>) {
  return (
    <PlateLeaf
      {...props}
      as="code"
      className="rounded-md bg-muted px-[0.3em] py-[0.2em] font-mono text-sm whitespace-pre-wrap"
    >
      {props.children}
    </PlateLeaf>
  );
}
