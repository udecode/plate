import type { EditorLeafOptions } from 'slate/dist/interfaces/editor';

import { Editor, type Location } from 'slate';

import type { ETextEntry } from '../node/TNodeEntry';
import type { TEditor, Value } from './TEditor';

/** Get the leaf text node at a location. */
export const getLeafNode = <V extends Value>(
  editor: TEditor<V>,
  at: Location,
  options?: EditorLeafOptions
): ETextEntry<V> => Editor.leaf(editor as any, at, options) as any;
