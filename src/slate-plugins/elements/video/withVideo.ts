import { Editor } from 'slate';
import { VIDEO } from './types';

export const withVideo = <T extends Editor>(editor: T) => {
  const { isVoid } = editor;

  editor.isVoid = element => (element.type === VIDEO ? true : isVoid(element));

  return editor;
};
