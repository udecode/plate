import * as React from 'react';

import type { SlateLeafProps } from 'platejs';

import { SlateLeaf } from 'platejs';

export function CodeLeafStatic(props: SlateLeafProps) {
  return (
    <SlateLeaf
      {...props}
      as="code"
      className="rounded-md bg-muted px-[0.3em] py-[0.2em] font-mono text-sm whitespace-pre-wrap"
    >
      {props.children}
    </SlateLeaf>
  );
}
