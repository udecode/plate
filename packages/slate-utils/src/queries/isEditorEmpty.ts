import { isElementEmpty, TEditor, Value } from '@udecode/slate';

export const isEditorEmpty = <V extends Value>(editor: TEditor<V>) => {
  return (
    editor.children.length === 1 &&
    isElementEmpty(editor, editor.children[0] as any)
  );
};
