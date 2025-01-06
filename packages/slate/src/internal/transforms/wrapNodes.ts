import { wrapNodes as wrapNodesBase } from 'slate';

import type { Editor, ValueOf } from '../../interfaces';
import type { WrapNodesOptions } from '../../interfaces/editor/editor-types';
import type { ElementOf } from '../../interfaces/element/TElement';

import { getQueryOptions } from '../../utils';

export const wrapNodes = <N extends ElementOf<E>, E extends Editor = Editor>(
  editor: E,
  element: N,
  options?: WrapNodesOptions<ValueOf<E>>
) => {
  options = getQueryOptions(editor, options);

  if (options?.at) {
    editor.api.unhangRange(options.at as any, options);
  }

  wrapNodesBase(editor as any, element as any, options as any);
};
