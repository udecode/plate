import { BaseCommentPlugin } from '@udecode/plate-comments';

import { CommentLeafStatic } from '@/registry/ui/comment-node-static';

export const BaseCommentKit = [
  BaseCommentPlugin.withComponent(CommentLeafStatic),
];
