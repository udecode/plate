import { Editor, Transforms } from 'slate';
import { isBlockActive } from '../queries';

export const toggleBlock = (editor: Editor, format: string) => {
  // const isActive = isBlockActive(editor, format);
  // const isList = LIST_TYPES.includes(format);
  // Transforms.unwrapNodes(editor, {
  //   match: n => LIST_TYPES.includes(n.type),
  //   split: true,
  // });
  // Transforms.setNodes(editor, {
  //   type: isActive ? 'paragraph' : isList ? 'list-item' : format,
  // });
  // if (!isActive && isList) {
  //   const block = { type: format, children: [] };
  //   Transforms.wrapNodes(editor, block);
  // }
};
