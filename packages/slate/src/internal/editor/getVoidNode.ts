import type { Modify } from '@udecode/utils';

import { type EditorVoidOptions, getVoid } from 'slate';

import type { QueryAt, QueryMode, QueryVoids } from '../../types';
import type { ElementOf } from '../../interfaces/element/TElement';
import type { TNodeEntry } from '../../interfaces/node/TNodeEntry';
import type { TEditor } from '../../interfaces/editor/TEditor';

import { getAt } from '../../utils';

export type GetVoidNodeOptions = Modify<
  EditorVoidOptions,
  QueryAt & QueryMode & QueryVoids
>;

export const getVoidNode = <
  N extends ElementOf<E>,
  E extends TEditor = TEditor,
>(
  editor: E,
  options?: GetVoidNodeOptions
): TNodeEntry<N> | undefined =>
  getVoid(editor as any, {
    ...options,
    at: getAt(editor, options?.at),
  }) as any;
