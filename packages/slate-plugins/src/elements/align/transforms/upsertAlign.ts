import { Editor, Transforms } from 'slate';
import { unwrapNodesByType } from '../../../common/transforms/unwrapNodesByType';
import { ALIGN_CENTER, ALIGN_LEFT, ALIGN_RIGHT } from '../types';

export const upsertAlign = (
  editor: Editor,
  {
    type,
    unwrapTypes = [ALIGN_LEFT, ALIGN_CENTER, ALIGN_RIGHT],
  }: { type?: string; unwrapTypes?: string[] }
) => {
  if (!editor.selection) return;

  unwrapNodesByType(editor, unwrapTypes);

  if (!type) return;

  Transforms.wrapNodes(
    editor,
    {
      type,
      children: [],
    },
    { mode: 'lowest' }
  );
};
