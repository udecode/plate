import type {
  AnyEditor,
  EditorCommit,
  EditorCommitChangeKind,
  EditorCommitRuntimeChangeKind,
  EditorStateField,
  NodeKey,
} from '../interfaces/editor';
import { hasCommitNodeKeyAny } from './commit';
import { isDefinedStateField } from './plugin-registry';

/** View-state dependency declared by a public selector hook. */
export type EditorViewStateDependency =
  | 'authored'
  | 'composing'
  | 'focused'
  | 'readOnly'
  | 'view';

export type EditorViewStateBucket =
  | 'authored'
  | 'composing'
  | 'focused'
  | 'readOnly';

/** Dependency declared by a public selector hook to scope commit and view-state invalidation. */
export type EditorSelectorDependency =
  | EditorCommitChangeKind
  | EditorStateField<any>
  | EditorViewStateDependency
  | Readonly<{
      kind?: EditorCommitRuntimeChangeKind;
      nodeKey: NodeKey | null | undefined;
      nodeKeys?: never;
    }>
  | Readonly<{
      kind?: EditorCommitRuntimeChangeKind;
      nodeKey?: never;
      nodeKeys: readonly NodeKey[] | null | undefined;
    }>;

/** Single dependency or non-empty tuple of dependencies for a public selector hook. */
export type EditorSelectorDependencies =
  | EditorSelectorDependency
  | readonly [EditorSelectorDependency, ...EditorSelectorDependency[]];

type NormalizedNodeDependency = Readonly<{
  kind: EditorCommitRuntimeChangeKind | null;
  nodeKey: NodeKey;
}>;

export type NormalizedSelectorDependencies = Readonly<{
  all: boolean;
  allCommits: boolean;
  allViewKinds: boolean;
  changeKinds: readonly EditorCommitChangeKind[];
  nodeEntries: readonly NormalizedNodeDependency[];
  stateFieldKeys: readonly string[];
  viewKinds: readonly EditorViewStateBucket[];
}>;

const ALL_DEPENDENCIES: NormalizedSelectorDependencies = Object.freeze({
  all: true,
  allCommits: true,
  allViewKinds: true,
  changeKinds: Object.freeze([]),
  nodeEntries: Object.freeze([]),
  stateFieldKeys: Object.freeze([]),
  viewKinds: Object.freeze([]),
});

const VALID_COMMIT_CHANGE_KINDS = new Set<EditorCommitChangeKind>([
  'document',
  'marks',
  'properties',
  'replace',
  'root-order',
  'selection',
  'snapshot',
  'state',
  'structure',
  'text',
]);

const VALID_VIEW_STATE_KINDS = new Set<EditorViewStateDependency>([
  'authored',
  'composing',
  'focused',
  'readOnly',
  'view',
]);

const VALID_RUNTIME_CHANGE_KINDS = new Set<EditorCommitRuntimeChangeKind>([
  'decoration',
  'node',
  'path',
  'presence',
  'selection',
  'text',
]);

const DEFAULT_NODE_KINDS: readonly EditorCommitRuntimeChangeKind[] = [
  'node',
  'path',
  'presence',
];

const validateRuntimeKind = (
  kind: unknown
): EditorCommitRuntimeChangeKind | null => {
  if (kind === undefined) return null;
  if (
    typeof kind !== 'string' ||
    !VALID_RUNTIME_CHANGE_KINDS.has(kind as EditorCommitRuntimeChangeKind)
  ) {
    throw new TypeError(
      `Invalid selector dependency runtime kind "${typeof kind === 'string' ? kind : typeof kind}".`
    );
  }
  return kind as EditorCommitRuntimeChangeKind;
};

const validateNodeKey = (value: unknown): NodeKey => {
  if (typeof value !== 'string' || value.length === 0) {
    throw new TypeError(
      'Selector dependency nodeKey must be a non-empty NodeKey string, null, or undefined.'
    );
  }
  return value as NodeKey;
};

export const normalizeSelectorDependencies = (
  dependsOn: EditorSelectorDependencies | undefined
): NormalizedSelectorDependencies => {
  if (dependsOn === undefined) return ALL_DEPENDENCIES;

  const entries = Array.isArray(dependsOn) ? dependsOn : [dependsOn];

  if (entries.length === 0) {
    throw new TypeError('Selector dependsOn cannot be an empty array.');
  }

  let allCommits = false;
  let allViewKinds = false;
  const changeKinds = new Set<EditorCommitChangeKind>();
  const stateFieldKeys = new Set<string>();
  const nodeEntryMap = new Map<string, NormalizedNodeDependency>();
  const viewKinds = new Set<EditorViewStateBucket>();

  for (const entry of entries) {
    if (typeof entry === 'string') {
      if (VALID_COMMIT_CHANGE_KINDS.has(entry as EditorCommitChangeKind)) {
        changeKinds.add(entry as EditorCommitChangeKind);
        continue;
      }
      if (VALID_VIEW_STATE_KINDS.has(entry as EditorViewStateDependency)) {
        if (entry === 'view') {
          allViewKinds = true;
        } else {
          viewKinds.add(entry as EditorViewStateBucket);
        }
        continue;
      }
      throw new TypeError(
        `Invalid selector dependency change kind "${entry}".`
      );
    }

    if (isDefinedStateField(entry)) {
      stateFieldKeys.add(entry.key);
      continue;
    }

    if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
      throw new TypeError(
        'Selector dependsOn entries must be a commit or view-state kind, a defineStateField descriptor, or a { nodeKey } / { nodeKeys } object.'
      );
    }

    const record = entry as Record<string, unknown>;
    const hasOwnNodeKey = Object.hasOwn(record, 'nodeKey');
    const hasOwnNodeKeys = Object.hasOwn(record, 'nodeKeys');

    if (!hasOwnNodeKey && !hasOwnNodeKeys) {
      throw new TypeError(
        'Selector dependsOn object entry must specify exactly one of "nodeKey" or "nodeKeys".'
      );
    }
    if (
      hasOwnNodeKey &&
      hasOwnNodeKeys &&
      record.nodeKey !== undefined &&
      record.nodeKeys !== undefined
    ) {
      throw new TypeError(
        'Selector dependsOn object entry must specify exactly one of "nodeKey" or "nodeKeys".'
      );
    }

    for (const key of Object.keys(record)) {
      if (key !== 'kind' && key !== 'nodeKey' && key !== 'nodeKeys') {
        throw new TypeError(
          `Unknown selector dependency option "${key}". Expected only "nodeKey" or "nodeKeys" with optional "kind".`
        );
      }
    }

    const kind = validateRuntimeKind(
      Object.hasOwn(record, 'kind') ? record.kind : undefined
    );

    if (hasOwnNodeKey && (!hasOwnNodeKeys || record.nodeKeys === undefined)) {
      const { nodeKey } = record;
      if (nodeKey == null) {
        allCommits = true;
      } else {
        const validKey = validateNodeKey(nodeKey);
        const dedupeKey = `${validKey}\u0000${kind ?? ''}`;
        if (!nodeEntryMap.has(dedupeKey)) {
          nodeEntryMap.set(
            dedupeKey,
            Object.freeze({ kind, nodeKey: validKey })
          );
        }
      }
      continue;
    }

    const { nodeKeys } = record;
    if (nodeKeys == null) {
      allCommits = true;
      continue;
    }
    if (!Array.isArray(nodeKeys)) {
      throw new TypeError(
        'Selector dependency nodeKeys must be an array of NodeKey strings, null, or undefined.'
      );
    }
    if (nodeKeys.length === 0) {
      allCommits = true;
      continue;
    }
    for (const item of nodeKeys) {
      const validKey = validateNodeKey(item);
      const dedupeKey = `${validKey}\u0000${kind ?? ''}`;
      if (!nodeEntryMap.has(dedupeKey)) {
        nodeEntryMap.set(dedupeKey, Object.freeze({ kind, nodeKey: validKey }));
      }
    }
  }

  if (allCommits && allViewKinds) return ALL_DEPENDENCIES;

  const sortedChangeKinds = allCommits
    ? Object.freeze([])
    : Object.freeze([...changeKinds].sort());
  const sortedStateFieldKeys = allCommits
    ? Object.freeze([])
    : Object.freeze([...stateFieldKeys].sort());
  const sortedNodeEntries = allCommits
    ? Object.freeze([])
    : Object.freeze(
        [...nodeEntryMap.entries()]
          .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
          .map(([, value]) => value)
      );
  const sortedViewKinds = allViewKinds
    ? Object.freeze([])
    : Object.freeze([...viewKinds].sort());

  return Object.freeze({
    all: false,
    allCommits,
    allViewKinds,
    changeKinds: sortedChangeKinds,
    nodeEntries: sortedNodeEntries,
    stateFieldKeys: sortedStateFieldKeys,
    viewKinds: sortedViewKinds,
  });
};

export const sameSelectorDependencies = (
  left: NormalizedSelectorDependencies,
  right: NormalizedSelectorDependencies
): boolean => {
  if (left === right) return true;
  if (
    left.all !== right.all ||
    left.allCommits !== right.allCommits ||
    left.allViewKinds !== right.allViewKinds
  ) {
    return false;
  }
  if (left.all) return true;
  if (
    left.changeKinds.length !== right.changeKinds.length ||
    left.stateFieldKeys.length !== right.stateFieldKeys.length ||
    left.nodeEntries.length !== right.nodeEntries.length ||
    left.viewKinds.length !== right.viewKinds.length
  ) {
    return false;
  }
  for (let index = 0; index < left.changeKinds.length; index += 1) {
    if (left.changeKinds[index] !== right.changeKinds[index]) return false;
  }
  for (let index = 0; index < left.stateFieldKeys.length; index += 1) {
    if (left.stateFieldKeys[index] !== right.stateFieldKeys[index]) {
      return false;
    }
  }
  for (let index = 0; index < left.nodeEntries.length; index += 1) {
    const a = left.nodeEntries[index];
    const b = right.nodeEntries[index];
    if (a.nodeKey !== b.nodeKey || a.kind !== b.kind) return false;
  }
  for (let index = 0; index < left.viewKinds.length; index += 1) {
    if (left.viewKinds[index] !== right.viewKinds[index]) return false;
  }
  return true;
};

export const selectorDependenciesWantCommits = (
  deps: NormalizedSelectorDependencies
): boolean =>
  deps.allCommits ||
  deps.changeKinds.length > 0 ||
  deps.stateFieldKeys.length > 0 ||
  deps.nodeEntries.length > 0;

export const selectorDependenciesWantViewKind = (
  deps: NormalizedSelectorDependencies,
  kind: EditorViewStateBucket
): boolean => deps.allViewKinds || deps.viewKinds.includes(kind);

export const selectorDependenciesWantShownPreview = (
  deps: NormalizedSelectorDependencies
): boolean =>
  deps.allCommits ||
  deps.nodeEntries.length > 0 ||
  deps.changeKinds.some((kind) => kind !== 'state');

export const selectorDependenciesViewSubscription = (
  deps: NormalizedSelectorDependencies
): 'any' | readonly EditorViewStateBucket[] | null => {
  if (deps.allViewKinds) return 'any';

  const wantsPreview = selectorDependenciesWantShownPreview(deps);

  if (!wantsPreview) {
    return deps.viewKinds.length > 0 ? deps.viewKinds : null;
  }
  if (deps.viewKinds.includes('authored')) {
    return deps.viewKinds;
  }

  return [...deps.viewKinds, 'authored'];
};

export const selectorDependenciesSubscriptionKey = (
  deps: NormalizedSelectorDependencies
): string => {
  const commits = selectorDependenciesWantCommits(deps) ? '1' : '0';
  const view = selectorDependenciesViewSubscription(deps);
  const viewPart =
    view === null ? '' : view === 'any' ? '*' : [...view].sort().join(',');

  return `${commits}|${viewPart}`;
};

const hasNodeKeyInScope = (
  commit: EditorCommit<any>,
  root: ReturnType<AnyEditor['read']['view']['root']>,
  nodeKey: NodeKey,
  kind: EditorCommitRuntimeChangeKind
): boolean =>
  root !== undefined
    ? commit.changed.hasNodeKey(nodeKey, kind, root)
    : hasCommitNodeKeyAny(commit, nodeKey, kind);

const matchesNodeKeyKind = (
  commit: EditorCommit<any>,
  root: ReturnType<AnyEditor['read']['view']['root']>,
  nodeKey: NodeKey,
  kind: EditorCommitRuntimeChangeKind
): boolean => {
  if (
    kind === 'selection' &&
    !commit.selectionChanged &&
    (!commit.changed.hasAny('structure') ||
      (!hasNodeKeyInScope(commit, root, nodeKey, 'path') &&
        !hasNodeKeyInScope(commit, root, nodeKey, 'presence')))
  ) {
    return false;
  }

  return hasNodeKeyInScope(commit, root, nodeKey, kind);
};

export const commitMatchesSelectorDependencies = (
  editor: AnyEditor,
  commit: EditorCommit<any> | undefined,
  deps: NormalizedSelectorDependencies
): boolean => {
  if (!commit) return selectorDependenciesWantCommits(deps);
  if (deps.allCommits) return true;

  for (const kind of deps.changeKinds) {
    if (kind === 'selection') {
      if (commit.selectionChanged || commit.changed.hasAny('selection')) {
        return true;
      }
    } else if (commit.changed.hasAny(kind)) {
      return true;
    }
  }

  if (deps.stateFieldKeys.length > 0) {
    if (commit.dirtyStateKeys.includes('$configuration')) {
      return true;
    }
    for (const fieldKey of deps.stateFieldKeys) {
      if (commit.dirtyStateKeys.includes(fieldKey)) {
        return true;
      }
    }
  }

  if (deps.nodeEntries.length > 0) {
    const root = editor.read.view.root();
    for (const { kind, nodeKey } of deps.nodeEntries) {
      if (kind !== null) {
        if (matchesNodeKeyKind(commit, root, nodeKey, kind)) {
          return true;
        }
      } else {
        for (const defaultKind of DEFAULT_NODE_KINDS) {
          if (matchesNodeKeyKind(commit, root, nodeKey, defaultKind)) {
            return true;
          }
        }
      }
    }
  }

  return false;
};
