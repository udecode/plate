import { liftNodes as liftNodesBase } from 'slate';

import type { Editor, ValueOf } from '../../interfaces';
import type { LiftNodesOptions } from '../../interfaces/editor/editor-types';

import { getQueryOptions } from '../../utils';

export const liftNodes = <E extends Editor>(
  editor: E,
  options?: LiftNodesOptions<ValueOf<E>>
) => {
  return liftNodesBase(editor as any, getQueryOptions(editor, options));
};
