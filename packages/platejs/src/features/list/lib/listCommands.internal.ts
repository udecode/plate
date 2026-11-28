import {
  ElementApi,
  PathApi,
  type Descendant,
  type Editor,
  type Element,
  type Location,
  type NodeEntry,
  type NodeKey,
  type NodeSelection,
  type Path,
} from '../../../core';
import type { EditorUpdateTransaction } from '../../../facade';
import {
  applyBlockReleases,
  readBlockReleases,
} from '../../../internal/plugin/blockRelease';
import {
  hasNonWritableBlock,
  resolveTargetRoot,
} from '../../../internal/plugin/indentShift';
import type { ListSetOptions, ListToggleOptions } from './BaseListPlugin';
import { planListConversion } from './listConversion.internal';
import { rootedNodeReader } from './listFamily.internal';
import {
  getListRunSiblings,
  readListPosition,
  resolveListIdentity,
} from './listIdentity.internal';
import {
  getHeadingType,
  isListItem,
  isListLevels,
  LIST_FIELDS,
  normalizeListStyle,
} from './listIndex.internal';

type ListMatch = (node: Descendant, path: Path) => boolean;

const didListFieldsChange = (
  tx: EditorUpdateTransaction,
  candidates: ReadonlyArray<Readonly<{ key: NodeKey; node: Element }>>
) =>
  candidates.some(({ key, node: before }) => {
    const after = tx.nodes.get(key)?.[0];

    return (
      ElementApi.isElement(after) &&
      (before.indent !== after.indent ||
        LIST_FIELDS.some((field) => before[field] !== after[field]))
    );
  });

const keyedEntries = (
  tx: EditorUpdateTransaction,
  list: ReadonlyArray<NodeEntry<Element>>
) =>
  list.flatMap(([node, path]) => {
    const key = tx.key(node);

    return key ? [{ key, node, path }] : [];
  });

const resolveTargets = (
  editor: Editor,
  tx: EditorUpdateTransaction,
  match: ListMatch,
  at: Location | NodeSelection | undefined
) => {
  const root = resolveTargetRoot(at, tx.view.root(), tx.selection());
  const lowestBlocks = tx.nodes.blocks({ at, mode: 'lowest' });
  const writableBlocks = lowestBlocks.filter(
    ([, path]) => !hasNonWritableBlock(editor, path, root)
  );
  const allReleases = readBlockReleases(
    editor,
    tx,
    writableBlocks,
    (block, [, path]) => match(block, path)
  );
  const releases = allReleases.filter(
    ({ container: [, containerPath] }) =>
      !hasNonWritableBlock(editor, containerPath, root, { descendants: true })
  );
  const holdsRelease = ([, path]: NodeEntry<Element>) =>
    allReleases.some(({ container: [, containerPath] }) =>
      PathApi.isCommon(path, containerPath)
    );
  const matched = tx.nodes
    .blocks({ at, match, mode: 'lowest' })
    .filter(
      (entry) =>
        !hasNonWritableBlock(editor, entry[1], root) && !holdsRelease(entry)
    );

  return {
    matched,
    releases,
    root,
    selectedBlockCount: lowestBlocks.length,
  };
};

export const applyListClear = (
  editor: Editor,
  tx: EditorUpdateTransaction,
  match: ListMatch,
  { at }: { at?: Location | NodeSelection } = {}
): boolean => {
  const root = resolveTargetRoot(at, tx.view.root(), tx.selection());
  let changed = false;

  for (const [node, path] of tx.nodes.blocks({
    at,
    match,
    mode: 'lowest',
  })) {
    const key = tx.key(node);

    if (!key || !isListItem(node) || hasNonWritableBlock(editor, path, root)) {
      continue;
    }
    tx.nodes.unset([...LIST_FIELDS, 'indent'], { at: key });
    changed = true;
  }

  return changed;
};

export const applyListSet = (
  editor: Editor,
  tx: EditorUpdateTransaction,
  match: ListMatch,
  { at, checked, style, type }: ListSetOptions
): boolean => {
  if (
    (at === undefined && !tx.selection()) ||
    (PathApi.isPath(at) && at.length === 0)
  ) {
    return false;
  }

  const { matched, releases, root, selectedBlockCount } = resolveTargets(
    editor,
    tx,
    match,
    at
  );

  if (matched.length === 0 && releases.length === 0) return false;

  const depths =
    releases.length > 0
      ? planListConversion(editor, tx, releases, { listType: type })
      : new Map<NodeKey, number>();

  if (!depths) return false;

  const keys = [
    ...matched.flatMap(([node]) => tx.key(node) ?? []),
    ...releases.map((release) => release.key),
  ];

  applyBlockReleases(tx, releases);

  const entries = keys
    .flatMap((key) => {
      const entry = tx.nodes.get(key, { match: ElementApi.isElement });

      return entry ? [entry] : [];
    })
    .toSorted(([, left], [, right]) => PathApi.compare(left, right));

  if (entries.length === 0) return false;

  const headingType = getHeadingType(editor);
  const reader = rootedNodeReader(tx, root);
  const isSingleTextBlock =
    at === undefined &&
    checked === undefined &&
    selectedBlockCount === 1 &&
    tx.selection.nodes().length === 0;
  // Expand single-block text selections (without explicit `at` or `checked`)
  // across the current sibling run, filtering locked peers before any write.
  const targets =
    isSingleTextBlock && entries.length === 1 && isListItem(entries[0][0])
      ? [
          entries[0],
          ...getListRunSiblings(reader, entries[0], headingType),
        ].filter(([, path]) => !hasNonWritableBlock(editor, path, root))
      : [...entries];
  const written = keyedEntries(tx, targets);
  const explicitStyle =
    style === undefined || style === null
      ? undefined
      : normalizeListStyle(type, style);
  // Blocks that become list items join one list: the one the first of them
  // joins, or a fresh one.
  let identity: ReturnType<typeof resolveListIdentity> | undefined;

  for (const { key, node, path } of written) {
    const currentIndent = Number(node.indent ?? 0);
    const indent =
      depths.get(key) ??
      (isListItem(node) ? Math.max(1, currentIndent || 1) : currentIndent + 1);
    const preserveExistingStyle =
      style === undefined && type !== 'task' && node.listType === type;
    const nextStyle =
      type === 'task' || style === null
        ? undefined
        : style !== undefined
          ? explicitStyle
          : preserveExistingStyle && typeof node.listStyle === 'string'
            ? node.listStyle
            : undefined;

    if (!isListItem(node)) {
      identity ??= resolveListIdentity(reader, path, {
        depth: indent,
        heading: headingType !== undefined && node.type === headingType,
        headingType,
        listType: type,
        style: nextStyle,
      });
    }

    const nextChecked =
      checked ?? (typeof node.checked === 'boolean' ? node.checked : false);

    tx.nodes.set(
      {
        indent,
        listType: type,
        ...(type === 'task' ? { checked: nextChecked } : {}),
        ...(!preserveExistingStyle && nextStyle !== undefined
          ? { listStyle: nextStyle }
          : {}),
        ...(!isListItem(node) && identity?.listId !== undefined
          ? { listId: identity.listId }
          : {}),
        ...(!isListItem(node) && identity?.listLevels !== undefined
          ? { listLevels: identity.listLevels }
          : {}),
      },
      { at: key }
    );

    if (type !== 'task' && Object.hasOwn(node, 'checked')) {
      tx.nodes.unset('checked', { at: key });
    }
    if (
      !preserveExistingStyle &&
      nextStyle === undefined &&
      Object.hasOwn(node, 'listStyle')
    ) {
      tx.nodes.unset('listStyle', { at: key });
    }
  }

  for (const [key, depth] of depths) {
    tx.nodes.set({ indent: depth }, { at: key });
  }

  return didListFieldsChange(tx, written) || releases.length > 0;
};

export const applyListToggle = (
  editor: Editor,
  tx: EditorUpdateTransaction,
  match: ListMatch,
  { at, type }: ListToggleOptions
): boolean => {
  if (
    (at === undefined && !tx.selection()) ||
    (PathApi.isPath(at) && at.length === 0)
  ) {
    return false;
  }

  const { matched, releases } = resolveTargets(editor, tx, match, at);

  if (matched.length === 0 && releases.length === 0) return false;

  if (
    releases.length === 0 &&
    matched.every(([node]) => node.listType === type)
  ) {
    const unset = keyedEntries(tx, matched);

    for (const { key, node } of unset) {
      const indent = Number(node.indent ?? 0);

      tx.nodes.unset([...LIST_FIELDS], { at: key });

      if (indent > 1) {
        tx.nodes.set({ indent: indent - 1 }, { at: key });
      } else {
        tx.nodes.unset('indent', { at: key });
      }
    }

    return didListFieldsChange(tx, unset);
  }

  return applyListSet(editor, tx, match, { at, type });
};

export const applyListRestart = (
  editor: Editor,
  tx: EditorUpdateTransaction,
  { at, start = 1 }: { at?: Location | NodeSelection; start?: number } = {}
): boolean => {
  const [entry] = tx.nodes.blocks({
    at,
    match: (node) => ElementApi.isElement(node) && node.listType === 'numbered',
    mode: 'lowest',
  });
  const root = resolveTargetRoot(at, tx.view.root(), tx.selection());
  const key = entry ? tx.key(entry[0]) : null;

  if (
    !entry ||
    !key ||
    hasNonWritableBlock(editor, entry[1], root) ||
    entry[0].listRestart === start
  ) {
    return false;
  }
  tx.nodes.set({ listRestart: start }, { at: key });

  return true;
};

export const applyListContinue = (
  editor: Editor,
  tx: EditorUpdateTransaction,
  { at }: { at?: Location | NodeSelection } = {}
): boolean => {
  const [entry] = tx.nodes.blocks({
    at,
    match: (node) => ElementApi.isElement(node) && node.listType === 'numbered',
    mode: 'lowest',
  });
  const root = resolveTargetRoot(at, tx.view.root(), tx.selection());
  const key = entry ? tx.key(entry[0]) : null;

  if (!entry || !key || hasNonWritableBlock(editor, entry[1], root)) {
    return false;
  }
  if (Object.hasOwn(entry[0], 'listRestart')) {
    tx.nodes.unset('listRestart', { at: key });

    return true;
  }

  const position = readListPosition(
    root ? tx.root(root) : tx.children(),
    entry[0],
    getHeadingType(editor)
  );
  const previous = position?.previousCompatible?.[0];

  if (!position || position.index !== 0 || !previous) return false;
  if (
    position.items.some(([, path]) => hasNonWritableBlock(editor, path, root))
  ) {
    return false;
  }

  for (const [itemNode] of position.items) {
    const itemKey = tx.key(itemNode);

    if (!itemKey) continue;
    if (typeof previous.listId === 'string') {
      tx.nodes.set({ listId: previous.listId }, { at: itemKey });
    } else {
      tx.nodes.unset('listId', { at: itemKey });
    }
    if (isListLevels(previous.listLevels)) {
      tx.nodes.set({ listLevels: previous.listLevels }, { at: itemKey });
    } else {
      tx.nodes.unset('listLevels', { at: itemKey });
    }
  }

  return true;
};
