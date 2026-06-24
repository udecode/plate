import { type BasePlateEditor, KEYS } from 'platejs';

export const isSelecting = (editor: BasePlateEditor) => {
  const isSelectingSome = editor.getOption(
    { key: KEYS.blockSelection },
    'isSelectingSome'
  );
  const selectionExpanded = editor.api.isExpanded();

  return selectionExpanded || isSelectingSome;
};
