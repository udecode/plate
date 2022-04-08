import { createPluginFactory } from '@udecode/plate-core';
import { CommentsPlugin } from './types.js';

export const ELEMENT_COMMENT = 'comment';

export const createCommentsPlugin = createPluginFactory<CommentsPlugin>({
  key: ELEMENT_COMMENT,
  isElement: true,
  isInline: true,
});
