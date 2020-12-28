import { Editor } from 'slate';

export const withTest = (editor: Editor) => {
  const { isInline, isVoid } = editor;

  editor.isInline = (element) => {
    return element.inline === true ? true : isInline(element);
  };

  editor.isVoid = (element) => {
    return element.void === true ? true : isVoid(element);
  };

  return editor;
};
