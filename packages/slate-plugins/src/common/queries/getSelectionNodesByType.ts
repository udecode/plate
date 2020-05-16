import { castArray } from 'lodash';
import { Editor } from 'slate';

export const getSelectionNodesByType = (
  editor: Editor,
  types: string[] | string,
  options: {
    mode?: 'highest' | 'lowest' | 'all';
    universal?: boolean;
    reverse?: boolean;
    voids?: boolean;
  } = {}
) => {
  types = castArray<string>(types);

  return Editor.nodes(editor, {
    match: (n) => {
      return types.includes(n.type as string);
    },
    ...options,
  });
};
