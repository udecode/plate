import { Editor, Transforms } from 'slate';
import { ElementType } from 'slate-plugins/common/constants/formats';

export const unwrapLink = (editor: Editor) => {
  Transforms.unwrapNodes(editor, { match: n => n.type === ElementType.LINK });
};
