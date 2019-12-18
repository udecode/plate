import { Editor } from 'slate';
import { ElementType } from 'slate-plugins/common/constants/formats';

export const isLinkActive = (editor: Editor) => {
  const [link] = Editor.nodes(editor, {
    match: n => n.type === ElementType.LINK,
  });

  return !!link;
};
