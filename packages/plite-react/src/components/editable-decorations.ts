import type { Ancestor, Descendant, Path } from '@platejs/plite';
import { NodeApi } from '@platejs/plite';

import type {
  PliteDecoration,
  PliteDecorationSourceReadContext,
} from '../decoration-source';
import type { Editor } from '../editable/runtime-editor-api';
import { getSnapshotPathKey } from './editable-dom-strategy-helpers';

type EditableDecoration<T = unknown> = Omit<PliteDecoration<T>, 'key'> & {
  key?: string;
};

type EditableDecorate<T = unknown> = (
  entry: [Descendant, Path],
  editor: Editor
) => readonly EditableDecoration<T>[];

const EMPTY_DECORATIONS = Object.freeze(
  []
) as readonly PliteDecoration<unknown>[];

export const readEditableDecorations = <T>(
  editor: Editor,
  readDecorations: EditableDecorate<T> | null | undefined,
  {
    runtimeScope,
    snapshot,
  }: Pick<PliteDecorationSourceReadContext, 'runtimeScope' | 'snapshot'>
): readonly PliteDecoration<T>[] => {
  if (!readDecorations) {
    return EMPTY_DECORATIONS as readonly PliteDecoration<T>[];
  }

  const root = { children: snapshot.children } as Ancestor;
  const decorations: PliteDecoration<T>[] = [];
  const visitedPathKeys = new Set<string>();

  const addDecorations = (node: Descendant, path: Path) => {
    if (path.length === 0) {
      return;
    }

    const pathKey = getSnapshotPathKey(path);

    if (visitedPathKeys.has(pathKey)) {
      return;
    }

    visitedPathKeys.add(pathKey);

    const entryDecorations = readDecorations([node, path], editor);

    entryDecorations.forEach((decoration, index) => {
      decorations.push({
        ...decoration,
        key: decoration.key ?? `decorate:${path.join('.') || 'root'}:${index}`,
      });
    });
  };

  if (runtimeScope) {
    for (const runtimeId of runtimeScope) {
      const scopedRootPath = snapshot.index.idToPath[runtimeId];

      if (!scopedRootPath) {
        continue;
      }

      const scopedRootNode = NodeApi.getIf(root, scopedRootPath) as
        | Descendant
        | undefined;

      if (!scopedRootNode) {
        continue;
      }

      if (NodeApi.isText(scopedRootNode)) {
        addDecorations(scopedRootNode, scopedRootPath);
        continue;
      }

      for (const [node, path] of NodeApi.nodes(scopedRootNode)) {
        addDecorations(
          node as Descendant,
          [...scopedRootPath, ...path] as Path
        );
      }
    }

    return decorations;
  }

  for (const [node, path] of NodeApi.nodes(root)) {
    addDecorations(node as Descendant, path);
  }

  return decorations;
};
