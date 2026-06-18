import { last as lastBase } from 'slate';

import type {
  DescendantOf,
  Editor,
  EditorLastOptions,
  NodeEntry,
} from '../../interfaces';
import type { At } from '../../types';

import { getAt } from '../../utils';

const getNodeAtLevel = (
  editor: Editor,
  [node, path]: NodeEntry,
  level: number
): NodeEntry => {
  // Get the path at the desired level
  const levelPath = path.slice(0, level + 1);

  // Get the node at that path
  const entry = editor.api.node(levelPath);

  if (!entry) return [node, path];

  return entry;
};

export const last = <N extends DescendantOf<E>, E extends Editor>(
  editor: E,
  at: At,
  options: EditorLastOptions = {}
): NodeEntry<N> | undefined => {
  try {
    const { level } = options;

    const lastNodeEntry = lastBase(
      editor as any,
      getAt(editor, at)!
    ) as NodeEntry<N>;

    // If level is specified, get the node at that level
    if (lastNodeEntry && typeof level === 'number') {
      if (editor.children.length === 0) {
        return;
      }

      return getNodeAtLevel(editor, lastNodeEntry, level) as any;
    }

    return lastNodeEntry;
  } catch {}
};
