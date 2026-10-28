import {
  definePlugin,
  NodeApi,
  PathApi,
  PointApi,
  RangeApi,
  TextApi,
  type Anchor,
  type Decoration,
  type DecorationRefresh,
  type Descendant,
  type EditorSchemaIdentity,
  type NodeKey,
  type Path,
  type Range,
  txSelection,
} from '../../../core';
import {
  getTextSearchScope,
  MAIN_ROOT_KEY,
  withEditorUpdateRootScope,
  withTransactionSpecDraftRead,
} from '../../../facade';
import { snapshotPluginState } from '../../../internal/plugin/pluginStore';

export type FindMatch = Readonly<{ id: string; range: Range }>;

export type FindPluginState = Readonly<{
  query: string;
  matches: readonly FindMatch[];
  activeIndex: number;
  error: Error | null;
}>;

const initialState: FindPluginState = {
  query: '',
  matches: [],
  activeIndex: -1,
  error: null,
};

const firstNotBefore = (
  matches: readonly FindMatch[],
  isBefore: (match: FindMatch) => boolean
) => {
  let low = 0;
  let high = matches.length;
  while (low < high) {
    const middle = (low + high) >>> 1;
    if (isBefore(matches[middle])) low = middle + 1;
    else high = middle;
  }
  return low;
};

const sameOffsets = (a: Range, b: Range) =>
  a.anchor.offset === b.anchor.offset &&
  a.focus.offset === b.focus.offset &&
  PathApi.equals(a.anchor.path, a.focus.path) &&
  PathApi.equals(b.anchor.path, b.focus.path);

// The plugin store keeps a frozen copy of each new match, so Find finds a
// match it published by its id and range, never by identity.
const sameMatch = (a: FindMatch | undefined, b: FindMatch | undefined) =>
  a === b ||
  (a !== undefined &&
    b !== undefined &&
    a.id === b.id &&
    RangeApi.equals(a.range, b.range));

type FindSearch = Readonly<{
  children: readonly Descendant[];
  // A failed search published no matches for its tree, so no splice may
  // start from it.
  failed: boolean;
  matches: readonly FindMatch[];
  query: string;
  schema: EditorSchemaIdentity;
}>;

type FoundRanges = Readonly<{
  keys: ReadonlyArray<NodeKey | null>;
  ranges: readonly Range[];
}>;

const matchId = (key: NodeKey | null, order: number) => `${key ?? ''}:${order}`;
const keyOf = (match: FindMatch | undefined) => {
  if (!match) return null;
  const end = match.id.lastIndexOf(':');
  return end > 0 ? (match.id.slice(0, end) as NodeKey) : null;
};
const addKey = (nodeKeys: Set<NodeKey>, match: FindMatch | undefined) => {
  const key = keyOf(match);
  if (key) nodeKeys.add(key);
};

const toMatches = (
  found: FoundRanges,
  previous: readonly FindMatch[],
  changedKeys: Set<NodeKey>
) => {
  const unmatched = new Map(previous.map((match) => [match.id, match]));
  const orders = new Map<NodeKey | null, number>();
  let reused = found.ranges.length === previous.length;
  const matches = found.ranges.map((range, index): FindMatch => {
    const key = found.keys[index];
    const order = orders.get(key) ?? 0;
    orders.set(key, order + 1);
    const id = matchId(key, order);
    const old = unmatched.get(id);
    unmatched.delete(id);
    if (old && RangeApi.equals(old.range, range)) {
      if (old !== previous[index]) reused = false;
      return old;
    }
    reused = false;
    if (key && (!old || !sameOffsets(old.range, range))) changedKeys.add(key);
    return { id, range };
  });
  for (const match of unmatched.values()) addKey(changedKeys, match);
  return reused ? previous : matches;
};

/** Current literal text search without document or history changes. */
export const BaseFindPlugin = definePlugin('find', {
  initialState,
}).extend(({ editor, store }) => {
  const refreshers = new Set<(input: DecorationRefresh) => void>();
  // Matches are paths into the exact tree the last search read, so another
  // document a view renders must not show them.
  let search: FindSearch | null = null;
  let anchored: Readonly<{ anchor: Anchor<Range>; match: FindMatch }> | null =
    null;
  let held: Set<NodeKey> | 'all' = new Set();
  let showsForeignList = false;
  const sortedForeignLists = new WeakMap<
    readonly FindMatch[],
    readonly FindMatch[]
  >();
  const inDocumentOrder = (matches: readonly FindMatch[]) => {
    if (matches === search?.matches) return matches;
    let sorted = sortedForeignLists.get(matches);
    if (!sorted) {
      sorted = [...matches].sort((a, b) =>
        PathApi.compare(a.range.anchor.path, b.range.anchor.path)
      );
      sortedForeignLists.set(matches, sorted);
    }
    return sorted;
  };

  const send = (nodeKeys: DecorationRefresh['nodeKeys']) => {
    const input = { nodeKeys };
    for (const refresher of refreshers) refresher(input);
  };
  const refresh = (nodeKeys: ReadonlySet<NodeKey> | 'all') => {
    // Views paint the committed tree, so keys found in a transaction's edited
    // draft wait for the next commit.
    if (search?.children !== editor.read.children()) {
      if (nodeKeys === 'all') held = 'all';
      else if (held !== 'all') for (const key of nodeKeys) held.add(key);
    } else if (nodeKeys === 'all') {
      send('all');
    } else if (nodeKeys.size > 0) {
      send([...nodeKeys]);
    }
  };
  const inMain = <T>(fn: () => T) =>
    withEditorUpdateRootScope(editor, MAIN_ROOT_KEY, fn);
  const anchorTo = (match: FindMatch | undefined) => {
    anchored?.anchor.release();
    anchored = match
      ? {
          anchor: inMain(() =>
            editor.anchor(match.range, {
              association: 'inward',
              deletion: 'nearest',
            })
          ),
          match,
        }
      : null;
  };

  const readMainChildren = () =>
    inMain(() =>
      withTransactionSpecDraftRead(editor, () => editor.read.children())
    );
  const findIn = (
    children: readonly Descendant[],
    query: string,
    at?: Path
  ): FoundRanges =>
    inMain(() =>
      withTransactionSpecDraftRead(editor, () => {
        const ranges = NodeApi.findTextRanges(
          {
            children: () => children,
            nodes: editor.read.nodes,
            schema: editor.read.schema,
          },
          query,
          { at, caseSensitive: false }
        );

        return {
          keys: ranges.map((range) => editor.key(range.anchor.path)),
          ranges,
        };
      })
    );

  const settle = (
    next: FindSearch,
    {
      changedKeys,
      error,
      followActive,
    }: Readonly<{
      changedKeys: Set<NodeKey>;
      error: Error | null;
      followActive: boolean;
    }>
  ) => {
    const previous = store.get();
    const { matches } = next;
    const unchanged = matches === previous.matches;
    const stored = previous.matches[previous.activeIndex];
    const range =
      matches.length > 0 &&
      followActive &&
      anchored &&
      sameMatch(stored, anchored.match)
        ? anchored.anchor.resolve()
        : null;
    let activeIndex = -1;
    if (range) {
      const start = RangeApi.start(range);
      // Matches never overlap, so the first match that ends after the
      // anchor's start is the anchored match whenever the search still
      // returns it.
      activeIndex =
        firstNotBefore(
          matches,
          (match) => !PointApi.isAfter(RangeApi.end(match.range), start)
        ) % matches.length;
    } else if (matches.length > 0) {
      activeIndex = followActive
        ? Math.max(0, previous.activeIndex) % matches.length
        : 0;
    }
    const active = matches[activeIndex];
    const published = unchanged ? matches : snapshotPluginState(matches, true);

    search = { ...next, matches: published };
    if (
      !sameMatch(active, anchored?.match) ||
      (range && !RangeApi.equals(range, active.range))
    ) {
      anchorTo(active);
    }
    if (
      followActive &&
      unchanged &&
      error === previous.error &&
      activeIndex === previous.activeIndex
    ) {
      return;
    }
    if (active?.id !== stored?.id) {
      addKey(changedKeys, stored);
      addKey(changedKeys, active);
    }
    store.set(
      followActive
        ? { matches: published, error, activeIndex }
        : { query: next.query, matches: published, error, activeIndex }
    );
    refresh(changedKeys);
  };

  const publish = (query: string, followActive: boolean) => {
    const previous = store.get();
    const children = readMainChildren();
    let found: FoundRanges = { keys: [], ranges: [] };
    let searchError: Error | null = null;
    try {
      if (query) found = findIn(children, query);
    } catch (error) {
      searchError = error instanceof Error ? error : new Error(String(error));
    }

    const changedKeys = new Set<NodeKey>();

    settle(
      {
        children,
        failed: searchError !== null,
        matches: toMatches(found, previous.matches, changedKeys),
        query,
        schema: editor.read.schema.identity(),
      },
      { changedKeys, error: searchError, followActive }
    );
  };

  const publishScope = (
    last: FindSearch,
    scope: Path,
    children: readonly Descendant[]
  ) => {
    let found: FoundRanges;
    try {
      found = findIn(children, last.query, scope);
    } catch {
      return false;
    }
    const start = firstNotBefore(last.matches, (match) =>
      PathApi.isBefore(match.range.anchor.path, scope)
    );
    const end = firstNotBefore(
      last.matches,
      (match) => !PathApi.isAfter(match.range.anchor.path, scope)
    );
    const before = last.matches.slice(start, end);
    const keyless =
      found.keys.includes(null) || before.some((match) => !keyOf(match));
    if (keyless) return false;

    const changedKeys = new Set<NodeKey>();
    const scoped = toMatches(found, before, changedKeys);
    const matches =
      scoped === before
        ? last.matches
        : [
            ...last.matches.slice(0, start),
            ...scoped,
            ...last.matches.slice(end),
          ];

    settle(
      { ...last, children, matches },
      { changedKeys, error: null, followActive: true }
    );
    return true;
  };

  const onStoreWrite = (state: FindPluginState, previous: FindPluginState) => {
    const showedForeignList = showsForeignList;
    showsForeignList = search !== null && state.matches !== search.matches;
    const foreign = showedForeignList || showsForeignList;
    if (
      foreign &&
      (state.matches !== previous.matches ||
        state.activeIndex !== previous.activeIndex)
    ) {
      refresh('all');
    }
    const match = state.matches[state.activeIndex];
    if (sameMatch(match, anchored?.match)) return;
    anchorTo(readMainChildren() === search?.children ? match : undefined);
    if (foreign) return;
    const nodeKeys = new Set<NodeKey>();
    addKey(nodeKeys, previous.matches[previous.activeIndex]);
    addKey(nodeKeys, match);
    refresh(nodeKeys);
  };

  return {
    activate: ({ onCleanup }) => {
      const stop = store.subscribe(onStoreWrite);
      onCleanup(() => {
        stop();
        anchorTo(undefined);
      });
    },
    api: () => ({
      /** Apply a case-insensitive literal query; an empty query clears results. */
      search: (query: string) => {
        if (query !== (search?.query ?? '') || query !== store.get('query')) {
          publish(query, false);
        }
      },
      /** Move through current matches, wrapping at either end. */
      move: (delta: -1 | 1) => {
        const { matches, activeIndex } = store.get();
        if (matches.length === 0) return;
        store.set({
          activeIndex: (activeIndex + delta + matches.length) % matches.length,
        });
      },
    }),
    selectors: {
      activeMatch: (state) => state.matches[state.activeIndex] ?? null,
      count: (state) => state.matches.length,
    },
    update: ({ tx }) => ({
      /**
       * Select the current result in the main document; returns false without
       * one or in a named root's view. Focus remains owned by the caller's
       * view.
       */
      select: txSelection(() => {
        if (tx.view.root() !== undefined) return false;
        const { matches, activeIndex } = store.get();
        const match = matches[activeIndex];
        if (!match) return false;
        tx.selection.set(match.range);
        return true;
      }),
    }),
    decorate: {
      observe: ({ refresh: refresher }) => {
        refreshers.add(refresher);
        return () => {
          refreshers.delete(refresher);
        };
      },
      read: ({ editor: view, entry: [node, path] }) => {
        if (
          !TextApi.isText(node) ||
          view.read.children() !== search?.children
        ) {
          return [];
        }
        const { matches: stored, activeIndex } = store.get();
        const active = stored[activeIndex];
        const matches = inDocumentOrder(stored);
        const decorations: Decoration[] = [];
        for (
          let index = firstNotBefore(matches, (match) =>
            PathApi.isBefore(match.range.anchor.path, path)
          );
          index < matches.length &&
          PathApi.equals(matches[index].range.anchor.path, path);
          index += 1
        ) {
          const match = matches[index];
          decorations.push({
            attributes: {
              'data-find-active': match === active ? '' : undefined,
              'data-find-id': match.id,
              'data-find-match': '',
            },
            key: match.id,
            range: match.range,
          });
        }
        return decorations;
      },
    },
    on: {
      commit: () => {
        // A schema change, a search in a rolled-back update or an app write
        // can each leave the results stale on a commit that changes no text.
        if (search?.query) {
          const children = readMainChildren();
          const owned = store.get().matches === search.matches;
          const current =
            owned && search.schema === editor.read.schema.identity();
          if (!current || children !== search.children) {
            const scope =
              current && !search.failed
                ? getTextSearchScope(
                    editor.read.schema,
                    search.children,
                    children
                  )
                : null;
            if (!scope || !publishScope(search, scope, children)) {
              publish(search.query, true);
            }
          }
        }
        if (held === 'all' || held.size > 0) {
          const nodeKeys = held === 'all' ? held : [...held];
          held = new Set();
          send(nodeKeys);
        }
      },
    },
  };
});
