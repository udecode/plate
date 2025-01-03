import { previous } from 'slate';

import type { DescendantOf } from '../../interfaces';
import type { TEditor, ValueOf } from '../../interfaces/editor/TEditor';
import type { GetPreviousNodeOptions } from '../../interfaces/editor/editor-types';
import type { TNodeEntry } from '../../interfaces/node/TNodeEntry';

import { getQueryOptions } from '../../utils';

export const getPreviousNode = <
  N extends DescendantOf<E>,
  E extends TEditor = TEditor,
>(
  editor: E,
  options?: GetPreviousNodeOptions<ValueOf<E>>
): TNodeEntry<N> | undefined =>
  previous(editor as any, getQueryOptions(editor, options)) as any;
