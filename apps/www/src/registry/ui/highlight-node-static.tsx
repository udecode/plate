import * as React from 'react';

import type { PliteLeafProps } from 'platejs/static';

import { PliteLeaf } from 'platejs/static';

export function HighlightLeafStatic(props: PliteLeafProps) {
  return (
    <PliteLeaf {...props} as="mark" className="bg-highlight/30 text-inherit">
      {props.children}
    </PliteLeaf>
  );
}
