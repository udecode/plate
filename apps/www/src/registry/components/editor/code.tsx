'use client';

import { type CodePlugin, type PlateLeafProps, PlateLeaf } from 'platejs/react';
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
