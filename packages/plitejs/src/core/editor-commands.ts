import { isStructuralEdge } from '../editor/point';
import type {
  ContentSlice,
  EditorCommand,
  EditorCommandPlace,
  EditorStateView,
  EditorToggleBlockOptions,
  EditorToggleMarkOptions,
  NodeKey,
  NodeTarget,
  Value,
} from '../interfaces/editor';
import type { Element } from '../interfaces/element';
import type { Location } from '../interfaces/location';
import {
  type Descendant,
  type Node,
  NodeApi,
  type NodeEntry,
  type NodeProps,
  type NodeTypeSelector,
} from '../interfaces/node';
import { type Path, PathApi } from '../interfaces/path';
import { type Point, PointApi } from '../interfaces/point';
import { type Range, RangeApi } from '../interfaces/range';
import {
  type EditorSelection,
  type NodeSelection,
  SelectionApi,
} from '../interfaces/selection';
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
import { getDefined } from '../internal/get-defined';
import type { TextUnit } from '../types/types';
import { defineCommand } from './command-definition';
import { getActiveCommandEditor } from './command-registry';
import { ContentSlice as ContentSliceValue } from './content-slice';
import { getInternalEditorSchemaFromApi } from './editor-schema';
import { limitTextInsert } from './insert-limit';
import {
  asBlockEntries,
  getCurrentNodeSelection,
  getNodeSelectionReplacement,
  replaceSelectedBlocks,
} from './node-selection';
import { MAIN_ROOT_KEY, toPublicRoot } from './public-root';
import { planPaste, writePaste } from './slice-landing';
import { areEditorJsonValuesEqual } from './value-codec';

type CommandStateView = EditorStateView<Value, any>;

type CommandTargetOptions<
  TOptions extends { at?: Location | NodeSelection },
  TNode extends Descendant = Descendant,
> = Omit<TOptions, 'at'> & {
  at?: Extract<TOptions['at'], NodeSelection> | NodeTarget<TNode>;
};

const resolveCommandRange = (
  state: CommandStateView,
  at: NodeTarget | undefined
) => {
  if (at === undefined) {
    return state.selection() ?? undefined;
  }

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

const getBlockVoidBoundaryDeleteSpec = (state: CommandStateView) => {
  const selection = state.selection();

  if (!selection || !RangeApi.isCollapsed(selection)) {
    return null;
  }

  const block = state.nodes.block({
    at: selection.anchor,
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
    !state.schema.isBlock(previous) ||
    !state.schema.isVoid(previous)
  ) {
    return null;
  }

  return state.transaction((tx) => {
    tx.nodes.remove({ at: block[1] });
    tx.selection.set(point);
  });
};

const getLeadingInlineVoidBoundaryDeleteSpec = (state: CommandStateView) => {
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
      : state.nodes.above({
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
  const block = state.nodes.block({
    at: point,
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
    !state.schema.isBlock(previous) ||
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

const getFullySelectedSiblingBlocks = (
  state: CommandStateView,
  range: Range
): ReadonlyArray<NodeEntry<Element>> | null => {
  if (RangeApi.isCollapsed(range)) return null;

  const [start, end] = RangeApi.edges(range);
  const blocks = state.nodes.toArray({
    at: range,
    match: (node): node is Element =>
      NodeApi.isElement(node) && state.schema.isBlock(node),
    mode: 'highest',
  });
  const startBlock = blocks[0];
  const endBlock = blocks.at(-1);

  if (!startBlock || !endBlock) return null;

  const [startNode, startPath] = startBlock;
  const [endNode, endPath] = endBlock;

  if (PathApi.equals(startPath, endPath) && state.schema.isObject(startNode)) {
    return null;
  }

  if (!isStructuralEdge(startNode, startPath, start, 'start')) return null;

  if (PathApi.equals(startPath, endPath)) {
    return isStructuralEdge(startNode, startPath, end, 'end')
      ? [startBlock]
      : null;
  }

  if (isStructuralEdge(startNode, startPath, end, 'end')) return [startBlock];

  const endsAtBlockStart = isStructuralEdge(endNode, endPath, end, 'start');
  const endsAtBlockEnd = isStructuralEdge(endNode, endPath, end, 'end');

  if (
    (!endsAtBlockStart && !endsAtBlockEnd) ||
    !PathApi.isSibling(startPath, endPath) ||
    !PathApi.isBefore(startPath, endPath)
  ) {
    return null;
  }

  return endsAtBlockEnd ? blocks : blocks.slice(0, -1);
};

const getTextMarks = (node: import('../interfaces').Text) => {
  const { text: _text, ...marks } = node;

  return Object.keys(marks).length > 0 ? marks : null;
};

const getConsistentBlockTextMarks = (
  state: CommandStateView,
  targets: ReadonlyArray<Location | NodeKey>
) => {
  let expected: Record<string, unknown> | null | undefined;

  for (const target of targets) {
    const block = state.nodes.get(target)?.[0];

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

const fillDefaultChild = (
  state: CommandStateView,
  at: Path,
  root: string,
  text: string,
  marks: Record<string, unknown> | null
): Descendant | null => {
  const publicRoot = toPublicRoot(root);
  const defaultChild = state.schema.createDefaultChild({
    at,
    root: publicRoot,
  });
  // New text drops the properties the schema drops on copy, such as review
  // marks of the text it replaces.
  const textNode = marks
    ? state.schema.copy({ ...marks, text }, { at, root: publicRoot })
    : { text };

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
  state: CommandStateView,
  range: Range,
  text: string,
  force = false
) => {
  if (LINE_BREAK_PATTERN.test(text)) return null;

  const blocks = getFullySelectedSiblingBlocks(state, range);

  if (!blocks) return null;

  const [firstBlock, firstPath] = getDefined(blocks[0]);

  if (
    !force &&
    blocks.length === 1 &&
    getInternalEditorSchemaFromApi(state.schema).canContain(firstBlock, {
      text,
    })
  ) {
    return null;
  }

  const root = range.anchor.root ?? range.focus.root ?? MAIN_ROOT_KEY;
  const replacement = fillDefaultChild(
    state,
    firstPath,
    root,
    text,
    state.marks() ??
      getConsistentBlockTextMarks(
        state,
        blocks.map(([block]) => state.key(block))
      )
  );

  if (!replacement) return null;

  const firstText = NodeApi.texts(replacement).next().value;

  if (!firstText) return null;

  const parentPath = PathApi.parent(firstPath);
  const index = getDefined(firstPath.at(-1));
  const publicRoot = toPublicRoot(root);
  const point: Point = {
    offset: text.length,
    path: [...parentPath, index, ...firstText[1]],
    ...(publicRoot ? { root: publicRoot } : {}),
  };

  return {
    count: blocks.length,
    index,
    parentPath,
    replacement,
    root: publicRoot,
    selection: { anchor: point, focus: point, kind: 'text' as const },
  };
};

const locateOptionsAt = <
  TInput extends { options?: { at?: NodeSelection | NodeTarget } },
>(
  input: TInput,
  place: EditorCommandPlace
): TInput | null => {
  const at = input.options?.at;

  if (at === undefined) return input;

  const placed = place.location(at);

  return placed === null
    ? null
    : { ...input, options: { ...input.options, at: placed } };
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
  options?: CommandTargetOptions<
    NodeInsertNodesOptions<Node, NodeTypeSelector | undefined>
  >;
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
  props: Partial<NodeProps>;
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
  options?: EditorToggleBlockOptions;
  props: Partial<NodeProps<Element>> & { type: string };
};

export type EditorCommands = Readonly<{
  addMark: EditorCommand<AddMarkCommand>;
  collapse: EditorCommand<CollapseSelectionCommand>;
  delete: EditorCommand<DeleteCommand>;
  deleteFragment: EditorCommand<DeleteFragmentCommand>;
  insertBreak: EditorCommand;
  insertNodes: EditorCommand<InsertNodesCommand>;
  insertSoftBreak: EditorCommand;
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
  transposeCharacter: EditorCommand;
}>;

/** Typed semantic command tokens exposed to plugin command handlers. */
export const editorCommands: EditorCommands = Object.freeze({
  addMark: defineCommand<AddMarkCommand>('mark.add', {
    locate: false,
    build: ({ input, state }) =>
      state.transaction((tx) => {
        tx.marks.add(input.key, input.value);
      }),
  }),
  collapse: defineCommand<CollapseSelectionCommand>('selection.collapse', {
    selection: true,
    build: ({ input, state }) =>
      state.transaction((tx) => {
        tx.selection.collapse(input.options);
      }),
  }),
  delete: defineCommand<DeleteCommand>('content.delete', {
    locate: false,
    build: ({ input, state }) => {
      const boundarySpec =
        !getCurrentNodeSelection(state) &&
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
    locate: (input, place) => {
      if (input.at === undefined) return input;

      const at = place.location(input.at);

      return at === null ? null : { ...input, at };
    },
    build: ({ input, state }) => {
      const range =
        input.at === undefined ? null : resolveCommandRange(state, input.at);
      const fullBlocks = range
        ? getFullySelectedSiblingBlocks(state, range)
        : null;

      if (fullBlocks) {
        const [firstBlock, firstPath] = getDefined(fullBlocks[0]);
        const [lastBlock] = getDefined(fullBlocks.at(-1));
        const parentPath = PathApi.parent(firstPath);
        const index = getDefined(firstPath.at(-1));
        const previous = state.nodes.previous({
          at: state.key(firstBlock),
          sibling: true,
        })?.[0];
        const previousPoint =
          previous && NodeApi.isElement(previous)
            ? state.points.end(state.key(previous))
            : undefined;
        const next = previousPoint
          ? undefined
          : state.nodes.next({ at: state.key(lastBlock) });
        const nextPoint = next
          ? state.points.start(state.key(next[0]))
          : undefined;
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
        const publicRoot = toPublicRoot(root);
        const defaultChild = survivingPoint
          ? null
          : fillDefaultChild(
              state,
              firstPath,
              root,
              '',
              state.marks() ??
                getConsistentBlockTextMarks(
                  state,
                  fullBlocks.map(([block]) => state.key(block))
                )
            );

        if (!survivingPoint && !defaultChild) {
          return state.transaction((tx) => {
            tx.fragment.delete({
              direction: input.direction,
              ...(input.at === undefined ? {} : { at: input.at }),
            });
          });
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
                  ...(publicRoot ? { root: publicRoot } : {}),
                }
              : undefined);

          tx.nodes.replaceChildren(defaultChild ? [defaultChild] : [], {
            at: parentPath,
            count: fullBlocks.length,
            index,
            ...(publicRoot ? { root: publicRoot } : {}),
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

          const deletedTextMarks =
            !survivingPoint && defaultText
              ? NodeApi.extractProps(defaultText[0])
              : {};

          if (Object.keys(deletedTextMarks).length > 0) {
            tx.marks.set(deletedTextMarks);
          }
        });
      }

      return state.transaction((tx) => {
        tx.fragment.delete({
          direction: input.direction,
          ...(input.at === undefined ? {} : { at: input.at }),
        });
      });
    },
  }),
  insertBreak: defineCommand('break.insert', {
    build: ({ state }) =>
      state.transaction((tx) => {
        tx.break.insert();
      }),
  }),
  insertNodes: defineCommand<InsertNodesCommand>('node.insert', {
    locate: locateOptionsAt,
    build: ({ input, state }) =>
      state.transaction((tx) => {
        (
          tx.nodes.insert as (
            nodes: Descendant | readonly Descendant[],
            options?: CommandTargetOptions<
              NodeInsertNodesOptions<Node, NodeTypeSelector | undefined>
            >
          ) => void
        )(input.nodes, input.options);
      }),
  }),
  insertSoftBreak: defineCommand('break.insertSoft', {
    build: ({ state }) =>
      state.transaction((tx) => {
        tx.break.insertSoft();
      }),
  }),
  insertText: defineCommand<InsertTextCommand>('text.insert', {
    locate: locateOptionsAt,
    build: ({ input, state }) => {
      const nodeSelection = getCurrentNodeSelection(state);

      if (input.options?.at === undefined && nodeSelection) {
        const nodeReplacementText = limitTextInsert(state, input.text, {
          at: nodeSelection,
        });
        const nodeBlocks = asBlockEntries(state, state.selection.nodes());

        if (!nodeBlocks || LINE_BREAK_PATTERN.test(nodeReplacementText)) {
          return false;
        }
        const [, firstPath] = getDefined(nodeBlocks[0]);
        const root = SelectionApi.root(state.selection()) ?? MAIN_ROOT_KEY;
        const replacement = fillDefaultChild(
          state,
          firstPath,
          root,
          nodeReplacementText,
          state.marks() ??
            getConsistentBlockTextMarks(
              state,
              nodeBlocks.map(([block]) => state.key(block))
            )
        );
        const nodeReplacement =
          replacement &&
          getNodeSelectionReplacement(state, nodeBlocks, root, [replacement]);

        if (!nodeReplacement) return false;

        return state.transaction((tx) => {
          replaceSelectedBlocks(tx, nodeReplacement);
        });
      }

      const range = resolveCommandRange(state, input.options?.at);
      const replacementText = range
        ? limitTextInsert(state, input.text, { at: range })
        : input.text;
      const replacement = range
        ? getFullBlockTextReplacement(
            state,
            range,
            replacementText,
            replacementText !== input.text
          )
        : null;

      if (replacement) {
        return state.transaction((tx) => {
          tx.nodes.replaceChildren([replacement.replacement], {
            at: replacement.parentPath,
            count: replacement.count,
            index: replacement.index,
            ...(replacement.root ? { root: replacement.root } : {}),
            newSelection:
              input.options?.at !== undefined && state.selection() === null
                ? null
                : replacement.selection,
          });
        });
      }

      return state.transaction((tx) => {
        tx.text.insert(input.text, input.options);
      });
    },
  }),
  move: defineCommand<MoveSelectionCommand>('selection.move', {
    selection: true,
    build: ({ input, state }) =>
      state.transaction((tx) => {
        tx.selection.move(input.options);
      }),
  }),
  removeMark: defineCommand<RemoveMarkCommand>('mark.remove', {
    locate: false,
    build: ({ input, state }) =>
      state.transaction((tx) => {
        tx.marks.remove(input.key);
      }),
  }),
  removeNodes: defineCommand<RemoveNodesCommand>('node.remove', {
    locate: locateOptionsAt,
    build: ({ input, state }) =>
      state.transaction((tx) => {
        tx.nodes.remove(input.options);
      }),
  }),
  select: defineCommand<SelectCommand>('selection.select', {
    selection: true,
    build: ({ input, state }) =>
      state.transaction((tx) => {
        tx.selection.set(input.target);
      }),
  }),
  setNodes: defineCommand<SetNodesCommand>('node.set', {
    locate: locateOptionsAt,
    build: ({ input, state }) =>
      state.transaction((tx) => {
        tx.nodes.set(input.props, input.options as NodeSetNodesOptions);
      }),
  }),
  setSelection: defineCommand<SetSelectionCommand>('selection.update', {
    selection: true,
    build: ({ input, state }) =>
      state.transaction((tx) => {
        const selection = tx.selection();

        if (selection) tx.selection.set({ ...selection, ...input.props });
      }),
  }),
  replaceSlice: defineCommand<ReplaceSliceCommand>('slice.replace', {
    locate: locateOptionsAt,
    build: ({ input, state }) => {
      const editor = getActiveCommandEditor();
      const plan = planPaste(editor, state, input, 'copy');
      const written = plan && writePaste(editor, plan);

      return written ? written.spec : false;
    },
    prepare: (input) =>
      Object.freeze({
        ...input,
        slice: ContentSliceValue.fromJSON(input.slice),
      }),
  }),
  transposeCharacter: defineCommand('text.transpose', {
    build: ({ state }) => {
      const selection = state.selection();

      if (!selection || !RangeApi.isCollapsed(selection)) return false;

      const cursor = selection.anchor;
      const before = state.points.before(cursor, { unit: 'character' });

      if (!before) return false;

      const after = state.points.after(cursor, { unit: 'character' });
      const secondBefore = after
        ? undefined
        : state.points.before(before, { unit: 'character' });

      if (!after && !secondBefore) return false;

      const [start, middle, end] = after
        ? [before, cursor, after]
        : [getDefined(secondBefore), before, cursor];

      if (
        !PathApi.equals(start.path, middle.path) ||
        !PathApi.equals(middle.path, end.path)
      ) {
        return false;
      }

      const left = state.text.string({ anchor: start, focus: middle });
      const right = state.text.string({ anchor: middle, focus: end });

      if (!left || !right) return false;

      const swapped = `${right}${left}`;
      const caret = {
        ...start,
        offset: start.offset + swapped.length,
        path: [...start.path],
      };

      return state.transaction((tx) => {
        tx.text.insert(swapped, { at: { anchor: start, focus: end } });
        tx.selection.set({ anchor: caret, focus: caret });
      });
    },
  }),
  toggleMark: defineCommand<ToggleMarkCommand>('mark.toggle', {
    locate: false,
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
    locate: locateOptionsAt,
    build: ({ input, state }) => {
      const { collapse, ...options } = input.options ?? {};

      let applied = false;
      const spec = state.transaction((tx) => {
        applied = tx.blocks.toggle(input.props, options);

        if (applied && collapse) {
          tx.selection.collapse(collapse === true ? undefined : collapse);
        }
      });

      return applied ? spec : false;
    },
  }),
});
