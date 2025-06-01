import * as React from 'react';

import type { SlateLeafProps } from '@udecode/plate';

import { SlateLeaf } from '@udecode/plate';

export function HighlightLeafStatic(props: SlateLeafProps) {
  return (
    <SlateLeaf {...props} as="mark" className="bg-highlight/30 text-inherit">
      {props.children}
    </SlateLeaf>
  );
}
