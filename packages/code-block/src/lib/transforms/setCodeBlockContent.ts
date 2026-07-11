import type { BaseEditor } from '@platejs/core';
import type { EditorUpdateTransaction } from '@platejs/plite';
import { KEYS, type TCodeBlockElement } from '@platejs/utils';

export const setCodeBlockContent = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction,
  { code, element }: { code: string; element: TCodeBlockElement }
) => {
  tx.nodes.replaceChildren(
    code.split('\n').map((line) => ({
      children: [{ text: line }],
      type: editor.getType(KEYS.codeLine),
    })),
    {
      at: element,
    }
  );
};
