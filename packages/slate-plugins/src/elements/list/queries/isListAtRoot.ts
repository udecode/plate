import { Editor, Path } from 'slate';
import { ListOptions } from '../types';
import { isListNested } from './isListNested';

/**
 * Is the list at the root - not nested.
 */
export const isListAtRoot = (
  editor: Editor,
  listPath: Path,
  options?: ListOptions
) => !isListNested(editor, listPath, options);
