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
  TextTarget,
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
import {
  setNextKeyMarks,
  typesAtSelection,
} from '../transforms-text/insert-text';
import type { TextUnit } from '../types/types';
import { defineCommand } from './command-definition';
import { refusesTextStartInStruck } from './command-frame';
import { getActiveCommandEditor } from './command-registry';
import {
  recordLocatedDestination,
  writeComposedText,
} from './composition-stamp';
import { ContentSlice as ContentSliceValue } from './content-slice';
import { withoutUnheldDefaults } from './default-storage';
import {
  getCompiledEditorSchemaFromApi,
  getInternalEditorSchemaFromApi,
} from './editor-schema';
import { limitTextInsert } from './insert-limit';
import {
  asBlockEntries,
  getCurrentNodeSelection,
  getNodeSelectionReplacement,
  replaceSelectedBlocks,
} from './node-selection';
import { toPublicRoot } from './public-root';
import {
  getActiveDocumentChangeBuilder,
  getEditorUpdateRoot,
  getSetSite,
} from './public-state';
import { toCompiledNodeContext } from './schema-compiler';
import { refuseCrossing } from './set-root';
import { notePasteLoss, planPaste, writePaste } from './slice-landing';
import { defineUpdateAnnotation } from './transaction-values';
import { areEditorJsonValuesEqual } from './value-codec';
import { canReplaceChildrenWithText, holdsWritableText } from './writable-text';

type CommandStateView = EditorStateView<Value, any>;

type CommandTargetOptions<
  TOptions extends { at?: Location | NodeSelection },
  TTarget = NodeTarget,
> = Omit<TOptions, 'at'> & {
  at?: Extract<TOptions['at'], NodeSelection> | TTarget;
};

const rootOrUpdateRoot = (root: string | undefined) =>
  root ?? getEditorUpdateRoot(getActiveCommandEditor());

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

export const getFullySelectedSiblingBlocks = (
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

const hasSiblingOutside = (
  state: CommandStateView,
  blocks: ReadonlyArray<NodeEntry<Element>>,
  root: string | undefined
) =>
  PathApi.hasPrevious(getDefined(blocks[0])[1]) ||
  state.nodes.get({
    offset: 0,
    path: PathApi.next(getDefined(blocks.at(-1))[1]),
    ...(root ? { root } : {}),
  }) !== undefined;

export const readWholeBlockDelete = (
  state: CommandStateView,
  range: Range,
  root: string | undefined
) => {
  const blocks = getFullySelectedSiblingBlocks(state, range);

  if (!blocks) return null;

  const keepsFirst = hasSiblingOutside(state, blocks, root);

  return {
    blocks,
    endsInFirst:
      keepsFirst &&
      PathApi.isAncestor(getDefined(blocks[0])[1], RangeApi.end(range).path),
    keepsFirst,
    takesCaret:
      keepsFirst && takesCaretAfterRemoval(state, getDefined(blocks[0])[0]),
  };
};

const isGrid = (state: CommandStateView, node: Element) =>
  getCompiledEditorSchemaFromApi(state.schema)?.elements.byType.get(node.type)
    ?.structure?.kind === 'grid';

const takesCaretAfterRemoval = (
  state: CommandStateView,
  node: Node | undefined
) =>
  NodeApi.isElement(node) &&
  !isGrid(state, node) &&
  holdsWritableText(getInternalEditorSchemaFromApi(state.schema), node);

export const tripleClickedBlock = defineUpdateAnnotation<NodeKey>({
  key: 'selection.triple-clicked-block',
});

export const readTripleClickRemoval = (
  state: CommandStateView,
  range: Range
): NodeKey | null => {
  const commit = state.lastCommit();

  if (
    commit?.annotations[tripleClickedBlock.key] === undefined ||
    !RangeApi.isRange(commit.selectionAfter) ||
    !RangeApi.equals(commit.selectionAfter, range)
  ) {
    return null;
  }

  const blocks = getFullySelectedSiblingBlocks(state, range);
  const [block, path] = blocks?.length === 1 ? getDefined(blocks[0]) : [];

  if (!block || !path) return null;

  const next = state.nodes.next({ at: state.key(block) })?.[0];
  const removable = getInternalEditorSchemaFromApi(state.schema).canPlaceAtPath(
    path,
    [],
    {
      removing: [getDefined(path.at(-1))],
      root: range.anchor.root ?? range.focus.root ?? 'main',
    }
  );

  return removable &&
    takesCaretAfterRemoval(state, block) &&
    takesCaretAfterRemoval(state, next)
    ? state.key(block)
    : null;
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

const blockReplacing = (
  state: CommandStateView,
  at: Path,
  root: string,
  text: string,
  marks: Record<string, unknown> | null,
  shell?: Element
): Descendant | null => {
  const publicRoot = toPublicRoot(root);
  const defaultChild =
    shell ??
    state.schema.createDefaultChild({
      at,
      root: publicRoot,
    });
  // New text drops the properties the schema drops on copy, such as review
  // marks of the text it replaces.
  const copied = marks
    ? state.schema.copy({ ...marks, text }, { at, root: publicRoot })
    : { text };

  const landed = (parents: readonly Element[]) =>
    withoutUnheldDefaults(
      getCompiledEditorSchemaFromApi(state.schema),
      copied,
      () =>
        toCompiledNodeContext(
          copied,
          [
            ...parents,
            ...Array.from(
              state.nodes.levels({
                at: getDefined(
                  state.key({
                    offset: 0,
                    path: at,
                    ...(publicRoot ? { root: publicRoot } : {}),
                  })
                ),
                reverse: true,
                voids: true,
              }),
              ([node]) => node
            )
              .filter(NodeApi.isElement)
              .slice(1),
          ],
          root
        )
    );

  if (!defaultChild) return null;
  if (NodeApi.isText(defaultChild)) return landed([]);

  const wrapping = state.schema.findWrapping(defaultChild, copied);

  if (!wrapping) return null;

  const wrappers = wrapping.map((type) => state.schema.create(type));

  return {
    ...defaultChild,
    children: [
      wrappers.reduceRight<Descendant>(
        (nested, wrapper) => ({ ...wrapper, children: [nested] }),
        landed([...wrappers].reverse().concat(defaultChild))
      ),
    ],
  };
};

const LINE_BREAK_PATTERN = /\r|\n/;

const getFullBlockTextReplacement = (
  state: CommandStateView,
  range: Range,
  text: string,
  typing: boolean,
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

  const root = rootOrUpdateRoot(range.anchor.root ?? range.focus.root);
  const keepsFirstBlock =
    blocks.length > 1 &&
    hasSiblingOutside(state, blocks, toPublicRoot(root)) &&
    canReplaceChildrenWithText(
      getInternalEditorSchemaFromApi(state.schema),
      firstBlock
    );
  const replacement = blockReplacing(
    state,
    getDefined(blocks[0])[1],
    root,
    text,
    (typing ? state.marks() : null) ??
      getConsistentBlockTextMarks(
        state,
        blocks.map(([block]) => state.key(block))
      ),
    keepsFirstBlock ? { ...firstBlock, children: [{ text: '' }] } : undefined
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

const locateTextOptionsAt = <
  TInput extends { options?: { at?: NodeSelection | NodeTarget } },
>(
  input: TInput,
  place: EditorCommandPlace
): TInput | null => {
  const at = input.options?.at;

  if (at !== undefined && refusesTextStartInStruck(place, at)) return null;

  return locateOptionsAt(input, place);
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
  at?: TextTarget;
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
  options?: CommandTargetOptions<TextInsertTextOptions, TextTarget>;
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
  options?: CommandTargetOptions<TextInsertFragmentOptions, TextTarget>;
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
      const selection = state.selection();
      const target =
        input.at ?? (RangeApi.isRange(selection) ? selection : undefined);
      const range =
        target === undefined ? null : resolveCommandRange(state, target);
      const root = rootOrUpdateRoot(range?.anchor.root ?? range?.focus.root);

      if (range) {
        refuseCrossing(getSetSite(getActiveCommandEditor()), range, root);
      }
      const tripleClicked =
        range && RangeApi.isRange(target)
          ? readTripleClickRemoval(state, range)
          : null;

      if (tripleClicked) {
        return state.transaction((tx) => {
          const [next] = getDefined(tx.nodes.next({ at: tripleClicked }));

          tx.nodes.remove({ at: tripleClicked });
          const start = getDefined(tx.points.start(tx.key(next)));

          tx.selection.set({ anchor: start, focus: start });
        });
      }

      const publicRoot = toPublicRoot(root);
      const wholeBlocks = range
        ? readWholeBlockDelete(state, range, publicRoot)
        : null;

      if (wholeBlocks && (input.at !== undefined || wholeBlocks.keepsFirst)) {
        const selectedBlocks = wholeBlocks.blocks;
        const [firstBlock, firstPath] = getDefined(selectedBlocks[0]);
        const [, lastPath] = getDefined(selectedBlocks.at(-1));
        const keyAt = (path: Path) =>
          getDefined(
            state.key({
              offset: 0,
              path,
              ...(publicRoot ? { root: publicRoot } : {}),
            })
          );
        const textRange =
          range && RangeApi.isRange(target) && wholeBlocks.keepsFirst
            ? range
            : null;
        const endsInFirst = textRange !== null && wholeBlocks.endsInFirst;

        if (textRange && (endsInFirst || wholeBlocks.takesCaret)) {
          const at: Range = endsInFirst
            ? textRange
            : {
                anchor: RangeApi.start(textRange),
                focus: {
                  ...getDefined(state.points.end(keyAt(firstPath))),
                  ...(publicRoot ? { root: publicRoot } : {}),
                },
              };

          return state.transaction((tx) => {
            if (selectedBlocks.length > 1) {
              tx.nodes.replaceChildren([], {
                at: PathApi.parent(firstPath),
                count: selectedBlocks.length - 1,
                index: getDefined(firstPath.at(-1)) + 1,
                ...(publicRoot ? { root: publicRoot } : {}),
              });
            }
            if (RangeApi.isCollapsed(at)) {
              tx.selection.set({ anchor: at.anchor, focus: at.anchor });
            } else {
              tx.fragment.delete({ at, direction: input.direction });
            }
          });
        }

        const parentPath = PathApi.parent(firstPath);
        const index = getDefined(firstPath.at(-1));
        const previous = textRange
          ? undefined
          : state.nodes.previous({ at: keyAt(firstPath), sibling: true });
        const previousPoint =
          previous && NodeApi.isElement(previous[0])
            ? state.points.end(keyAt(previous[1]))
            : undefined;
        const next =
          textRange || previousPoint
            ? undefined
            : state.nodes.next({ at: keyAt(lastPath) });
        const nextPoint = next ? state.points.start(keyAt(next[1])) : undefined;
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
        const defaultChild = survivingPoint
          ? null
          : blockReplacing(
              state,
              firstPath,
              root,
              '',
              state.marks() ??
                getConsistentBlockTextMarks(
                  state,
                  selectedBlocks.map(([, path]) => keyAt(path))
                )
            );

        if (
          !survivingPoint &&
          (!defaultChild ||
            (NodeApi.isElement(defaultChild) &&
              defaultChild.children.every(NodeApi.isText) &&
              takesCaretAfterRemoval(state, firstBlock)))
        ) {
          return state.transaction((tx) => {
            tx.fragment.delete({
              direction: input.direction,
              ...(input.at === undefined ? {} : { at: range ?? input.at }),
            });

            if (!NodeApi.isElement(defaultChild)) return;

            const kept = () =>
              getDefined(
                tx.key({
                  offset: 0,
                  path: firstPath,
                  ...(publicRoot ? { root: publicRoot } : {}),
                })
              );
            let block = tx.nodes.get(kept())?.[0];

            while (
              NodeApi.isElement(block) &&
              block.children.length === 1 &&
              NodeApi.isElement(block.children[0])
            ) {
              tx.nodes.unwrap({ at: kept() });
              block = tx.nodes.get(kept())?.[0];
            }
            if (!NodeApi.isElement(block)) return;

            const { children: _children, ...props } = defaultChild;
            const stale = Object.keys(block).filter(
              (key) => key !== 'children' && !(key in props)
            );

            tx.nodes.set(props, { at: kept() });
            if (stale.length > 0) tx.nodes.unset(stale, { at: kept() });
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
            count: selectedBlocks.length,
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
    locate: (input, place) => {
      const located = locateTextOptionsAt(input, place);

      if (located) recordLocatedDestination(place, located.options?.at);

      return located;
    },
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
        const root = rootOrUpdateRoot(SelectionApi.root(state.selection()));
        const typing = typesAtSelection(getActiveCommandEditor(), {
          marks: input.options?.marks,
        });
        const replacement = blockReplacing(
          state,
          getDefined(nodeBlocks[0])[1],
          root,
          nodeReplacementText,
          (typing ? state.marks() : null) ??
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
          if (typing) setNextKeyMarks(getActiveCommandEditor());
        });
      }

      const range = resolveCommandRange(state, input.options?.at);
      const typing = typesAtSelection(getActiveCommandEditor(), {
        at: range ?? undefined,
        marks: input.options?.marks,
      });

      if (range) {
        refuseCrossing(
          getSetSite(getActiveCommandEditor()),
          range,
          rootOrUpdateRoot(range.anchor.root ?? range.focus.root)
        );
      }
      const replacementText = range
        ? limitTextInsert(state, input.text, { at: range })
        : input.text;
      const replacement = range
        ? getFullBlockTextReplacement(
            state,
            range,
            replacementText,
            typing,
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
          if (typing) setNextKeyMarks(getActiveCommandEditor());
        });
      }

      return state.transaction((tx) => {
        writeComposedText(
          getActiveCommandEditor(),
          input.options?.at,
          input.text,
          () => tx.text.insert(input.text, input.options)
        );
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
    locate: locateTextOptionsAt,
    build: ({ input, state }) => {
      const editor = getActiveCommandEditor();
      const plan = planPaste(editor, state, input, 'copy');
      const written = plan && writePaste(editor, plan);

      notePasteLoss(editor, plan && written ? plan.inputCut : false);

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

      const editor = getActiveCommandEditor();

      return state.transaction((tx) => {
        getActiveDocumentChangeBuilder(editor).withKeptLetters(() =>
          tx.text.insert(swapped, { at: { anchor: start, focus: end } })
        );
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
