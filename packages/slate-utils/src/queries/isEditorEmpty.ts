import { type TEditor, type Value, isElementEmpty } from '@udecode/slate';

/**
 * Whether the editor is empty. An editor is empty if it has only one empty
 * element.
 */
export const isEditorEmpty = <V extends Value>(editor: TEditor<V>) => {
  return (
    editor.children.length === 1 &&
    isElementEmpty(editor, editor.children[0] as any)
  );
};
