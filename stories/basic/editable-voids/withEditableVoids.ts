import { Editor } from 'slate';
import { EDITABLE_VOID } from './types';

export const withEditableVoids = <T extends Editor>(editor: T) => {
  const { isVoid } = editor;

  editor.isVoid = (element) => {
    return element.type === EDITABLE_VOID ? true : isVoid(element);
  };

  return editor;
};
