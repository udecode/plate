import type { Modify } from '@udecode/utils';

import { type EditorVoidOptions, Editor } from 'slate';

import type { QueryAt, QueryMode, QueryVoids } from '../../types';
import type { ElementOf } from '../element/TElement';
import type { TNodeEntry } from '../node/TNodeEntry';
import type { TEditor } from './TEditor';

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
  Editor.void(editor as any, {
    ...options,
    at: getAt(editor, options?.at),
  }) as any;
