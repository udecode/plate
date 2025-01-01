import type { TEditor } from '../interfaces';

/**
 * Whether the editor is empty. An editor is empty if it has only one empty
 * element.
 */
export const isEditorEmpty = (editor: TEditor) => {
  return (
    editor.children.length === 1 &&
    editor.api.isEmpty(editor.children[0] as any)
  );
};
