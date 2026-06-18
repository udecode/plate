import { wrapNodes as wrapNodesBase } from 'slate';

import type {
  Editor,
  ElementOf,
  TElement,
  ValueOf,
  WrapNodesOptions,
} from '../../interfaces';

import { NodeApi, PathApi } from '../../interfaces';
import { getQueryOptions } from '../../utils';

export const wrapNodes = <N extends ElementOf<E>, E extends Editor = Editor>(
  editor: E,
  element: N,
  { children, ...opt }: WrapNodesOptions<ValueOf<E>> = {}
) => {
  const options = getQueryOptions(editor, opt);

  if (options.at) {
    options.at = editor.api.unhangRange(options.at, options);
  }
  // Handle wrapping node children
  if (children) {
    const path = editor.api.path(options.at);

    if (!path) return;

    const node = NodeApi.get<TElement>(editor, path);

    if (!node?.children) return;

    editor.tf.withoutNormalizing(() => {
      const firstChildPath = PathApi.firstChild(path);

      // Wrap first child
      wrapNodesBase(editor as any, element as any, {
        ...options,
        at: firstChildPath,
      });

      // Move remaining children if any
      if (node.children.length > 1) {
        editor.tf.moveNodes({
          at: path,
          children: true,
          fromIndex: 1,
          to: PathApi.child(firstChildPath, 1),
        });
      }
    });

    return;
  }

  // Regular wrap nodes behavior
  wrapNodesBase(editor as any, element as any, options as any);
};
