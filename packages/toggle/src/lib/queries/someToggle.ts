import { type SlateEditor, KEYS } from '@udecode/plate';

export const someToggle = (editor: SlateEditor) => {
  return (
    !!editor.selection &&
    editor.api.some({
      match: (n) => n.type === KEYS.toggle,
    })
  );
};
