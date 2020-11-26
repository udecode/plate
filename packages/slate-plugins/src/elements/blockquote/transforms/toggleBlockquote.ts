import { Editor } from 'slate';
import { isNodeTypeIn } from '../../../common/queries';
import { wrapNodes } from '../../../common/transforms/wrapNodes';
import { ListOptions } from '../../list/types';
import { ELEMENT_PARAGRAPH } from '../../paragraph/defaults';

export const toggleBlockquote = (
  editor: Editor,
  {
    typeList,
  }: {
    typeList: string;
  } & ListOptions
) => {
  if (!editor.selection) return;

  const isActive = isNodeTypeIn(editor, typeList);

  if (!isActive) {
    const list = {
      type: typeList,
      children: [
        {
          type: ELEMENT_PARAGRAPH,
          children: [{ text: '' }],
        },
      ],
    };
    wrapNodes(editor, list);
  }
};
