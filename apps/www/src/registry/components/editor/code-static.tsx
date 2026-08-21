import type { BaseCodePlugin } from '@platejs/basic-nodes';
import type { PliteLeafProps } from 'platejs/static';
import { PliteLeaf } from 'platejs/static';
import * as React from 'react';

export function CodeLeafStatic(props: PliteLeafProps<typeof BaseCodePlugin>) {
  return (
    <PliteLeaf
      {...props}
      as="code"
      className="rounded-md bg-muted px-[0.3em] py-[0.2em] font-mono text-sm whitespace-pre-wrap"
    >
      {props.children}
    </PliteLeaf>
  );
}
