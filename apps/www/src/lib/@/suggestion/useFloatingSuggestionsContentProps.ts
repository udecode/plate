import { focusEditor, usePlateEditorRef } from '@udecode/plate';

export const useFloatingSuggestionsContentProps = () => {
  const editor = usePlateEditorRef();

  return {
    onOpenAutoFocus: (event) => event.preventDefault(),
    onCloseAutoFocus: () => focusEditor(editor),
  };
};
