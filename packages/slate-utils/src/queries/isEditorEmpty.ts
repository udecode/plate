import { type TEditor, isElementEmpty } from '@udecode/slate';

/**
 * Whether the editor is empty. An editor is empty if it has only one empty
 * element.
 */
export const isEditorEmpty = (editor: TEditor) => {
  return (
    editor.children.length === 1 &&
    isElementEmpty(editor, editor.children[0] as any)
  );
};
