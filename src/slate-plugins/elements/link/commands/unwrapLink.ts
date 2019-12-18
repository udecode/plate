import { Editor } from 'slate';
import { ElementType } from 'slate-plugins/common/constants/formats';

export const unwrapLink = (editor: Editor) => {
  Editor.unwrapNodes(editor, { match: n => n.type === ElementType.LINK });
};
