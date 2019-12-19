import { Editor } from 'slate';
import { unwrapList } from './transforms/unwrapList';

/**
 * Should be used after withBlock
 */
export const withList = (editor: Editor) => {
  const { toggleBlock } = editor;

  editor.toggleBlock = (format: string) => {
    unwrapList(editor);
    toggleBlock(format);
  };

  return editor;
};
