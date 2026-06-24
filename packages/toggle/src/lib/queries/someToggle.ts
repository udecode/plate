import { type BasePlateEditor, ElementApi, KEYS } from 'platejs';

export const someToggle = (editor: BasePlateEditor) =>
  !!editor.selection &&
  editor.api.some({
    match: (node: unknown) =>
      ElementApi.isElement(node) && node.type === KEYS.toggle,
  });
