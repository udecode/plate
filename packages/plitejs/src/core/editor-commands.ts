import { isStructuralEdge } from '../editor/point';
import type {
  ContentSlice,
  EditorCommand,
  EditorCommandPlace,
  EditorStateView,
  EditorToggleBlockOptions,
  EditorToggleMarkOptions,
  EditorTransactionSpecBuilder,
  NamedRootKey,
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
import {
  defineCommand,
  registerImplicitTargetCommand,
} from './command-definition';
import { refusesTextStartInStruck, removesAtPlace } from './command-frame';
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
  getCurrentSelection,
  getEditorUpdateRoot,
  getSetSite,
  peekImplicitTarget,
} from './public-state';
import { toCompiledNodeContext } from './schema-compiler';
import { refuseCrossing } from './set-root';
import { notePasteLoss, planPaste, writePaste } from './slice-landing';
import {
  defineUpdateAnnotation,
  readLastCommitAnnotation,
} from './transaction-values';
import { areEditorJsonValuesEqual } from './value-codec';
import { holdsWritableText } from './writable-text';

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

const readCommandTarget = <TTarget extends NodeTarget>(
  state: CommandStateView,
  at: TTarget | undefined
): TTarget | EditorSelection | null => {
  if (at !== undefined) return at;
  if (state.selection() === null) return null;

  const editor = getActiveCommandEditor();

  return peekImplicitTarget(editor) ?? getCurrentSelection(editor);
};

const readLandingRange = (
  state: CommandStateView,
  target: NodeTarget | EditorSelection | null | undefined
): Range | null =>
  !target || SelectionApi.isNode(target)
    ? null
    : (resolveCommandRange(state, target) ?? null);

const equalsInRoot = (point: Point | undefined, target: Point) => {
  if (!point) return false;

  return PointApi.equals(
    point.root === undefined && target.root !== undefined
      ? { ...point, root: target.root }
      : point,
    target
  );
};

const selectMovedTarget = (
  tx: EditorTransactionSpecBuilder,
  state: CommandStateView,
  at: NodeTarget | undefined,
  target: NodeTarget | EditorSelection | null
) => {
  const stored = state.selection();

  if (
    at === undefined &&
    RangeApi.isRange(target) &&
    !(
      stored &&
      equalsInRoot(stored.anchor, target.anchor) &&
      equalsInRoot(stored.focus, target.focus)
    )
  ) {
    tx.selection.set(target);

    return true;
  }

  return false;
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

const isGrid = (state: CommandStateView, node: Element) =>
  getCompiledEditorSchemaFromApi(state.schema)?.elements.byType.get(node.type)
    ?.structure?.kind === 'grid';

const takesText = (state: CommandStateView, node: Node | undefined) =>
  NodeApi.isElement(node) &&
  !isGrid(state, node) &&
  holdsWritableText(getInternalEditorSchemaFromApi(state.schema), node);

export const tripleClickedBlock = defineUpdateAnnotation<NodeKey>({
  key: 'selection.triple-clicked-block',
});

type WholeBlockLanding = {
  readonly blocks: ReadonlyArray<NodeEntry<Element>>;
  readonly root: NamedRootKey | undefined;
} & (
  | Readonly<{ keeps: 'first'; spansLines: boolean; text: Range }>
  | Readonly<{ keeps: 'next' }>
  | Readonly<{ keeps: 'previous' }>
  | Readonly<{
      block: Descendant;
      keeps: 'default';
      reusesFirst: boolean;
      whole: boolean;
    }>
);

export const readWholeBlockLanding = (
  state: CommandStateView,
  at: NodeTarget,
  { root, tripleClicked }: { root: string; tripleClicked: NodeKey | null }
): WholeBlockLanding | null => {
  const range = resolveCommandRange(state, at);
  const blocks = range && getFullySelectedSiblingBlocks(state, range);

  if (!range || !blocks) return null;

  const publicRoot = toPublicRoot(root);
  const inRoot = publicRoot ? { root: publicRoot } : {};
  const keyAt = (path: Path) =>
    getDefined(state.key({ offset: 0, path, ...inRoot }));
  const [first, firstPath] = getDefined(blocks[0]);
  const next = state.nodes.get({
    offset: 0,
    path: PathApi.next(getDefined(blocks.at(-1))[1]),
    ...inRoot,
  })?.[0];
  const clicked = tripleClicked && state.nodes.get(tripleClicked)?.[1];
  const landing = { blocks, root: publicRoot };

  if (
    clicked &&
    blocks.length === 1 &&
    PathApi.isCommon(firstPath, clicked) &&
    takesText(state, first) &&
    takesText(state, next) &&
    getInternalEditorSchemaFromApi(state.schema).canPlaceAtPath(firstPath, [], {
      removing: [getDefined(firstPath.at(-1))],
      root,
    })
  ) {
    return { ...landing, keeps: 'next' };
  }

  const keepsFirst = PathApi.hasPrevious(firstPath) || next !== undefined;

  if (RangeApi.isRange(at)) {
    const endsInFirst = PathApi.isAncestor(firstPath, RangeApi.end(range).path);

    if (keepsFirst && (endsInFirst || takesText(state, first))) {
      const text = endsInFirst
        ? range
        : {
            anchor: RangeApi.start(range),
            focus: getDefined(
              withPointRoot(state.points.end(keyAt(firstPath)), publicRoot)
            ),
          };
      const [startLine, endLine] = RangeApi.edges(text).map((point) =>
        state.nodes.block({ at: point, mode: 'lowest' })
      );

      return {
        ...landing,
        keeps: 'first',
        spansLines:
          !!startLine && !!endLine && !PathApi.equals(startLine[1], endLine[1]),
        text,
      };
    }
  } else if (PathApi.hasPrevious(firstPath)) {
    return { ...landing, keeps: 'previous' };
  } else if (next) {
    return { ...landing, keeps: 'next' };
  }

  const block = blockReplacing(
    state,
    firstPath,
    root,
    '',
    state.marks() ??
      getConsistentBlockTextMarks(
        state,
        blocks.map(([, path]) => keyAt(path))
      )
  );

  if (!block) return null;

  return {
    ...landing,
    block,
    keeps: 'default',
    reusesFirst:
      !keepsFirst &&
      NodeApi.isElement(block) &&
      block.children.every(NodeApi.isText) &&
      takesText(state, first),
    whole: !keepsFirst,
  };
};

const writeWholeBlockLanding = (
  tx: EditorTransactionSpecBuilder,
  landing: WholeBlockLanding,
  {
    at,
    direction,
    selectsText = false,
  }: { at: Range; direction: 'backward' | 'forward'; selectsText?: boolean }
) => {
  const { blocks, root } = landing;
  const [, firstPath] = getDefined(blocks[0]);
  const [, lastPath] = getDefined(blocks.at(-1));
  const parentPath = PathApi.parent(firstPath);
  const index = getDefined(firstPath.at(-1));
  const inRoot = root ? { root } : {};
  const keyAt = (path: Path) =>
    getDefined(tx.key({ offset: 0, path, ...inRoot }));
  const replace = (
    path: Path,
    from: number,
    count: number,
    children: readonly Descendant[] = []
  ) => {
    if (count > 0 || children.length > 0) {
      tx.nodes.replaceChildren(children, {
        at: path,
        count,
        index: from,
        ...inRoot,
      });
    }
  };
  const collapse = (point: Point | undefined) => {
    const caret = withPointRoot(point, root);

    if (caret) tx.selection.set({ anchor: caret, focus: caret });
  };

  if (landing.keeps === 'next' || landing.keeps === 'previous') {
    const kept = keyAt(
      landing.keeps === 'next'
        ? PathApi.next(lastPath)
        : PathApi.previous(firstPath)
    );

    replace(parentPath, index, blocks.length);
    collapse(
      landing.keeps === 'next' ? tx.points.start(kept) : tx.points.end(kept)
    );
    return;
  }
  if (landing.keeps === 'first') {
    replace(parentPath, index + 1, blocks.length - 1);
    if (RangeApi.isCollapsed(landing.text)) {
      collapse(landing.text.anchor);
    } else if (selectsText) {
      tx.selection.set(landing.text);
    } else {
      tx.fragment.delete({ at: landing.text, direction });
    }
    return;
  }
  if (!landing.reusesFirst) {
    replace(parentPath, index, blocks.length, [landing.block]);
    collapse(tx.points.start(keyAt(firstPath)));

    const blockText = NodeApi.texts(landing.block).next().value;
    const marks = blockText ? NodeApi.extractProps(blockText[0]) : {};

    if (Object.keys(marks).length > 0) tx.marks.set(marks);
    return;
  }

  tx.fragment.delete({ at, direction });

  let kept = tx.nodes.get(keyAt(firstPath))?.[0];

  while (
    NodeApi.isElement(kept) &&
    kept.children.length === 1 &&
    NodeApi.isElement(kept.children[0])
  ) {
    tx.nodes.unwrap({ at: keyAt(firstPath) });
    kept = tx.nodes.get(keyAt(firstPath))?.[0];
  }
  if (!NodeApi.isElement(kept) || !NodeApi.isElement(landing.block)) return;

  const { children: _children, ...props } = landing.block;
  const stale = Object.keys(kept).filter(
    (key) => key !== 'children' && !(key in props)
  );

  tx.nodes.set(props, { at: keyAt(firstPath) });
  if (stale.length > 0) tx.nodes.unset(stale, { at: keyAt(firstPath) });
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
  marks: Record<string, unknown> | null
): Descendant | null => {
  const publicRoot = toPublicRoot(root);
  const defaultChild = state.schema.createDefaultChild({
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

const typesInPlace = (
  state: CommandStateView,
  blocks: ReadonlyArray<NodeEntry<Element>>,
  text: string
) =>
  blocks.length === 1 &&
  getInternalEditorSchemaFromApi(state.schema).canContain(
    getDefined(blocks[0])[0],
    { text }
  );

const readRangeLanding = (state: CommandStateView, range: Range) => {
  if (RangeApi.isCollapsed(range)) return null;

  const root = rootOrUpdateRoot(range.anchor.root ?? range.focus.root);
  const landing = readWholeBlockLanding(state, range, {
    root,
    tripleClicked: null,
  });

  const lands =
    landing?.keeps === 'first'
      ? !landing.spansLines
      : landing?.keeps === 'default' && !landing.whole;

  return landing && lands ? { landing, root } : null;
};

const breakAfterLanding = (
  state: CommandStateView,
  write: (tx: EditorTransactionSpecBuilder) => void
) => {
  const target = readCommandTarget(state, undefined);
  const range = readLandingRange(state, target);
  const over = range && readRangeLanding(state, range);

  if (range && over) {
    refuseCrossing(getSetSite(getActiveCommandEditor()), range, over.root);
  }

  return state.transaction((tx) => {
    selectMovedTarget(tx, state, undefined, target);
    if (range && over) {
      writeWholeBlockLanding(tx, over.landing, {
        at: range,
        direction: 'backward',
      });
    }
    write(tx);
  });
};

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

  const [, firstPath] = getDefined(blocks[0]);

  if (!force && typesInPlace(state, blocks, text)) return null;

  const root = rootOrUpdateRoot(range.anchor.root ?? range.focus.root);
  const publicRoot = toPublicRoot(root);
  const inRoot = publicRoot ? { root: publicRoot } : {};
  const replacement = blockReplacing(
    state,
    firstPath,
    root,
    text,
    (typing ? state.marks() : null) ??
      getConsistentBlockTextMarks(
        state,
        blocks.map(([, path]) =>
          getDefined(state.key({ offset: 0, path, ...inRoot }))
        )
      )
  );

  if (!replacement) return null;

  const firstText = NodeApi.texts(replacement).next().value;

  if (!firstText) return null;

  const parentPath = PathApi.parent(firstPath);
  const index = getDefined(firstPath.at(-1));
  const point: Point = {
    offset: text.length,
    path: [...parentPath, index, ...firstText[1]],
    ...inRoot,
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
  TInput extends { options?: { at?: NodeSelection | TextTarget } },
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
      removesAtPlace(place, input.at);
      if (input.at === undefined) return input;

      const at = place.location(input.at);

      return at === null ? null : { ...input, at };
    },
    build: ({ input, state }) => {
      const target = readCommandTarget(state, input.at) ?? undefined;
      const at = SelectionApi.isNode(target) ? undefined : target;
      const range = readLandingRange(state, target);
      const root = rootOrUpdateRoot(range?.anchor.root ?? range?.focus.root);

      if (range) {
        refuseCrossing(getSetSite(getActiveCommandEditor()), range, root);
      }
      const landing =
        at !== undefined && range
          ? readWholeBlockLanding(state, at, {
              root,
              tripleClicked: RangeApi.isRange(at)
                ? readLastCommitAnnotation(state, tripleClickedBlock, range)
                : null,
            })
          : null;

      if (
        range &&
        landing &&
        (input.at !== undefined ||
          landing.keeps !== 'default' ||
          !landing.whole)
      ) {
        return state.transaction((tx) => {
          writeWholeBlockLanding(tx, landing, {
            at: range,
            direction: input.direction,
          });
        });
      }

      return state.transaction((tx) => {
        if (SelectionApi.isNode(target)) tx.selection.set(target);
        tx.fragment.delete({
          direction: input.direction,
          ...(at === undefined ? {} : { at }),
        });
      });
    },
  }),
  insertBreak: defineCommand('break.insert', {
    build: ({ state }) =>
      breakAfterLanding(state, (tx) => {
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
      breakAfterLanding(state, (tx) => {
        tx.break.insertSoft();
      }),
  }),
  insertText: defineCommand<InsertTextCommand>('text.insert', {
    locate: (input, place) => {
      const located = locateTextOptionsAt(input, place);

      if (located) {
        recordLocatedDestination(place, located.options?.at, input.options?.at);
      }

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
        const firstBlock = getDefined(nodeBlocks[0])[0];
        const rawReplacement = blockReplacing(
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
        const replacement =
          rawReplacement &&
          NodeApi.isElement(rawReplacement) &&
          rawReplacement.type === firstBlock.type &&
          typeof firstBlock.id === 'string'
            ? { ...rawReplacement, id: firstBlock.id }
            : rawReplacement;
        const nodeReplacement =
          replacement &&
          getNodeSelectionReplacement(state, nodeBlocks, root, [replacement]);

        if (!nodeReplacement) return false;

        return state.transaction((tx) => {
          replaceSelectedBlocks(tx, nodeReplacement);
          if (typing) setNextKeyMarks(getActiveCommandEditor());
        });
      }

      const target = readCommandTarget(state, input.options?.at);
      const range = readLandingRange(state, target);
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
      const over =
        range && !LINE_BREAK_PATTERN.test(replacementText)
          ? readRangeLanding(state, range)
          : null;

      if (
        range &&
        over?.landing.keeps === 'first' &&
        !typesInPlace(state, over.landing.blocks, replacementText)
      ) {
        const { landing } = over;

        return state.transaction((tx) => {
          selectMovedTarget(tx, state, input.options?.at, target);
          writeWholeBlockLanding(tx, landing, {
            at: range,
            direction: 'backward',
            selectsText: true,
          });
          tx.text.insert(
            replacementText,
            input.options?.at === undefined
              ? input.options
              : { ...input.options, at: landing.text }
          );
          if (typing) setNextKeyMarks(getActiveCommandEditor());
        });
      }

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
          selectMovedTarget(tx, state, input.options?.at, target);
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
        const moved = selectMovedTarget(tx, state, input.options?.at, target);
        writeComposedText(
          getActiveCommandEditor(),
          input.options?.at,
          input.text,
          () => tx.text.insert(input.text, input.options),
          moved
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

registerImplicitTargetCommand(editorCommands.addMark);
registerImplicitTargetCommand(editorCommands.delete, undefined, {
  refusesCrossing: true,
});
registerImplicitTargetCommand(editorCommands.insertBreak, undefined, {
  refusesCrossing: true,
});
registerImplicitTargetCommand(editorCommands.insertSoftBreak, undefined, {
  refusesCrossing: true,
});
registerImplicitTargetCommand(editorCommands.removeMark);
registerImplicitTargetCommand(editorCommands.toggleMark);
registerImplicitTargetCommand(editorCommands.transposeCharacter);
registerImplicitTargetCommand(
  editorCommands.deleteFragment,
  (input) => input.at === undefined,
  { refusesCrossing: true }
);
registerImplicitTargetCommand(
  editorCommands.insertNodes,
  (input) => input.options?.at === undefined
);
registerImplicitTargetCommand(
  editorCommands.insertText,
  (input) => input.options?.at === undefined,
  { refusesCrossing: true }
);
registerImplicitTargetCommand(
  editorCommands.removeNodes,
  (input) => input.options?.at === undefined
);
registerImplicitTargetCommand(
  editorCommands.setNodes,
  (input) => input.options?.at === undefined
);
registerImplicitTargetCommand(
  editorCommands.toggleBlock,
  (input) => input.options?.at === undefined
);
