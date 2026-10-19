import {
  ElementApi,
  PathApi,
  type Descendant,
  type Editor,
  type EditorCommit,
  type EditorCoreStateView,
  type EditorDocumentValue,
  type EditorSnapshot,
  type Element,
  type NamedRootKey,
  type NodeKey,
  type Path,
  type RootKey,
} from '../../../core';
import { getEditorCommitSnapshot } from '../../../facade';
import { failInvariant } from '../../../internal/failInvariant';
import { BaseHeadingPlugin } from '../../basic-nodes';
import type { ListStyle, ListType } from './BaseListPlugin';
import {
  changeLanes,
  countAll,
  createLanes,
  DEFAULT_LIST_ID,
  type EntryOrder,
  type ListEntry,
  type ListFacts,
  type ListLanes,
  numberingMetrics,
  sitsBetweenAnchors,
} from './listNumbering.internal';

export const LIST_FIELDS = [
  'checked',
  'listId',
  'listLevels',
  'listRestart',
  'listStart',
  'listStyle',
  'listType',
] as const;

export const LIST_TYPES = [
  'bulleted',
  'numbered',
  'task',
] as const satisfies readonly ListType[];

/** One level's numbering rules, as Word stores them per list. */
export type ListLevel = Readonly<{
  /** Word's level text, such as `%1.%2.`; stored for round trips, never drawn. */
  label?: string;
  /**
   * The deepest shallower level whose items restart this level: 0 never
   * restarts it, and a missing value restarts it after any shallower item.
   */
  restartAfter?: number;
  /** The number a run at this level opens with when its item sets none. */
  start?: number;
}>;

/** Level rules of one list, keyed by level, copied onto each of its items. */
export type ListLevels = Readonly<Record<string, ListLevel>>;

const isSafeInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value);

const isListLevel = (value: unknown): value is ListLevel => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  const { label, restartAfter, start, ...rest } = value as Record<
    string,
    unknown
  >;

  return (
    Object.keys(rest).length === 0 &&
    (label === undefined || typeof label === 'string') &&
    (restartAfter === undefined ||
      (isSafeInteger(restartAfter) && restartAfter >= 0)) &&
    (start === undefined || isSafeInteger(start))
  );
};

export const isListLevels = (value: unknown): value is ListLevels =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value) &&
  Object.entries(value).every(
    ([level, rule]) => /^[1-9]\d*$/.test(level) && isListLevel(rule)
  );

export const isListType = (value: unknown): value is ListType =>
  LIST_TYPES.some((type) => type === value);

export const isListItem = (node: Element) => isListType(node.listType);

export const listItemDepth = (node: Element) =>
  typeof node.indent === 'number' ? node.indent : 1;

export const normalizeListStyle = (
  type: ListType,
  style: ListStyle | (string & {}) | undefined
) =>
  (type === 'bulleted' && style === 'disc') ||
  (type === 'numbered' && style === 'decimal') ||
  type === 'task'
    ? undefined
    : style;

export const getElementListStyle = (element: Element): string | undefined => {
  const style =
    typeof element.listStyle === 'string' ? element.listStyle : undefined;

  return isListType(element.listType)
    ? normalizeListStyle(element.listType, style)
    : style;
};

export const getHeadingType = (editor: Editor) => {
  const heading = editor.plugin(BaseHeadingPlugin);

  return heading.installed ? heading.schema.type : undefined;
};

export const readListFacts = (element: Element): ListFacts | undefined => {
  if (!isListItem(element)) return undefined;

  return {
    id: typeof element.listId === 'string' ? element.listId : DEFAULT_LIST_ID,
    level: listItemDepth(element),
    levels: isListLevels(element.listLevels) ? element.listLevels : undefined,
    numbered: element.listType === 'numbered',
    restart: isSafeInteger(element.listRestart)
      ? element.listRestart
      : undefined,
    start: isSafeInteger(element.listStart) ? element.listStart : undefined,
  };
};

const sameFacts = (left: ListFacts, right: ListFacts) =>
  left.id === right.id &&
  left.level === right.level &&
  left.levels === right.levels &&
  left.numbered === right.numbered &&
  left.restart === right.restart &&
  left.start === right.start;

const nodeAt = (children: readonly Descendant[], path: Path) => {
  let node: Descendant | undefined;
  let nodes = children;

  for (const index of path) {
    node = nodes[index];
    if (!node) return undefined;
    nodes = ElementApi.isElement(node) ? node.children : [];
  }

  return node;
};

const visitElements = (
  children: readonly Descendant[],
  visit: (element: Element, path: Path) => void,
  parentPath: Path = []
) => {
  children.forEach((node, index) => {
    if (!ElementApi.isElement(node)) return;

    const path = [...parentPath, index];

    visit(node, path);
    visitElements(node.children, visit, path);
  });
};

type RootIndex = {
  byKey: Map<NodeKey, ListEntry<NodeKey>>;
  /** The children this index was built for; other children rebuild it or count on their own. */
  children: readonly Descendant[];
  /** Keys whose number changed, per revision, for the writers in each view. */
  changes: Array<{ keys: NodeKey[]; revision: number }>;
  lists: Map<string, ListLanes<NodeKey>>;
  revision: number;
};

const CHANGE_LOG_LIMIT = 64;

const compareDocumentOrder = (left: Path, right: Path) =>
  PathApi.compare(left, right) || left.length - right.length;

export const getListIndexMetrics = () => Object.freeze({ ...numberingMetrics });

const indexes = new WeakMap<Editor, Map<RootKey, RootIndex>>();

const buildRootIndex = (
  children: readonly Descendant[],
  keyAt: (path: Path) => NodeKey | null | undefined
): RootIndex => {
  const byKey = new Map<NodeKey, ListEntry<NodeKey>>();
  const entries = new Map<string, Array<ListEntry<NodeKey>>>();
  const lists = new Map<string, ListLanes<NodeKey>>();

  visitElements(children, (element, path) => {
    const facts = readListFacts(element);
    const key = facts && keyAt(path);

    if (!facts || !key) return;

    const entry = { facts, key, ordinal: undefined };
    const list = entries.get(facts.id);

    byKey.set(key, entry);
    if (list) list.push(entry);
    else entries.set(facts.id, [entry]);
  });

  for (const [id, list] of entries) {
    countAll(list);
    lists.set(id, createLanes(list));
  }

  return { byKey, changes: [], children, lists, revision: 0 };
};

// A rebuild moves the revision and logs every key, so each view rewrites its
// mounted numbers.
const rebuildRootIndex = (
  editor: Editor,
  root: RootKey,
  snapshot: EditorSnapshot
) => {
  let roots = indexes.get(editor);

  if (!roots) {
    roots = new Map();
    indexes.set(editor, roots);
  }

  const previous = roots.get(root);
  const index = buildRootIndex(snapshot.children, (path) =>
    snapshot.index.keyAt(path)
  );

  if (previous) {
    index.revision = previous.revision + 1;
    index.changes = [
      { keys: [...index.byKey.keys()], revision: index.revision },
    ];
  }
  roots.set(root, index);

  return index;
};

/**
 * Apply one commit to every root this editor has numbered. A key whose list
 * facts and path are unchanged costs nothing, so typing and marks do no work.
 */
export const applyListCommit = (editor: Editor, commit: EditorCommit) => {
  const roots = indexes.get(editor);

  if (!roots) return;

  for (const [root, index] of roots) {
    const named = root === 'main' ? undefined : root;
    const { changed } = commit;
    const before = getEditorCommitSnapshot(commit, root, 'before');
    const after = getEditorCommitSnapshot(commit, root, 'after');

    if (index.children === after.children) continue;
    if (
      !changed.has('structure', named) &&
      !changed.has('properties', named) &&
      !changed.has('replace', named)
    ) {
      if (index.children === before.children) index.children = after.children;
      continue;
    }
    if (changed.has('replace', named) || index.children !== before.children) {
      rebuildRootIndex(editor, root, after);
      continue;
    }

    try {
      updateRootIndex(index, commit, named, before, after);
    } catch (error) {
      rebuildRootIndex(editor, root, after);
      throw error;
    }
  }
};

const orderIn =
  (snapshot: EditorSnapshot): EntryOrder<NodeKey> =>
  (left, right) => {
    const leftPath = snapshot.index.pathOf(left.key);
    const rightPath = snapshot.index.pathOf(right.key);

    if (!(leftPath && rightPath)) {
      throw new Error('A list item is not in its root.');
    }

    return compareDocumentOrder(leftPath, rightPath);
  };

const SAME_PATH_REACH = 4;
const SHIFTED_REACH = 1;

const keptEntries = (
  held: ReadonlyArray<{ entry: ListEntry<NodeKey>; samePath: boolean }>,
  lists: ReadonlyMap<string, ListLanes<NodeKey>>,
  orderBefore: EntryOrder<NodeKey>,
  orderAfter: EntryOrder<NodeKey>,
  untouched: (entry: ListEntry<NodeKey>) => boolean,
  structural: boolean
) => {
  const kept = new Set<ListEntry<NodeKey>>();
  const anchored = (entry: ListEntry<NodeKey>) =>
    untouched(entry) || kept.has(entry);
  const sits = (
    entry: ListEntry<NodeKey>,
    isAnchor: (entry: ListEntry<NodeKey>) => boolean,
    reach: number
  ) =>
    sitsBetweenAnchors(
      lists.get(entry.facts.id) ??
        failInvariant('A held list entry has no lanes.'),
      entry,
      orderBefore,
      orderAfter,
      isAnchor,
      reach
    );

  for (const { entry, samePath } of held) {
    if (samePath && (!structural || sits(entry, untouched, SAME_PATH_REACH))) {
      kept.add(entry);
    }
  }
  for (const { entry, samePath } of held) {
    if (!samePath && sits(entry, anchored, SHIFTED_REACH)) kept.add(entry);
  }

  return kept;
};

const updateRootIndex = (
  index: RootIndex,
  commit: EditorCommit,
  named: NamedRootKey | undefined,
  before: EditorSnapshot,
  after: EditorSnapshot
) => {
  const candidates = new Set(commit.changed.nodeKeys('node', named));

  for (const key of commit.changed.nodeKeys('presence', named)) {
    candidates.add(key);
  }

  const orderBefore = orderIn(before);
  const orderAfter = orderIn(after);
  const structural = commit.changed.has('structure', named);
  const untouched = (entry: ListEntry<NodeKey>) =>
    !candidates.has(entry.key) && after.index.pathOf(entry.key) !== null;
  const changes = new Map<
    string,
    {
      placed: Array<ListEntry<NodeKey>>;
      removed: Map<ListEntry<NodeKey>, ListFacts>;
    }
  >();
  const changeOf = (id: string) => {
    let change = changes.get(id);

    if (!change) {
      change = { placed: [], removed: new Map() };
      changes.set(id, change);
    }

    return change;
  };
  const changedKeys: NodeKey[] = [];
  const onChange = (entry: ListEntry<NodeKey>) => {
    changedKeys.push(entry.key);
  };

  const read = [...candidates].map((key) => {
    const entry = index.byKey.get(key);
    const afterPath = after.index.pathOf(key);
    const afterNode = afterPath ? nodeAt(after.children, afterPath) : undefined;
    const facts = ElementApi.isElement(afterNode)
      ? readListFacts(afterNode)
      : undefined;
    const beforePath =
      entry && facts && sameFacts(entry.facts, facts)
        ? before.index.pathOf(key)
        : null;
    const held =
      entry && beforePath && afterPath
        ? { entry, samePath: PathApi.equals(beforePath, afterPath) }
        : undefined;

    return { entry, facts, held, key };
  });
  const kept = keptEntries(
    read.flatMap(({ held }) => (held ? [held] : [])),
    index.lists,
    orderBefore,
    orderAfter,
    untouched,
    structural
  );

  for (const { entry, facts, key } of read) {
    if (entry && kept.has(entry)) continue;
    if (entry) {
      changeOf(entry.facts.id).removed.set(entry, entry.facts);
      if (!facts) {
        index.byKey.delete(key);
        continue;
      }
      entry.facts = facts;
      changeOf(facts.id).placed.push(entry);
    } else if (facts) {
      const created = { facts, key, ordinal: undefined };

      index.byKey.set(key, created);
      changeOf(facts.id).placed.push(created);
    }
  }

  for (const [id, { placed, removed }] of changes) {
    const lanes = changeLanes(
      index.lists.get(id) ?? createLanes<NodeKey>([]),
      removed,
      placed,
      orderBefore,
      orderAfter,
      onChange
    );

    if (lanes.size === 0) index.lists.delete(id);
    else index.lists.set(id, lanes);
    for (const entry of placed) {
      if (!entry.facts.numbered && entry.ordinal !== undefined) {
        entry.ordinal = undefined;
        onChange(entry);
      }
    }
  }

  index.children = after.children;
  if (changedKeys.length > 0) {
    index.revision += 1;
    index.changes.push({ keys: changedKeys, revision: index.revision });
    if (index.changes.length > CHANGE_LOG_LIMIT) index.changes.shift();
  }
};

/**
 * Number of a numbered item in the state's root. A snapshot that matches the
 * live index reads it, and the first read builds that index; any other
 * snapshot, such as one inside a transaction, is counted on its own.
 */
export const readListOrdinal = (
  editor: Editor,
  state: Pick<EditorCoreStateView, 'key' | 'runtime' | 'view'>,
  element: Element,
  path: Path
): number | undefined => {
  if (element.listType !== 'numbered') return undefined;

  const snapshot = state.runtime.snapshot();
  const root = state.view.root() ?? 'main';
  const index = indexes.get(editor)?.get(root);

  if (index && index.children !== snapshot.children) {
    return countDetached(snapshot.children).get(element);
  }

  const key = state.key(path);

  return key
    ? (index ?? rebuildRootIndex(editor, root, snapshot)).byKey.get(key)
        ?.ordinal
    : undefined;
};

/**
 * Numbers changed since `revision` in one root, for a view that writes them
 * onto its mounted lists. `keys` is `undefined` when the log no longer reaches
 * back that far, so the view rewrites every mounted list.
 */
export const readListOrdinalChanges = (
  editor: Editor,
  root: RootKey,
  revision: number
):
  | Readonly<{ keys: readonly NodeKey[] | undefined; revision: number }>
  | undefined => {
  const index = indexes.get(editor)?.get(root);

  if (!index) return undefined;
  if (revision === index.revision) return { keys: [], revision };

  const first = index.changes[0];

  if (!first || first.revision > revision + 1) {
    return { keys: undefined, revision: index.revision };
  }

  const keys = new Set<NodeKey>();

  for (const change of index.changes) {
    if (change.revision > revision) {
      for (const key of change.keys) keys.add(key);
    }
  }

  return { keys: [...keys], revision: index.revision };
};

export const readListRevisions = (editor: Editor) =>
  new Map(
    [...(indexes.get(editor) ?? [])].map(([root, index]) => [
      root,
      index.revision,
    ])
  );

/** The current number of one key; without `root`, from the first root holding it. */
export const readListOrdinalByKey = (
  editor: Editor,
  root: RootKey | undefined,
  key: NodeKey
) => {
  const roots = indexes.get(editor);

  if (root !== undefined) return roots?.get(root)?.byKey.get(key)?.ordinal;
  for (const index of roots?.values() ?? []) {
    const item = index.byKey.get(key);

    if (item) return item.ordinal;
  }

  return undefined;
};

const detachedOrdinals = new WeakMap<
  readonly Descendant[],
  WeakMap<Element, number>
>();

// One count of a root's content keyed by element, cached for the content's
// lifetime: encoders and uncommitted states read it.
const countDetached = (children: readonly Descendant[]) => {
  const known = detachedOrdinals.get(children);

  if (known) return known;

  const values = new WeakMap<Element, number>();
  const lists = new Map<string, Array<ListEntry<Element>>>();

  detachedOrdinals.set(children, values);
  visitElements(children, (node) => {
    const facts = readListFacts(node);

    if (!facts) return;

    const entry = { facts, key: node, ordinal: undefined };
    const list = lists.get(facts.id);

    if (list) list.push(entry);
    else lists.set(facts.id, [entry]);
  });
  for (const list of lists.values()) {
    countAll(list);
    for (const entry of list) {
      if (entry.ordinal !== undefined) values.set(entry.key, entry.ordinal);
    }
  }

  return values;
};

const getDocumentRoot = (document: EditorDocumentValue, root: RootKey) =>
  root === 'main' ? document.children : (document.roots?.[root] ?? []);

/** Number of an element in a detached document, such as content being encoded. */
export const getDocumentListOrdinal = (
  document: EditorDocumentValue,
  root: RootKey,
  element: Element
): number | undefined =>
  element.listType === 'numbered'
    ? countDetached(getDocumentRoot(document, root)).get(element)
    : undefined;
