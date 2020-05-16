import { getSelectionNodesByType } from 'common/queries/getSelectionNodesByType';
import { Editor } from 'slate';

export const isNodeInSelection = (
  editor: Editor,
  types: string[] | string,
  options: {
    mode?: 'highest' | 'lowest' | 'all';
    universal?: boolean;
    reverse?: boolean;
    voids?: boolean;
  } = {}
) => {
  const [match] = getSelectionNodesByType(editor, types, options);
  return !!match;
};
