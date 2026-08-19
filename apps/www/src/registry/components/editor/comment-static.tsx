import * as React from 'react';
import { BaseCommentPlugin } from '@platejs/comment';
import { type PliteLeafProps, PliteLeaf } from 'platejs/static';

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

export const BaseCommentKit = [
  BaseCommentPlugin.configure({ component: CommentLeafStatic }),
];
