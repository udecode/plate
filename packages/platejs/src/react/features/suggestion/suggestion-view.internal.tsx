import * as React from 'react';

import { DefaultAuthoredPlugin } from '../../../authored';
import { TextApi, type NodeKey } from '../../../core';
import type { Editor } from '../../editor';
import { useEditorViewState } from '../../plite-react';
import { useEditor } from '../../stores';

type SuggestionViewSnapshot = Readonly<{ activeId: string | null }>;

type SuggestionViewStore = Readonly<{
  getSnapshot: () => SuggestionViewSnapshot;
  setActiveId: (id: string | null) => void;
  subscribe: (listener: () => void) => () => void;
  subscribeRefresh: (
    listener: (nodeKeys: readonly NodeKey[]) => void
  ) => () => void;
}>;

const stores = new WeakMap<Editor, SuggestionViewStore>();
const SuggestionViewContext = React.createContext<SuggestionViewStore | null>(
  null
);

const changeNodeKeys = (editor: Editor, id: string | null) => {
  const nodeKeys = new Set<NodeKey>();
  const change = id
    ? editor.plugin(DefaultAuthoredPlugin).read.change(id)
    : null;

  for (const range of change?.ranges ?? []) {
    for (const [, path] of editor.read.nodes.entries({
      at: range,
      match: TextApi.isText,
    })) {
      const nodeKey = editor.key(path);
      if (nodeKey) nodeKeys.add(nodeKey);
    }
  }

  return nodeKeys;
};

const createSuggestionViewStore = (editor: Editor): SuggestionViewStore => {
  let snapshot: SuggestionViewSnapshot = Object.freeze({ activeId: null });
  const listeners = new Set<() => void>();
  const refreshers = new Set<(nodeKeys: readonly NodeKey[]) => void>();
  const pendingNodeKeys = new Set<NodeKey>();
  let publishQueued = false;
  const publish = () => {
    if (publishQueued) return;
    publishQueued = true;
    queueMicrotask(() => {
      publishQueued = false;
      const affected = Object.freeze([...pendingNodeKeys]);

      pendingNodeKeys.clear();
      listeners.forEach((listener) => listener());
      if (affected.length > 0) {
        refreshers.forEach((listener) => listener(affected));
      }
    });
  };
  const setActiveId = (activeId: string | null) => {
    if (activeId === snapshot.activeId) return;
    const nodeKeys = changeNodeKeys(editor, snapshot.activeId);
    for (const nodeKey of changeNodeKeys(editor, activeId)) {
      nodeKeys.add(nodeKey);
    }
    snapshot = Object.freeze({ activeId });
    nodeKeys.forEach((nodeKey) => pendingNodeKeys.add(nodeKey));
    publish();
  };

  return Object.freeze({
    getSnapshot: () => snapshot,
    setActiveId,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    subscribeRefresh(listener) {
      refreshers.add(listener);
      return () => refreshers.delete(listener);
    },
  });
};

export const getSuggestionViewStore = (editor: Editor) =>
  stores.get(editor) ?? null;

export const useSuggestionViewStore = () => {
  const store = React.useContext(SuggestionViewContext);
  if (!store) {
    throw new Error('Suggestion hooks require a mounted SuggestionPlugin.');
  }
  return store;
};

export function SuggestionViewProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const editor = useEditor();
  const [store] = React.useState(() => createSuggestionViewStore(editor));
  const authoredView = useEditorViewState(
    editor,
    () => editor.plugin(DefaultAuthoredPlugin).read.view(),
    {
      equalityFn: (left, right) =>
        left?.intent === right.intent && left.projection === right.projection,
    }
  );

  React.useInsertionEffect(() => {
    stores.set(editor, store);
    return () => {
      if (stores.get(editor) === store) stores.delete(editor);
    };
  }, [editor, store]);

  React.useEffect(() => {
    store.setActiveId(null);
    return () => store.setActiveId(null);
  }, [authoredView.intent, authoredView.projection, store]);

  return (
    <SuggestionViewContext value={store}>{children}</SuggestionViewContext>
  );
}
