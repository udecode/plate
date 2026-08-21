import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  defineExtension,
  DocumentChange,
  type Element,
  type Editor,
  type EditorUpdatePolicy,
  type EditorUpdateTransaction,
} from '@platejs/plite';
import {
  getLastCommit as editorGetLastCommit,
  replace as editorReplace,
  string as editorString,
} from '@platejs/plite/internal';

const paragraph = (text: string): Element => ({
  type: 'paragraph',
  children: [{ text }],
});

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const remoteCollabTags = [
  'collaboration',
  'remote-import',
  'history-skip',
  'skip-dom-selection',
  'skip-selection-focus',
  'skip-scroll-into-view',
] as const;

const remoteCollabPolicy = {
  tags: remoteCollabTags,
} satisfies EditorUpdatePolicy;

const createSeededEditor = () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [paragraph('one')],
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    },
  });

  return editor;
};

type FakeAdapterState = {
  connected: boolean;
  exports: readonly ReturnType<DocumentChange['toJSON']>[];
  originClientId: string;
  paused: boolean;
  remoteImports: number;
};

type FakeAdapterRuntimeState = {
  get: () => FakeAdapterState;
  set: (
    value: FakeAdapterState | ((previous: FakeAdapterState) => FakeAdapterState)
  ) => void;
};

const createFakeCollabAdapterExtension = () => {
  let controller: {
    connect: () => void;
    exports: () => readonly ReturnType<DocumentChange['toJSON']>[];
    importRemote: (change: ReturnType<DocumentChange['toJSON']>) => void;
    listenerEvents: () => readonly string[];
    pause: () => void;
    remoteImports: () => number;
    resume: () => void;
    state: () => FakeAdapterState;
  } | null = null;
  const listenerEvents: string[] = [];
  const runtimeStates = new WeakMap<Editor, FakeAdapterRuntimeState>();

  const extension = defineExtension('fake-collab-adapter', {
    activate(context) {
      const { editor } = context;
      let currentState: FakeAdapterState = {
        connected: true,
        exports: [],
        originClientId: 'local-client',
        paused: false,
        remoteImports: 0,
      };
      const adapterState: FakeAdapterRuntimeState = {
        get: () => currentState,
        set: (value) => {
          currentState =
            typeof value === 'function' ? value(currentState) : value;
        },
      };
      const setAdapterState = (
        patch:
          | Partial<FakeAdapterState>
          | ((state: FakeAdapterState) => FakeAdapterState)
      ) => {
        adapterState.set((state) =>
          typeof patch === 'function' ? patch(state) : { ...state, ...patch }
        );
      };
      runtimeStates.set(editor, adapterState);

      controller = {
        connect() {
          setAdapterState({ connected: true, paused: false });
        },
        exports() {
          return adapterState.get().exports;
        },
        importRemote(change) {
          editor.update(remoteCollabPolicy, (tx: EditorUpdateTransaction) => {
            tx.changes.apply(DocumentChange.fromJSON(clone(change)));
          });
          setAdapterState((state) => ({
            ...state,
            remoteImports: state.remoteImports + 1,
          }));
        },
        listenerEvents() {
          return listenerEvents;
        },
        pause() {
          setAdapterState({ paused: true });
        },
        remoteImports() {
          return adapterState.get().remoteImports;
        },
        resume() {
          setAdapterState({ paused: false });
        },
        state() {
          return adapterState.get();
        },
      };

      context.onCleanup(() => {
        setAdapterState({ connected: false, paused: true });
        if (runtimeStates.get(editor) === adapterState) {
          runtimeStates.delete(editor);
        }
      });
    },
    on: {
      commit({ commit, editor }) {
        listenerEvents.push(`commit:${commit.tags.join(',')}`);

        const adapterState = runtimeStates.get(editor);
        assert.ok(adapterState);
        const state = adapterState.get();

        if (!state.connected || state.paused) return;
        if (commit.tags.includes('skip-collab')) return;
        if (commit.tags.includes('collaboration')) return;
        if (commit.changes.empty) return;
        adapterState.set({
          ...state,
          exports: [...state.exports, clone(commit.changes.toJSON())],
        });
      },
    },
  });

  return {
    controller() {
      assert.ok(controller);

      return controller;
    },
    extension,
  };
};

const insertTextAtEnd = (
  editor: ReturnType<typeof createSeededEditor>,
  text: string,
  policy?: Pick<EditorUpdatePolicy, 'tags'>
) => {
  const insert = (tx: EditorUpdateTransaction) => {
    tx.text.insert(text, {
      at: { path: [0, 0], offset: editorString(editor, [0]).length },
    });
  };

  policy ? editor.update(policy, insert) : editor.update(insert);
};

describe('collab adapter extension contract', () => {
  it('exports local commits and suppresses remote, skipped, paused, and cleaned-up loops without editor monkey-patches', () => {
    const editor = createSeededEditor();
    const fakeAdapter = createFakeCollabAdapterExtension();
    const unextend = editor.install(fakeAdapter.extension);
    const adapter = fakeAdapter.controller();

    assert.equal('apply' in editor, false);
    assert.equal('onChange' in editor, false);
    assert.equal('connectYjs' in editor, false);
    assert.equal(adapter.state().originClientId, 'local-client');

    insertTextAtEnd(editor, '!');

    assert.equal(adapter.exports().length, 1);
    assert.equal(DocumentChange.fromJSON(adapter.exports()[0]!).empty, false);

    const remoteSpec = editor.read((state) =>
      state.transaction((tx) => {
        tx.text.insert('?', {
          at: { path: [0, 0], offset: editorString(editor, [0]).length },
        });
      })
    );

    assert.ok(remoteSpec);
    adapter.importRemote(remoteSpec.changes.toJSON());

    assert.equal(editorString(editor, []), 'one!?');
    assert.equal(adapter.exports().length, 1);
    assert.equal(adapter.remoteImports(), 1);
    assert.deepEqual(editorGetLastCommit(editor)?.tags, remoteCollabTags);
    insertTextAtEnd(editor, '#', { tags: 'skip-collab' });
    assert.equal(editorString(editor, []), 'one!?#');
    assert.equal(adapter.exports().length, 1);

    adapter.pause();
    insertTextAtEnd(editor, '$');
    assert.equal(editorString(editor, []), 'one!?#$');
    assert.equal(adapter.exports().length, 1);

    adapter.connect();
    insertTextAtEnd(editor, '+');
    assert.equal(editorString(editor, []), 'one!?#$+');
    assert.equal(adapter.exports().length, 2);

    const listenerEventsBeforeCleanup = adapter.listenerEvents().length;
    unextend();

    insertTextAtEnd(editor, '~');

    assert.equal(editorString(editor, []), 'one!?#$+~');
    assert.equal(adapter.listenerEvents().length, listenerEventsBeforeCleanup);
  });
});
