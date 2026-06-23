import { type SlateEditor, ElementApi, KEYS } from 'platejs';

export const someToggle = (editor: SlateEditor) =>
  !!editor.selection &&
  editor.api.some({
    match: (node) => ElementApi.isElement(node) && node.type === KEYS.toggle,
  });
