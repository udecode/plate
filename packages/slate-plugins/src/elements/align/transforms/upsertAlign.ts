import { Editor } from 'slate';
import { unwrapNodesByType } from '../../../common/transforms/unwrapNodesByType';
import { wrapNodes } from '../../../common/transforms/wrapNodes';
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

  wrapNodes(
    editor,
    {
      type,
      children: [],
    },
    { mode: 'lowest' }
  );
};
