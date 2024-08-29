import type { EditorLeafOptions } from 'slate/dist/interfaces/editor';

import { Editor, type Location } from 'slate';

import type { TextEntryOf } from '../node/TNodeEntry';
import type { TEditor } from './TEditor';

/** Get the leaf text node at a location. */
export const getLeafNode = <E extends TEditor>(
  editor: E,
  at: Location,
  options?: EditorLeafOptions
): TextEntryOf<E> => Editor.leaf(editor as any, at, options) as any;
