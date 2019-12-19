import { Editor } from 'slate';
import { ElementType } from 'slate-plugins/common/constants/formats';

export const withVideo = <T extends Editor>(editor: T) => {
  const { isVoid } = editor;

  editor.isVoid = element =>
    element.type === ElementType.VIDEO ? true : isVoid(element);

  return editor;
};
