import { type SlateEditor, KEYS } from 'platejs';

export const someToggle = (editor: SlateEditor) =>
  !!editor.selection &&
  editor.read.nodes.some({
    match: { type: KEYS.toggle },
  });
