import { type SlateEditor, KEYS } from 'platejs';

export const isSelecting = (editor: SlateEditor) => {
  const isSelectingSome = editor.getOption(
    { key: KEYS.blockSelection },
    'isSelectingSome'
  );
  const selectionExpanded = editor.api.isExpanded();

  return selectionExpanded || isSelectingSome;
};
