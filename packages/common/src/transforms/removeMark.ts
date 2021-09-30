import { TEditor } from '@udecode/plate-core';
import { Text, Transforms } from 'slate';
import { SetNodesOptions } from '../types';

/**
 * Remove mark and trigger `onChange` if collapsed selection.
 */
export const removeMark = (
  editor: TEditor,
  key: string | string[],
  options: Omit<SetNodesOptions, 'match' | 'split'>
) => {
  Transforms.unsetNodes(editor, key, {
    match: Text.isText,
    split: true,
    ...options,
  });
};
