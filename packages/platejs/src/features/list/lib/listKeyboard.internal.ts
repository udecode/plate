import {
  ElementApi,
  getInjectMatch,
  PathApi,
  RangeApi,
  SelectionApi,
  type Descendant,
  type Editor,
  type Element,
  type Location,
  type NodeEntry,
  type NodeKey,
  type NodeSelection,
  type Path,
} from '../../../core';
import {
  hasNonWritableAt,
  projectEditorView,
  type EditorCoreStateView,
  type EditorUpdateTransaction,
  type TransactionSpec,
} from '../../../facade';
import {
  hasNonWritableBlock,
  rootedBlockSelection,
  selectsCodeBlock,
} from '../../../internal/plugin/indentShift';
import { BaseBlockquotePlugin } from '../../basic-nodes';
import { BaseIndentPlugin } from '../../indent';
import {
  getListFamilies,
  getSiblingsAtPath,
  shiftListFamilyMember,
} from './listFamily.internal';
import { isListItem, LIST_FIELDS, listItemDepth } from './listIndex.internal';

export const handleListTab = (editor: Editor) => {
  const selection = editor.read.selection();

  if (!selection) return false;

  const root = SelectionApi.root(selection);
  const view = root ? projectEditorView(editor, { root }) : editor;
  const entries = view.read.nodes.blocks({
    match: getInjectMatch(view, view.plugin(BaseIndentPlugin)),
    mode: 'lowest',
  });

  if (!entries.some(([node]) => isListItem(node)) || selectsCodeBlock(view)) {
    return false;
  }

  view.plugin(BaseIndentPlugin).update.increase();

  return true;
};

export const handleListUntab = (editor: Editor) => {
  const selection = editor.read.selection();

  if (!selection) return false;

  const root = SelectionApi.root(selection);
  const view = root ? projectEditorView(editor, { root }) : editor;
  const entries = view.read.nodes.blocks({
    match: getInjectMatch(view, view.plugin(BaseIndentPlugin)),
    mode: 'lowest',
  });
  const isRootItem = ([node]: NodeEntry<Element>) =>
    isListItem(node) && listItemDepth(node) <= 1;

  if (!entries.some(([node]) => isListItem(node)) || selectsCodeBlock(view)) {
    return false;
  }

  const quote = editor.plugin(BaseBlockquotePlugin);
  const quoteType = quote.installed ? quote.schema.type : undefined;
  const enclosingQuotePath = (path: Path) =>
    quoteType === undefined
      ? undefined
      : view.read.nodes.above({
          at: path,
          match: (node, abovePath) =>
            abovePath.length < path.length &&
            ElementApi.isElement(node) &&
            node.type === quoteType,
        })?.[1];
  const isQuoted = ([, path]: NodeEntry<Element>) =>
    enclosingQuotePath(path) !== undefined;
  const lifted = entries.filter(
    (entry) =>
      (isRootItem(entry) || (!isListItem(entry[0]) && !entry[0].indent)) &&
      isQuoted(entry)
  );
  const outdented = entries.filter(
    (entry) => !isRootItem(entry) && Number(entry[0].indent ?? 0) > 0
  );

  if (lifted.length > 0 || outdented.length > 0) {
    view.update((tx) => {
      const liftedFamilies = getListFamilies(tx, lifted);
      const lifting = new Set(
        liftedFamilies.flatMap((family) => family.map(({ node }) => node))
      );
      const outdentNodes = new Set<Descendant>(
        outdented.filter(([node]) => !lifting.has(node)).map(([node]) => node)
      );

      if (outdentNodes.size > 0) {
        tx.plugin(BaseIndentPlugin).decrease({
          match: (node) => ElementApi.isElement(node) && outdentNodes.has(node),
        });
      }

      // A lifted root item takes its family out of the quote, each member one
      // level shallower, so the family keeps its shape.
      for (const family of liftedFamilies.toReversed()) {
        const [head, ...members] = family;

        if (!head) continue;

        const quotePath = enclosingQuotePath(head.path);

        if (
          family.some(({ path }) =>
            hasNonWritableBlock(editor, path, root, { descendants: true })
          ) ||
          (quotePath !== undefined &&
            hasNonWritableBlock(editor, quotePath, root, { descendants: true }))
        ) {
          continue;
        }
        for (const member of members.toReversed()) {
          shiftListFamilyMember(tx, member, -1);
          tx.nodes.lift({ at: member.key });
        }
        if (isListItem(head.node)) {
          tx.nodes.unset([...LIST_FIELDS, 'indent'], { at: head.key });
        }
        tx.nodes.lift({ at: head.key });
      }
    });
  }

  return true;
};

export const handleTaskModEnter = (editor: Editor) => {
  const selection = editor.read.selection();

  if (!selection) return false;

  const root = SelectionApi.root(selection);
  const view = root ? projectEditorView(editor, { root }) : editor;
  const tasks = view.read.nodes.blocks({
    match: (node) => ElementApi.isElement(node) && node.listType === 'task',
    mode: 'lowest',
  });

  if (tasks.length === 0) return false;

  const writable = tasks.filter(
    ([, path]) => !hasNonWritableBlock(editor, path, root)
  );

  // Consume Mod+Enter on locked tasks so ExitBreakPlugin does not insert a
  // paragraph underneath them.
  if (writable.length === 0) return true;

  const nextChecked = writable.some(([node]) => node.checked !== true);

  view.update((tx) => {
    for (const [, path] of writable) {
      tx.nodes.set({ checked: nextChecked }, { at: path });
    }
  });

  return true;
};

type ListCommandResult = false | TransactionSpec;
type ListCommandTx = Pick<
  EditorUpdateTransaction,
  'children' | 'key' | 'nodes' | 'root' | 'selection'
> & {
  indent: {
    decrease: (options?: {
      at?: Location | NodeSelection;
    }) => boolean | undefined;
  };
};
type ListCommandState = EditorCoreStateView & {
  transaction: ((fn: (tx: ListCommandTx) => void) => TransactionSpec) & {
    extend: (
      result: TransactionSpec,
      fn: (tx: ListCommandTx) => void
    ) => TransactionSpec;
  };
};

const getElementAtPath = (
  rootChildren: readonly Descendant[],
  path: Path
): Element | undefined => {
  if (path.length === 0) return undefined;

  const siblings = getSiblingsAtPath(rootChildren, PathApi.parent(path));
  const node = siblings[path.at(-1) ?? -1];

  return ElementApi.isElement(node) ? node : undefined;
};

export const handleListDeleteBackward = (
  editor: Editor,
  {
    direction,
    next,
    state,
  }: {
    direction: string;
    next: () => ListCommandResult;
    state: ListCommandState;
  }
): ListCommandResult => {
  if (direction !== 'backward') return next();

  const selection = state.selection();
  const hasNodeSelection = state.selection.nodes().length > 0;
  const nodeEntry =
    selection && !hasNodeSelection
      ? state.nodes.block({ at: selection })
      : undefined;

  if (
    !nodeEntry ||
    !selection ||
    hasNodeSelection ||
    !isListItem(nodeEntry[0]) ||
    state.selection.isExpanded()
  ) {
    return next();
  }

  const root = SelectionApi.root(selection) ?? state.view.root();
  const blockKey = state.key(nodeEntry[0]);

  if (!blockKey) return next();

  const blockStart = state.points.start(blockKey);
  const isAtBlockStart =
    state.points.isStart(selection.anchor, blockKey) ||
    (!!blockStart &&
      state.text.string({
        anchor: blockStart,
        focus: selection.anchor,
      }) === '');

  if (!isAtBlockStart) return next();
  if (hasNonWritableBlock(editor, nodeEntry[1], root)) return next();

  const [family] = getListFamilies(state, [nodeEntry], root);

  if (family?.some(({ path }) => hasNonWritableBlock(editor, path, root))) {
    return false;
  }

  return state.transaction((tx) => {
    tx.indent.decrease({ at: rootedBlockSelection(nodeEntry[1], root) });
  });
};

export const handleListInsertBreak = (
  editor: Editor,
  {
    next,
    state,
  }: {
    next: () => ListCommandResult;
    state: ListCommandState;
  }
): ListCommandResult => {
  const selection = state.selection();
  const hasNodeSelection = state.selection.nodes().length > 0;

  if (!selection || hasNodeSelection) return next();

  const startPoint = RangeApi.start(selection);
  const startEntry = state.nodes.block({ at: startPoint });

  if (!startEntry || !isListItem(startEntry[0])) return next();

  const root = SelectionApi.root(selection) ?? state.view.root();
  const isExpanded = state.selection.isExpanded();

  if (!isExpanded && state.nodes.isEmpty(startEntry[0])) {
    if (hasNonWritableBlock(editor, startEntry[1], root)) return next();

    const [family] = getListFamilies(state, [startEntry], root);

    if (family?.some(({ path }) => hasNonWritableBlock(editor, path, root))) {
      return false;
    }

    return state.transaction((tx) => {
      tx.indent.decrease({ at: rootedBlockSelection(startEntry[1], root) });
    });
  }

  const [blockNode, blockPath] = startEntry;
  const beforeKey = state.key(blockNode);

  if (!beforeKey) return next();

  const startsAtBlockStart = state.points.isStart(startPoint, beforeKey);
  const moveStartProps =
    !isExpanded &&
    startsAtBlockStart &&
    (Object.hasOwn(blockNode, 'listStart') ||
      Object.hasOwn(blockNode, 'listRestart'));
  const uncheckNewTask =
    blockNode.listType === 'task' &&
    blockNode.checked === true &&
    !hasNonWritableAt(editor, selection);

  if (!moveStartProps && !uncheckNewTask) return next();

  const endEntry = state.nodes.block({ at: RangeApi.end(selection) });
  const sameBlock = !!endEntry && PathApi.equals(blockPath, endEntry[1]);
  const preIndex = (
    root && root !== state.view.root()
      ? projectEditorView(editor, { root }).read
      : state
  ).runtime.snapshot().index;

  const result = next();

  if (result === false) return result;

  return state.transaction.extend(result, (tx) => {
    const rootChildren = root ? tx.root(root) : tx.children();
    const inserted = getElementAtPath(rootChildren, blockPath);
    const shifted = getElementAtPath(rootChildren, PathApi.next(blockPath));
    const firstKey = inserted ? tx.key(inserted) : null;
    const secondKey = shifted ? tx.key(shifted) : null;
    const isNewKey = (key: NodeKey | null): key is NodeKey =>
      key !== null && preIndex.pathOf(key) === null;

    if (
      moveStartProps &&
      inserted &&
      shifted &&
      firstKey &&
      secondKey &&
      (isNewKey(firstKey) || isNewKey(secondKey)) &&
      isListItem(inserted) &&
      isListItem(shifted)
    ) {
      const unsetKeys: Array<'listRestart' | 'listStart'> = [];
      const hasListStart =
        Object.hasOwn(shifted, 'listStart') &&
        typeof shifted.listStart === 'number';
      const hasListRestart =
        Object.hasOwn(shifted, 'listRestart') &&
        typeof shifted.listRestart === 'number';

      if (hasListStart) unsetKeys.push('listStart');
      if (hasListRestart) unsetKeys.push('listRestart');

      if (unsetKeys.length > 0) {
        if (hasListStart) {
          tx.nodes.set({ listStart: shifted.listStart }, { at: firstKey });
        }
        if (hasListRestart) {
          tx.nodes.set({ listRestart: shifted.listRestart }, { at: firstKey });
        }
        tx.nodes.unset(unsetKeys, { at: secondKey });
      }
    }

    if (!uncheckNewTask) return;

    if (
      sameBlock &&
      startsAtBlockStart &&
      inserted?.listType === 'task' &&
      shifted?.listType === 'task' &&
      firstKey &&
      secondKey &&
      (isNewKey(firstKey) || isNewKey(secondKey)) &&
      !tx.nodes.isEmpty(shifted)
    ) {
      tx.nodes.set({ checked: false }, { at: firstKey });

      return;
    }

    const afterSelection = tx.selection();
    const afterPoint = afterSelection
      ? {
          ...afterSelection.anchor,
          ...(root ? { root } : {}),
        }
      : undefined;
    const caretEntry = afterPoint
      ? tx.nodes.block({ at: afterPoint })
      : undefined;
    const caretKey = caretEntry ? tx.key(caretEntry[0]) : null;

    if (
      caretEntry &&
      caretEntry[0].listType === 'task' &&
      caretEntry[0].checked === true &&
      isNewKey(caretKey)
    ) {
      tx.nodes.set({ checked: false }, { at: caretKey });

      return;
    }

    if (
      shifted?.listType === 'task' &&
      shifted.checked === true &&
      isNewKey(secondKey)
    ) {
      tx.nodes.set({ checked: false }, { at: secondKey });
    }
  });
};
