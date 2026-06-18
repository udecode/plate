import { liftNodes as liftNodesBase } from 'slate';

import type { Editor, LiftNodesOptions, ValueOf } from '../../interfaces';

import { getQueryOptions } from '../../utils';

export const liftNodes = <E extends Editor>(
  editor: E,
  options?: LiftNodesOptions<ValueOf<E>>
) => liftNodesBase(editor as any, getQueryOptions(editor, options));
