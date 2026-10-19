import * as React from 'react';

import { AuthoredPlugin, type AuthoredView } from '../../../authored';
import type { Editor } from '../../editor';
import { redrawBlocks } from '../../internal/block-redraws';
import { useEditorViewState } from '../../plite-react';
import { useEditor } from '../../stores';

type SuggestionViewSnapshot = Readonly<{ activeId: string | null }>;

type SuggestionViewStore = Readonly<{
  getSnapshot: () => SuggestionViewSnapshot;
  setActiveId: (id: string | null) => void;
  subscribe: (listener: () => void) => () => void;
}>;

const stores = new WeakMap<Editor, SuggestionViewStore>();
const SuggestionViewContext = React.createContext<SuggestionViewStore | null>(
  null
);

const createSuggestionViewStore = (): SuggestionViewStore => {
  let snapshot: SuggestionViewSnapshot = Object.freeze({ activeId: null });
  const listeners = new Set<() => void>();

  return Object.freeze({
    getSnapshot: () => snapshot,
    setActiveId(activeId) {
      if (activeId === snapshot.activeId) return;
      snapshot = Object.freeze({ activeId });
      listeners.forEach((listener) => listener());
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  });
};

export const viewKey = (view: AuthoredView) =>
  'intent' in view ? view.intent : `preview:${view.preview}`;

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
  const [store] = React.useState(createSuggestionViewStore);
  const view = useEditorViewState(editor, () =>
    viewKey(editor.plugin(AuthoredPlugin).read.view())
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
  }, [view, store]);

  React.useEffect(() => {
    const authored = editor.plugin(AuthoredPlugin);

    return authored.api.subscribeChanges(({ blocks, removed }) => {
      const { activeId } = store.getSnapshot();

      if (activeId && removed.includes(activeId)) store.setActiveId(null);
      redrawBlocks(editor, blocks);
    });
  }, [editor, store]);

  return (
    <SuggestionViewContext value={store}>{children}</SuggestionViewContext>
  );
}
