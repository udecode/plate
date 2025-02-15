import type { PlateEditor } from '@udecode/plate/react';

import { TextApi } from '@udecode/plate';

import type { TCommentText } from '../types';

import { getDraftCommentKey } from './getDraftCommentKey';
import { isCommentText } from './isCommentText';

export const getDraftNode = (editor: PlateEditor) =>
  editor.api.nodes<TCommentText>({
    at: [],
    match: (n) => {
      if (!TextApi.isText(n)) return false;
      if (!isCommentText(n)) return false;

      return n[getDraftCommentKey()];
    },
  });
