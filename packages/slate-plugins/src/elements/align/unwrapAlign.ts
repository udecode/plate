import { Editor } from 'slate';
import { unwrapNodesByType } from '../..';
import {
  ALIGN_CENTER as alignCenter,
  ALIGN_LEFT as alignLeft,
  ALIGN_RIGHT as alignRight,
} from './types';

export const unwrapAlign = (
  editor: Editor,
  {
    ALIGN_LEFT = alignLeft,
    ALIGN_CENTER = alignCenter,
    ALIGN_RIGHT = alignRight,
  } = {}
) => {
  unwrapNodesByType(editor, [ALIGN_LEFT, ALIGN_CENTER, ALIGN_RIGHT], {
    split: true,
  });
};
