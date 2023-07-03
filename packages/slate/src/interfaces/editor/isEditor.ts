import { Editor } from 'slate';

import { TEditor } from './TEditor';

/**
 * Check if a value is an `Editor` object.
 */
export const isEditor = (value: any): value is TEditor =>
  Editor.isEditor(value);
