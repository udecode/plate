import { castArray } from 'lodash';
import { Editor, Transforms } from 'slate';
import { CENTER as center, LEFT as left, RIGHT as right } from './types';

export const unwrapNodesByType = (editor: any, types: any, options = {}) => {
  types = castArray(types);

  Transforms.unwrapNodes(editor, {
    match: (n) => types.includes(n.type),
    ...options,
  });
};

export const unwrapAlign = (
  editor = Editor,
  { LEFT = left, CENTER = center, RIGHT = right } = {}
) => {
  unwrapNodesByType(editor, [LEFT, CENTER, RIGHT], { split: true });
};
