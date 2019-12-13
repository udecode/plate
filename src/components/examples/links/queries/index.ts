import { Editor } from 'slate';
import { ElementType } from 'plugins/common/constants/formats';

export const isLinkActive = (editor: Editor) => {
  const [link] = Editor.nodes(editor, { match: { type: ElementType.LINK } });
  return !!link;
};
