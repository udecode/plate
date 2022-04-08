import {
  createPluginFactory,
  getAbove,
  getPluginType,
} from '@udecode/plate-core';
import { CommentsPlugin } from './types.js';

export const ELEMENT_COMMENT = 'comment';

export const createCommentsPlugin = createPluginFactory<CommentsPlugin>({
  key: ELEMENT_COMMENT,
  isElement: true,
  isInline: true,
  handlers: {
    onChange(editor) {
      const type = getPluginType(editor, ELEMENT_COMMENT);
      return () => {
        const commentNode = getAbove(editor, {
          match: { type },
        });
        if (commentNode) {
          const comment = commentNode[0].comment as string;
          if (comment) {
            // window.alert(comment);
          }
        }
      };
    },
  },
});
