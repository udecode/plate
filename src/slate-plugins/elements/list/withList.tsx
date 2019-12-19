import { Editor } from 'slate';
import { ToggleBlockEditor } from '../types';
import { unwrapList } from './transforms/unwrapList';

/**
 * Should be used after withBlock
 * TODO
 */
export const withList = <T extends Editor>(editor: T) => {
  const e = editor as T & ToggleBlockEditor;

  const { toggleBlock } = e;

  e.toggleBlock = (format: string) => {
    unwrapList(e);
    toggleBlock(format);
  };

  return e;
};
