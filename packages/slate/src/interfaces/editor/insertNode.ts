import { Editor } from 'slate';

import type { ElementOrTextOf } from '../element/TElement';
import type { InsertNodesOptions } from '../transforms';
import type { TEditor, ValueOf } from './TEditor';

import { getQueryOptions } from '../../utils';

export const insertNode = <E extends TEditor>(
  editor: E,
  node: ElementOrTextOf<E>,
  options?: InsertNodesOptions<ValueOf<E>>
) =>
  Editor.insertNode(
    editor as any,
    node as any,
    getQueryOptions(editor, options)
  );
