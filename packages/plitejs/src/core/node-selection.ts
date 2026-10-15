import type {
  EditorStateView,
  EditorTransactionSpecBuilder,
  NamedRootKey,
  NodeKey,
} from '../interfaces/editor';
import type { Element } from '../interfaces/element';
import { type Descendant, NodeApi, type NodeEntry } from '../interfaces/node';
import { type Path, PathApi } from '../interfaces/path';
import type { Point } from '../interfaces/point';
import {
  type NodeSelection,
  SelectionApi,
  type TextSelection,
} from '../interfaces/selection';
import { getDefined } from '../internal/get-defined';
import { canPlaceBlocksAtPath } from './editor-schema';
import { toPublicRoot } from './public-root';

export type SelectedBlocksReplacement = Readonly<{
  index: number;
  keys: readonly NodeKey[];
  parentPath: Path;
  replacements: readonly Descendant[];
  root: NamedRootKey | undefined;
  selection: TextSelection;
}>;

export const getCurrentNodeSelection = (
  state: EditorStateView
): NodeSelection | null => {
  const paths = state.selection.nodes().map(([, path]) => path);
  const first = paths[0];

  if (!first) return null;

  const selection = state.selection();
  const last = paths.at(-1) ?? first;
  const selectedPathAt = (path: Path | undefined, fallback: Path) =>
    path
      ? (paths.find(
          (candidate) =>
            PathApi.equals(candidate, path) ||
            PathApi.isAncestor(candidate, path)
        ) ?? fallback)
      : fallback;
  const anchorPath = selectedPathAt(selection?.anchor.path, first);
  const focusPath = selectedPathAt(selection?.focus.path, last);
  const root = SelectionApi.root(selection);

  return SelectionApi.nodes([first, ...paths.slice(1)], {
    anchorPath,
    focusPath,
    mode: 'block',
    ...(root === undefined ? {} : { root }),
  });
};

export const asBlockEntries = (
  state: EditorStateView,
  entries: readonly NodeEntry[]
): ReadonlyArray<NodeEntry<Element>> | null => {
  const blocks = entries.filter(
    (entry): entry is NodeEntry<Element> =>
      NodeApi.isElement(entry[0]) && state.schema.isBlock(entry[0])
  );

  return blocks.length > 0 && blocks.length === entries.length ? blocks : null;
};

export const getNodeSelectionReplacement = (
  state: EditorStateView,
  blocks: ReadonlyArray<NodeEntry<Element>>,
  root: string,
  replacements: readonly Descendant[]
): SelectedBlocksReplacement | null => {
  const [, firstPath] = getDefined(blocks[0]);
  const lastReplacement = replacements.at(-1);
  const textEntry = lastReplacement
    ? [...NodeApi.texts(lastReplacement)].at(-1)
    : undefined;

  if (!textEntry) return null;

  const parentPath = PathApi.parent(firstPath);
  const index = getDefined(firstPath.at(-1));
  const publicRoot = toPublicRoot(root);

  if (
    !canPlaceBlocksAtPath(state.schema, firstPath, replacements, {
      removing: blocks.flatMap(([, path]) =>
        PathApi.equals(PathApi.parent(path), parentPath)
          ? [getDefined(path.at(-1))]
          : []
      ),
      root,
    })
  ) {
    return null;
  }

  const point: Point = {
    offset: textEntry[0].text.length,
    path: [...parentPath, index + replacements.length - 1, ...textEntry[1]],
    ...(publicRoot ? { root: publicRoot } : {}),
  };

  return {
    index,
    keys: blocks.map(([block]) => state.key(block)),
    parentPath,
    replacements,
    root: publicRoot,
    selection: { anchor: point, focus: point, kind: 'text' },
  };
};

export const replaceSelectedBlocks = (
  transaction: EditorTransactionSpecBuilder,
  replacement: SelectedBlocksReplacement
) => {
  for (const key of replacement.keys.slice(1).toReversed()) {
    transaction.nodes.remove({ at: key });
  }
  transaction.nodes.replaceChildren(replacement.replacements, {
    at: replacement.parentPath,
    count: 1,
    index: replacement.index,
    ...(replacement.root ? { root: replacement.root } : {}),
    newSelection: replacement.selection,
  });
};
