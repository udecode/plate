import * as React from 'react';

import type { PliteLeafProps } from 'platejs/static';

import { PliteLeaf } from 'platejs/static';

export function CodeLeafStatic(props: PliteLeafProps) {
  return (
    <PliteLeaf
      {...props}
      as="code"
      className="whitespace-pre-wrap rounded-md bg-muted px-[0.3em] py-[0.2em] font-mono text-sm"
    >
      {props.children}
    </PliteLeaf>
  );
}
