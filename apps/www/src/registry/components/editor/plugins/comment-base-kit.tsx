import { BaseCommentPlugin } from '@platejs/comments';

import { CommentLeafStatic } from '@/registry/ui/comment-node-static';

export const BaseCommentKit = [
  BaseCommentPlugin.withComponent(CommentLeafStatic),
];
