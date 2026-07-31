import type {
  Descendant,
  Element,
  ContentSlice,
  EditorSelection,
  EditorToggleMarkOptions,
  Location,
  Node,
  NodeTarget,
  NodeProps,
  Path,
  Point,
  Range,
} from '../interfaces';
import {
  NodeApi,
  PathApi,
  PointApi,
  RangeApi,
  SelectionApi,
} from '../interfaces';
import type {
  NodeInsertNodesOptions,
  NodeRemoveNodesOptions,
  NodeSetNodesOptions,
} from '../interfaces/transforms/node';
import type {
  SelectionCollapseOptions,
  SelectionMoveOptions,
} from '../interfaces/transforms/selection';
import type {
  TextInsertFragmentOptions,
  TextInsertTextOptions,
} from '../interfaces/transforms/text';
import type { TextUnit } from '../types';
import { MAIN_ROOT_KEY, toPublicRoot } from './public-root';
import type {
  EditorCommand,
  EditorStateView,
  EditorToggleBlockOptions,
} from '../interfaces/editor';
import { defineCommand } from './command-definition';
import { ContentSlice as ContentSliceValue } from './content-slice';
import { areEditorJsonValuesEqual } from './value-codec';

type CommandTargetOptions<
  TOptions extends { at?: Location },
  TNode extends Descendant = Descendant,
> = Omit<TOptions, 'at'> & {
  at?: NodeTarget<TNode>;
};

const resolveCommandRange = (
  state: EditorStateView,
  at: NodeTarget | undefined
) => {
  if (at === undefined) return state.selection.replacementRange() ?? undefined;

  return RangeApi.isRange(at) ? at : state.ranges.get(at);
};

const equalsInRoot = (point: Point | undefined, target: Point) => {
  if (!point) return false;

  return PointApi.equals(
    point.root === undefined && target.root !== undefined
      ? { ...point, root: target.root }
      : point,
    target
  );
};

const withPointRoot = (
  point: Point | undefined,
  root: Point['root']
): Point | undefined =>
  point && root !== undefined ? { ...point, root } : point;

const getBlockVoidBoundaryDeleteSpec = (state: EditorStateView) => {
  const selection = state.selection();

  if (!selection || !RangeApi.isCollapsed(selection)) return null;

  const block = state.nodes.above<Element>({
    at: selection.anchor,
    match: (node) => NodeApi.isElement(node) && state.nodes.isBlock(node),
    mode: 'highest',
    voids: true,
  });

  if (
    !block ||
    !PathApi.hasPrevious(block[1]) ||
    !equalsInRoot(state.points.start(block[1]), selection.anchor) ||
    NodeApi.string(block[0]) !== ''
  ) {
    return null;
  }

  const previousPath = PathApi.previous(block[1]);
  const previous = state.nodes.get(previousPath)?.[0];
  const point = withPointRoot(
    state.points.start(previousPath),
    selection.anchor.root
  );

  if (
    !point ||
    !previous ||
    !NodeApi.isElement(previous) ||
    !state.nodes.isBlock(previous) ||
    !state.schema.isVoid(previous)
  ) {
    return null;
  }

  return state.transaction((tx) => {
    tx.nodes.remove({ at: block[1] });
    tx.selection.set(point);
  });
};

const getLeadingInlineVoidBoundaryDeleteSpec = (state: EditorStateView) => {
  const selection = state.selection();

  if (
    !selection ||
    !RangeApi.isCollapsed(selection) ||
    selection.anchor.offset !== 0
  ) {
    return null;
  }

  const point = selection.anchor;
  const isInlineVoidAt = (at: Path | Point) => {
    const node = PathApi.isPath(at)
      ? state.nodes.get(at)?.[0]
      : state.nodes.above<Element>({
          at,
          match: (candidate) =>
            NodeApi.isElement(candidate) &&
            state.schema.isInline(candidate) &&
            state.schema.isVoid(candidate),
          mode: 'lowest',
          voids: true,
        })?.[0];

    return (
      !!node &&
      NodeApi.isElement(node) &&
      state.schema.isInline(node) &&
      state.schema.isVoid(node)
    );
  };
  const block = state.nodes.above<Element>({
    at: point,
    match: (node) => NodeApi.isElement(node) && state.nodes.isBlock(node),
    mode: 'lowest',
    voids: true,
  });

  if (
    !block ||
    block[1].length !== 1 ||
    !PathApi.hasPrevious(block[1]) ||
    !equalsInRoot(state.points.start(block[1]), point)
  ) {
    return null;
  }

  const previousPath = PathApi.previous(block[1]);
  const previous = state.nodes.get(previousPath)?.[0];
  const nextSiblingPath = PathApi.next(point.path);

  if (
    !previous ||
    !NodeApi.isElement(previous) ||
    !state.nodes.isBlock(previous) ||
    (!isInlineVoidAt(point) && !isInlineVoidAt(nextSiblingPath))
  ) {
    return null;
  }

  const firstChild = block[0].children[0];
  const sourceChildIndex =
    point.path.length === block[1].length + 1 &&
    point.path.at(-1) === 0 &&
    NodeApi.isText(firstChild) &&
    firstChild.text === ''
      ? 1
      : 0;
  const moveCount = block[0].children.length - sourceChildIndex;
  const previousEnd = withPointRoot(state.points.end(previousPath), point.root);

  if (!previousEnd) return null;

  return state.transaction((tx) => {
    const insertIndex = previous.children.length;
    const sourcePath = [...block[1], sourceChildIndex];

    for (let index = 0; index < moveCount; index++) {
      tx.nodes.move({
        at: sourcePath,
        to: [...previousPath, insertIndex + index],
        voids: true,
      });
    }
    tx.nodes.remove({ at: block[1], voids: true });
    tx.selection.set(previousEnd);
  });
};

const getFullySelectedSiblingBlockPaths = (
  state: EditorStateView,
  range: Range,
  {
    includeAllSiblings = false,
    includeOnlyChild = false,
  }: {
    includeAllSiblings?: boolean;
    includeOnlyChild?: boolean;
  } = {}
): Path[] | null => {
  if (RangeApi.isCollapsed(range)) return null;

  const [start, end] = RangeApi.edges(range);
  const isBlock = (node: Node) =>
    NodeApi.isElement(node) && state.nodes.isBlock(node);
  const startBlock = state.nodes.above<Element>({
    at: start,
    match: isBlock,
    mode: 'highest',
  });
  const endBlock = state.nodes.above<Element>({
    at: end,
    match: isBlock,
    mode: 'highest',
  });

  if (!startBlock || !endBlock) return null;

  const startPath = startBlock[1];
  const endPath = endBlock[1];

  if (!equalsInRoot(state.points.start(startPath), start)) return null;

  const parentPath = PathApi.parent(startPath);
  const siblingCount = state.nodes.children(parentPath).length;

  if (PathApi.equals(startPath, endPath)) {
    return equalsInRoot(state.points.end(startPath), end) &&
      (siblingCount > 1 || includeOnlyChild)
      ? [startPath]
      : null;
  }

  if (equalsInRoot(state.points.end(startPath), end)) {
    return siblingCount > 1 || includeOnlyChild ? [startPath] : null;
  }

  const endsAtBlockStart = equalsInRoot(state.points.start(endPath), end);
  const endsAtBlockEnd = equalsInRoot(state.points.end(endPath), end);

  if (
    (!endsAtBlockStart && !endsAtBlockEnd) ||
    !PathApi.isSibling(startPath, endPath) ||
    !PathApi.isBefore(startPath, endPath)
  ) {
    return null;
  }

  const paths: Path[] = [];
  const stopPath = endsAtBlockEnd ? PathApi.next(endPath) : endPath;

  for (
    let path = startPath;
    !PathApi.equals(path, stopPath);
    path = PathApi.next(path)
  ) {
    paths.push(path);
  }

  return paths.length < siblingCount || includeAllSiblings ? paths : null;
};

const getTextMarks = (node: import('../interfaces').Text) => {
  const { text: _text, ...marks } = node;

  return Object.keys(marks).length > 0 ? marks : null;
};

const getConsistentBlockTextMarks = (
  state: EditorStateView,
  paths: readonly Path[]
) => {
  let expected: Record<string, unknown> | null | undefined;

  for (const path of paths) {
    const block = state.nodes.get(path)?.[0];

    if (!block) return null;

    for (const [text] of NodeApi.texts(block)) {
      if (text.text.length === 0) continue;

      const marks = getTextMarks(text);

      if (expected === undefined) {
        expected = marks;
        continue;
      }

      const keys = new Set([
        ...Object.keys(expected ?? {}),
        ...Object.keys(marks ?? {}),
      ]);

      if (
        [...keys].some(
          (key) => !areEditorJsonValuesEqual(expected?.[key], marks?.[key])
        )
      ) {
        return null;
      }
    }
  }

  return expected ?? null;
};

const fillDefaultRootChild = (
  state: EditorStateView,
  root: string,
  text: string,
  marks: Record<string, unknown> | null
): Descendant | null => {
  const defaultChild = state.schema.createDefaultRootChild(toPublicRoot(root));
  const textNode = marks ? { ...marks, text } : { text };

  if (!defaultChild) return null;
  if (NodeApi.isText(defaultChild)) return textNode;

  const wrapping = state.schema.findWrapping(defaultChild, textNode);

  if (!wrapping) return null;

  const child = wrapping.reduceRight<Descendant>(
    (nested, type) => ({
      ...state.schema.create(type),
      children: [nested],
    }),
    textNode
  );

  return { ...defaultChild, children: [child] };
};

const LINE_BREAK_PATTERN = /\r|\n/;

const getFullBlockTextReplacement = (
  state: EditorStateView,
  range: Range,
  text: string
) => {
  if (LINE_BREAK_PATTERN.test(text)) return null;

  const paths = getFullySelectedSiblingBlockPaths(state, range, {
    includeAllSiblings: true,
    includeOnlyChild: true,
  });

  if (!paths) return null;

  if (paths.length === 1) {
    const block = state.nodes.get(paths[0]!)?.[0];

    if (
      block &&
      NodeApi.isElement(block) &&
      state.schema.findWrapping(block, { text })?.length === 0
    ) {
      return null;
    }
  }

  const root = range.anchor.root ?? range.focus.root ?? MAIN_ROOT_KEY;
  const replacement = fillDefaultRootChild(
    state,
    root,
    text,
    state.marks() ?? getConsistentBlockTextMarks(state, paths)
  );

  if (!replacement) return null;

  const firstText = NodeApi.texts(replacement).next().value;

  if (!firstText) return null;

  const firstPath = paths[0]!;
  const parentPath = PathApi.parent(firstPath);
  const index = firstPath.at(-1)!;
  const point: Point = {
    offset: text.length,
    path: [...parentPath, index, ...firstText[1]],
    ...(toPublicRoot(root) ? { root: toPublicRoot(root) } : {}),
  };

  return {
    count: paths.length,
    index,
    parentPath,
    replacement,
    selection: { anchor: point, focus: point, kind: 'text' as const },
  };
};

export type AddMarkCommand = {
  key: string;
  value: unknown;
};

export type CollapseSelectionCommand = {
  options?: SelectionCollapseOptions;
};

export type DeleteCommand = {
  direction: 'backward' | 'forward';
  unit: TextUnit;
};

export type DeleteFragmentCommand = {
  at?: NodeTarget;
  direction: 'backward' | 'forward';
};

export type InsertBreakCommand = void;

export type InsertNodesCommand = {
  nodes: Descendant | readonly Descendant[];
  options?: CommandTargetOptions<NodeInsertNodesOptions<Descendant>>;
};

export type InsertSoftBreakCommand = void;

export type InsertTextCommand = {
  options?: CommandTargetOptions<TextInsertTextOptions>;
  text: string;
};

export type MoveSelectionCommand = {
  options?: SelectionMoveOptions;
};

export type RemoveMarkCommand = {
  key: string;
};

export type RemoveNodesCommand = {
  options?: CommandTargetOptions<NodeRemoveNodesOptions>;
};

export type SelectCommand = {
  target: EditorSelection | Location;
};

export type SetNodesCommand = {
  options?: CommandTargetOptions<NodeSetNodesOptions>;
  props: Partial<NodeProps<Node>>;
};

export type SetSelectionCommand = {
  props: Partial<Range>;
};

export type ReplaceSliceCommand = {
  options?: CommandTargetOptions<TextInsertFragmentOptions>;
  slice: ContentSlice;
};

export type ToggleMarkCommand = {
  key: string;
  options?: EditorToggleMarkOptions;
  value: unknown;
};

export type ToggleBlockCommand = {
  blockType: string;
  options?: EditorToggleBlockOptions;
};

export type EditorCommands = Readonly<{
  addMark: EditorCommand<AddMarkCommand>;
  collapse: EditorCommand<CollapseSelectionCommand>;
  delete: EditorCommand<DeleteCommand>;
  deleteFragment: EditorCommand<DeleteFragmentCommand>;
  insertBreak: EditorCommand<InsertBreakCommand>;
  insertNodes: EditorCommand<InsertNodesCommand>;
  insertSoftBreak: EditorCommand<InsertSoftBreakCommand>;
  insertText: EditorCommand<InsertTextCommand>;
  move: EditorCommand<MoveSelectionCommand>;
  removeMark: EditorCommand<RemoveMarkCommand>;
  removeNodes: EditorCommand<RemoveNodesCommand>;
  replaceSlice: EditorCommand<ReplaceSliceCommand>;
  select: EditorCommand<SelectCommand>;
  setNodes: EditorCommand<SetNodesCommand>;
  setSelection: EditorCommand<SetSelectionCommand>;
  toggleBlock: EditorCommand<ToggleBlockCommand>;
  toggleMark: EditorCommand<ToggleMarkCommand>;
}>;

/** Typed semantic command tokens exposed to extension command handlers. */
export const editorCommands: EditorCommands = Object.freeze({
  addMark: defineCommand<AddMarkCommand>('mark.add', {
    build: ({ input, state }) =>
      state.transaction((tx) => tx.marks.add(input.key, input.value)),
  }),
  collapse: defineCommand<CollapseSelectionCommand>('selection.collapse', {
    build: ({ input, state }) =>
      state.transaction((tx) => tx.selection.collapse(input.options)),
  }),
  delete: defineCommand<DeleteCommand>('content.delete', {
    build: ({ input, state }) => {
      const boundarySpec =
        !SelectionApi.isNode(state.selection()) &&
        input.direction === 'backward' &&
        input.unit === 'character'
          ? (getLeadingInlineVoidBoundaryDeleteSpec(state) ??
            getBlockVoidBoundaryDeleteSpec(state))
          : null;

      return (
        boundarySpec ??
        state.transaction((tx) => {
          const options = { unit: input.unit };

          if (input.direction === 'backward') {
            tx.text.deleteBackward(options);
          } else {
            tx.text.deleteForward(options);
          }
        })
      );
    },
  }),
  deleteFragment: defineCommand<DeleteFragmentCommand>('fragment.delete', {
    build: ({ input, state }) => {
      const range = resolveCommandRange(state, input.at);
      const fullBlocks = range
        ? getFullySelectedSiblingBlockPaths(state, range, {
            includeAllSiblings: true,
            includeOnlyChild: true,
          })
        : null;

      if (fullBlocks) {
        const firstPath = fullBlocks[0]!;
        const parentPath = PathApi.parent(firstPath);
        const index = firstPath.at(-1)!;
        const previousPoint =
          index > 0 ? state.points.end([...parentPath, index - 1]) : undefined;
        const nextPoint = previousPoint
          ? undefined
          : state.points.start([...parentPath, index + fullBlocks.length]);
        const mappedNextPoint = nextPoint
          ? {
              ...nextPoint,
              path: [
                ...parentPath,
                index,
                ...nextPoint.path.slice(parentPath.length + 1),
              ],
            }
          : undefined;
        const survivingPoint = previousPoint ?? mappedNextPoint;
        const root = range?.anchor.root ?? range?.focus.root ?? MAIN_ROOT_KEY;
        const defaultChild = survivingPoint
          ? null
          : fillDefaultRootChild(
              state,
              root,
              '',
              state.marks() ?? getConsistentBlockTextMarks(state, fullBlocks)
            );

        if (!survivingPoint && !defaultChild) {
          return state.transaction((tx) =>
            tx.fragment.delete({
              direction: input.direction,
              ...(input.at === undefined ? {} : { at: input.at }),
            })
          );
        }

        return state.transaction((tx) => {
          const defaultText = defaultChild
            ? NodeApi.texts(defaultChild).next().value
            : undefined;
          const point =
            survivingPoint ??
            (defaultText
              ? {
                  offset: 0,
                  path: [...parentPath, index, ...defaultText[1]],
                  ...(toPublicRoot(root) ? { root: toPublicRoot(root) } : {}),
                }
              : undefined);

          tx.nodes.replaceChildren(defaultChild ? [defaultChild] : [], {
            at: parentPath,
            count: fullBlocks.length,
            index,
            ...(point
              ? {
                  newSelection: {
                    anchor: point,
                    focus: point,
                    kind: 'text',
                  },
                }
              : {}),
          });
        });
      }

      return state.transaction((tx) =>
        tx.fragment.delete({
          direction: input.direction,
          ...(input.at === undefined ? {} : { at: input.at }),
        })
      );
    },
  }),
  insertBreak: defineCommand<InsertBreakCommand>('break.insert', {
    build: ({ state }) => state.transaction((tx) => tx.break.insert()),
  }),
  insertNodes: defineCommand<InsertNodesCommand>('node.insert', {
    build: ({ input, state }) =>
      state.transaction((tx) => tx.nodes.insert(input.nodes, input.options)),
  }),
  insertSoftBreak: defineCommand<InsertSoftBreakCommand>('break.insertSoft', {
    build: ({ state }) => state.transaction((tx) => tx.break.insertSoft()),
  }),
  insertText: defineCommand<InsertTextCommand>('text.insert', {
    build: ({ input, state }) => {
      const range = resolveCommandRange(state, input.options?.at);
      const replacement = range
        ? getFullBlockTextReplacement(state, range, input.text)
        : null;

      if (replacement) {
        return state.transaction((tx) => {
          tx.nodes.replaceChildren([replacement.replacement], {
            at: replacement.parentPath,
            count: replacement.count,
            index: replacement.index,
            newSelection:
              input.options?.at !== undefined && state.selection() === null
                ? null
                : replacement.selection,
          });
        });
      }

      return state.transaction((tx) =>
        tx.text.insert(input.text, input.options)
      );
    },
  }),
  move: defineCommand<MoveSelectionCommand>('selection.move', {
    build: ({ input, state }) =>
      state.transaction((tx) => tx.selection.move(input.options)),
  }),
  removeMark: defineCommand<RemoveMarkCommand>('mark.remove', {
    build: ({ input, state }) =>
      state.transaction((tx) => tx.marks.remove(input.key)),
  }),
  removeNodes: defineCommand<RemoveNodesCommand>('node.remove', {
    build: ({ input, state }) =>
      state.transaction((tx) => tx.nodes.remove(input.options)),
  }),
  select: defineCommand<SelectCommand>('selection.select', {
    build: ({ input, state }) =>
      state.transaction((tx) => tx.selection.set(input.target)),
  }),
  setNodes: defineCommand<SetNodesCommand>('node.set', {
    build: ({ input, state }) => {
      const at = input.options?.at;
      const resolvedAt = NodeApi.isNode(at) ? state.nodes.path(at) : at;

      if (NodeApi.isNode(at) && !resolvedAt) return false;

      const options = input.options
        ? { ...input.options, at: resolvedAt }
        : undefined;

      return state.transaction((tx) => tx.nodes.set(input.props, options));
    },
  }),
  setSelection: defineCommand<SetSelectionCommand>('selection.update', {
    build: ({ input, state }) =>
      state.transaction((tx) => tx.selection.setRange(input.props)),
  }),
  replaceSlice: defineCommand<ReplaceSliceCommand>('slice.replace', {
    build: ({ input, state }) => state.slice.fit(input.slice, input.options),
    prepare: (input) =>
      Object.freeze({
        ...input,
        slice: ContentSliceValue.fromJSON(input.slice),
      }),
  }),
  toggleMark: defineCommand<ToggleMarkCommand>('mark.toggle', {
    build: ({ input, state }) => {
      const { collapse } = input.options ?? {};

      return state.transaction((tx) => {
        tx.marks.toggle(input.key, input.value);

        if (collapse) {
          tx.selection.collapse(collapse === true ? undefined : collapse);
        }
      });
    },
  }),
  toggleBlock: defineCommand<ToggleBlockCommand>('block.toggle', {
    build: ({ input, state }) => {
      const { collapse, ...options } = input.options ?? {};

      return state.transaction((tx) => {
        tx.blocks.toggle(input.blockType, options);

        if (collapse) {
          tx.selection.collapse(collapse === true ? undefined : collapse);
        }
      });
    },
  }),
});
