import { BaseCommentPlugin } from '@platejs/comment';

import { CommentLeafStatic } from '@/registry/ui/comment-node-static';

export const BaseCommentKit = [
  BaseCommentPlugin.withComponent(CommentLeafStatic),
];
