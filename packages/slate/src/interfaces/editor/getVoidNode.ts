import { Editor, type EditorVoidOptions } from 'slate';

import type { EElement } from '../element/TElement';
import type { TNodeEntry } from '../node/TNodeEntry';
import type { TEditor, Value } from './TEditor';

/** Match a void node in the current branch of the editor. */
export const getVoidNode = <N extends EElement<V>, V extends Value = Value>(
  editor: TEditor<V>,
  options?: EditorVoidOptions
): TNodeEntry<N> | undefined => Editor.void(editor as any, options) as any;
