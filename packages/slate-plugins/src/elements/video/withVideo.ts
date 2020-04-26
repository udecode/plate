import { withVoid } from 'elements/withVoid';
import { Editor } from 'slate';
import { VIDEO } from './types';

export const withVideo = <T extends Editor>(editor: T) => {
  editor = withVoid([VIDEO])(editor);

  return editor;
};
