import { Editor } from 'slate';
import { withVoid } from 'slate-plugins-next/src';
import { EDITABLE_VOID } from './types';

export const withEditableVoids = <T extends Editor>(editor: T) => {
  editor = withVoid([EDITABLE_VOID])(editor);

  return editor;
};
