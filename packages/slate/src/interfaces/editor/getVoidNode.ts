import { Editor, type EditorVoidOptions } from 'slate';

import type { ElementOf } from '../element/TElement';
import type { TNodeEntry } from '../node/TNodeEntry';
import type { TEditor } from './TEditor';

/** Match a void node in the current branch of the editor. */
export const getVoidNode = <
  N extends ElementOf<E>,
  E extends TEditor = TEditor,
>(
  editor: E,
  options?: EditorVoidOptions
): TNodeEntry<N> | undefined => Editor.void(editor as any, options) as any;
