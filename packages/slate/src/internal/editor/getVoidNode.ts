import { getVoid } from 'slate';

import type { Editor } from '../../interfaces/editor/editor';
import type { GetVoidNodeOptions } from '../../interfaces/editor/editor-types';
import type { ElementOf } from '../../interfaces/element/TElement';
import type { TNodeEntry } from '../../interfaces/node/TNodeEntry';

import { getAt } from '../../utils';

export const getVoidNode = <
  N extends ElementOf<E>,
  E extends Editor = Editor,
>(
  editor: E,
  options?: GetVoidNodeOptions
): TNodeEntry<N> | undefined =>
  getVoid(editor as any, {
    ...options,
    at: getAt(editor, options?.at),
  }) as any;
