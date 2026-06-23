import { Editor, type EditorStaticApi, type Value } from '../interfaces/editor';
import type { DescendantIn } from '../interfaces/node';
import { NodeApi } from '../interfaces/node';
import { RangeApi } from '../interfaces/range';

export const fragment = (<V extends Value>(
  editor: import('../interfaces/editor').Editor<V>,
  at: import('../interfaces').Location
): DescendantIn<V>[] => {
  const range = Editor.range(editor, at);

  if (RangeApi.isCollapsed(range)) {
    return [];
  }

  return NodeApi.fragment(editor, range) as DescendantIn<V>[];
}) satisfies EditorStaticApi['fragment'];
