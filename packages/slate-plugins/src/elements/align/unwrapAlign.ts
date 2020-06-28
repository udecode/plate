import { castArray } from 'lodash';
import { Editor, Transforms } from 'slate';
import { ALIGN_CENTER as align_center, ALIGN_LEFT as align_left, ALIGN_RIGHT as align_right } from './types';

export const unwrapNodesByType = (editor: any, types: any, options = {}) => {
  types = castArray(types);

  Transforms.unwrapNodes(editor, {
    match: (n) => types.includes(n.type),
    ...options,
  });
};

export const unwrapAlign = (
  editor = Editor,
  { ALIGN_LEFT = align_left, ALIGN_CENTER = align_center, ALIGN_RIGHT = align_right } = {}
) => {
  unwrapNodesByType(editor, [ALIGN_LEFT, ALIGN_CENTER, ALIGN_RIGHT], { split: true });
};
