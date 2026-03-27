import type { SlateEditor, TCodeBlockElement } from 'platejs';

import { KEYS } from 'platejs';

export const setCodeBlockContent = (
  editor: SlateEditor,
  { code, element }: { code: string; element: TCodeBlockElement }
) => {
  editor.tf.replaceNodes(
    code.split('\n').map((line) => ({
      children: [{ text: line }],
      type: editor.getType(KEYS.codeLine),
    })),
    {
      at: element,
      children: true,
    }
  );

  editor.api.redecorate();
};
