import type { BaseHighlightPlugin } from 'platejs';
import { type PliteLeafProps, PliteLeaf } from 'platejs/static';
import * as React from 'react';

export function HighlightLeafStatic(
  props: PliteLeafProps<typeof BaseHighlightPlugin>
) {
  return (
    <PliteLeaf {...props} as="mark" className="bg-highlight/30 text-inherit">
      {props.children}
    </PliteLeaf>
  );
}
