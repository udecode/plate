import * as React from 'react';

import type { SlateLeafProps } from '@udecode/plate';
import type { TCommentText } from '@udecode/plate-comments';

import { SlateLeaf } from '@udecode/plate';

export function CommentLeafStatic(props: SlateLeafProps<TCommentText>) {
  return (
    <SlateLeaf
      {...props}
      className="border-b-2 border-b-highlight/35 bg-highlight/15"
    >
      {props.children}
    </SlateLeaf>
  );
}
