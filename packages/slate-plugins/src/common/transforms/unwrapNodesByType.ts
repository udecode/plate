import { castArray } from 'lodash';
import { Editor, Path, Point, Range, Transforms } from 'slate';

export const unwrapNodesByType = (
  editor: Editor,
  types: string[] | string,
  options: {
    at?: Path | Point | Range;
    mode?: 'highest' | 'lowest' | 'all';
    split?: boolean;
    voids?: boolean;
  } = {}
) => {
  types = castArray<string>(types);

  Transforms.unwrapNodes(editor, {
    match: (n) => types.includes(n.type as string),
    ...options,
  });
};
