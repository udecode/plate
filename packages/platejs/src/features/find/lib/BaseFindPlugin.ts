import {
  defineBasePlugin,
  NodeApi,
  TextApi,
  type NodeKey,
  type Range,
} from '../../../core';

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

/** Current literal text search without document or history changes. */
export const BaseFindPlugin = defineBasePlugin('find', {
  initialState,
}).extend(({ editor, store }) => {
  let matchesByAnchorPath = new Map<string, readonly FindMatch[]>();
  const search = (query: string, force = false) => {
    const previous = store.get();
    if (!force && query === previous.query) return;

    let matches: readonly FindMatch[] = [];
    let searchError: Error | null = null;
    try {
      matches = query
        ? NodeApi.findTextRanges(editor, query, { caseSensitive: false }).map(
            (range) => ({
              id: `${range.anchor.path.join('.')}:${range.anchor.offset}-${range.focus.path.join('.')}:${range.focus.offset}`,
              range,
            })
          )
        : [];
    } catch (error) {
      searchError = error instanceof Error ? error : new Error(String(error));
    }
    const indexed = new Map<string, FindMatch[]>();
    for (const match of matches) {
      const key = match.range.anchor.path.join('.');
      const group = indexed.get(key) ?? [];
      group.push(match);
      indexed.set(key, group);
    }
    matchesByAnchorPath = indexed;
    store.set({
      query,
      matches,
      error: searchError,
      activeIndex:
        matches.length === 0
          ? -1
          : query === previous.query
            ? Math.max(0, previous.activeIndex) % matches.length
            : 0,
    });
  };

  return {
    api: () => ({
      /** Apply a case-insensitive literal query; an empty query clears results. */
      search: (query: string) => search(query),
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
      /** Select the current result; focus remains owned by the caller's view. */
      select: () => {
        const { matches, activeIndex } = store.get();
        const match = matches[activeIndex];
        if (!match) return false;
        tx.selection.set(match.range);
        return true;
      },
    }),
    decorate: {
      observe: ({ refresh }) =>
        store.subscribe((state, previous) => {
          if (
            state.matches === previous.matches &&
            state.activeIndex === previous.activeIndex
          ) {
            return;
          }
          const affected =
            state.matches !== previous.matches
              ? [...previous.matches, ...state.matches]
              : [
                  previous.matches[previous.activeIndex],
                  state.matches[state.activeIndex],
                ];
          const nodeKeys = new Set<NodeKey>();
          for (const match of affected) {
            const key = match && editor.key(match.range.anchor.path);
            if (key) nodeKeys.add(key);
          }
          if (nodeKeys.size > 0) refresh({ nodeKeys: [...nodeKeys] });
        }),
      read: ({ entry: [node, path] }) => {
        if (!TextApi.isText(node)) return [];
        const { matches, activeIndex } = store.get();
        const activeId = matches[activeIndex]?.id;
        return (matchesByAnchorPath.get(path.join('.')) ?? []).map((match) => ({
          attributes: {
            'data-find-active': match.id === activeId ? '' : undefined,
            'data-find-id': match.id,
            'data-find-match': '',
          },
          key: match.id,
          range: match.range,
        }));
      },
    },
    on: {
      commit: ({ commit }) => {
        const query = store.get('query');
        if (query && commit.changed.hasAny('document')) search(query, true);
      },
    },
  };
});
