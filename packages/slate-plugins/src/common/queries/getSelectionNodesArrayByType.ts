import { getSelectionNodesByType } from 'common/queries/getSelectionNodesByType';
import { Editor } from 'slate';

export const getSelectionNodesArrayByType = (
  editor: Editor,
  types: string[] | string,
  options: {
    mode?: 'highest' | 'lowest' | 'all';
    universal?: boolean;
    reverse?: boolean;
    voids?: boolean;
  } = {}
) => Array.from(getSelectionNodesByType(editor, types, options));
