import * as React from 'react';

import type { BaseCommentPlugin } from '@platejs/comment';
import type { PliteLeafProps } from 'platejs/static';

import { PliteLeaf } from 'platejs/static';

export function CommentLeafStatic(
  props: PliteLeafProps<typeof BaseCommentPlugin>
) {
  return (
    <PliteLeaf
      {...props}
      className="border-b-2 border-b-highlight/35 bg-highlight/15"
    >
      {props.children}
    </PliteLeaf>
  );
}
