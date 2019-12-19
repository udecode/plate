import { Editor } from 'slate';
import { ElementType } from 'slate-plugins/common/constants/formats';

export const withVideo = (editor: Editor) => {
  const { isVoid } = editor;
  editor.isVoid = element =>
    element.type === ElementType.VIDEO ? true : isVoid(element);
  return editor;
};
