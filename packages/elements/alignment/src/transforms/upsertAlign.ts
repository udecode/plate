import { unwrapNodes, wrapNodes } from '@udecode/plate-common';
import { TEditor } from '@udecode/plate-core';
import { KEYS_ALIGN } from '../defaults';

export const upsertAlign = (
  editor: TEditor,
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
