import type { BasePlateEditor, NodeEntry, TCodeBlockElement } from 'platejs';

import { KEYS } from 'platejs';

export const setCodeBlockContent = (
  editor: BasePlateEditor,
  { code, element }: { code: string; element: TCodeBlockElement }
) => {
  const entry = editor.api.node({
    at: [],
    match: (node: unknown) => node === element,
  }) as NodeEntry<TCodeBlockElement> | undefined;

  if (!entry) return;

  const [, path] = entry;
  const children = code.split('\n').map((line) => ({
    children: [{ text: line }],
    type: editor.getType(KEYS.codeLine),
  }));

  editor.update((tx) => {
    for (const _child of element.children) {
      tx.nodes.remove({ at: [...path, 0] });
    }
    tx.nodes.insert(children, { at: [...path, 0] });
  });

  editor.api.redecorate();
};
