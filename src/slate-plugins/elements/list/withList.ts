import { Editor } from 'slate';
import { ToggleBlockEditor } from '../types';
import { unwrapList } from './transforms';

/**
 * Should be used after withBlock
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
