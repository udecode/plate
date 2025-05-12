'use client';

import * as React from 'react';

import type { PlateLeafProps } from '@udecode/plate/react';

import { PlateLeaf } from '@udecode/plate/react';

export function CodeLeaf(props: PlateLeafProps) {
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
