import { unwrapNodes, wrapNodes } from '@udecode/slate-plugins-common';
import { Editor } from 'slate';
import { KEYS_ALIGN } from '../defaults';

export const upsertAlign = (
  editor: Editor,
  { type, unwrapTypes = KEYS_ALIGN }: { type?: string; unwrapTypes?: string[] }
) => {
  if (!editor.selection) return;

  unwrapNodes(editor, { match: { type: unwrapTypes } });

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
