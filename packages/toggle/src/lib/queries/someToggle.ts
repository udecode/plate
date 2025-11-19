import { type SlateEditor, KEYS } from 'platejs';

export const someToggle = (editor: SlateEditor) =>
  !!editor.selection &&
  editor.api.some({
    match: (n) => n.type === KEYS.toggle,
  });
