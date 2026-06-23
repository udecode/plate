import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Editor } from '@platejs/plite/internal';

import {
  createEditor,
  type Descendant,
  defineEditorExtension,
  type EditorUpdateOptions,
  type Operation,
} from '../src';

const paragraph = (text: string): Descendant => ({
  type: 'paragraph',
  children: [{ text }],
});

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const remoteCollabOptions = {
  metadata: {
    collab: { origin: 'remote', saveToHistory: false },
    history: { mode: 'skip' },
    selection: { dom: 'preserve', focus: false, scroll: false },
  },
  tag: ['collaboration', 'remote-import'],
} satisfies EditorUpdateOptions;

const createSeededEditor = () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: [paragraph('one')],
    selection: {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    },
    marks: null,
  });

  return editor;
};

type FakeAdapterState = {
  connected: boolean;
  exports: Operation[][];
  originClientId: string;
  paused: boolean;
  remoteImports: number;
};

const createFakeCollabAdapterExtension = () => {
  let controller: {
    connect: () => void;
    exports: () => readonly Operation[][];
    importRemote: (operations: readonly Operation[]) => void;
    listenerEvents: () => readonly string[];
    pause: () => void;
    remoteImports: () => number;
    resume: () => void;
    state: () => FakeAdapterState;
  } | null = null;
  const listenerEvents: string[] = [];

  const extension = defineEditorExtension({
    name: 'fake-collab-adapter',
    setup(context) {
      const adapterState = context.runtimeState<FakeAdapterState>({
        connected: true,
        exports: [],
        originClientId: 'local-client',
        paused: false,
        remoteImports: 0,
      });
      const setAdapterState = (
        patch:
          | Partial<FakeAdapterState>
          | ((state: FakeAdapterState) => FakeAdapterState)
      ) => {
        adapterState.set((state) =>
          typeof patch === 'function' ? patch(state) : { ...state, ...patch }
        );
      };

      controller = {
        connect() {
          setAdapterState({ connected: true, paused: false });
        },
        exports() {
          return adapterState.get().exports;
        },
        importRemote(operations) {
          context.editor.update((tx) => {
            tx.operations.replay(clone(operations));
          }, remoteCollabOptions);
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

      return {
        cleanup() {
          setAdapterState({ connected: false, paused: true });
        },
        onCommit({ commit }) {
          listenerEvents.push(`commit:${commit.tags.join(',')}`);

          const state = adapterState.get();

          if (!state.connected || state.paused) {
            return;
          }
          if (commit.tags.includes('skip-collab')) {
            return;
          }
          if (commit.tags.includes('collaboration')) {
            return;
          }
          if (commit.metadata.collab?.origin === 'remote') {
            return;
          }

          setAdapterState({
            exports: [...state.exports, clone(commit.operations)],
          });
        },
      };
    },
  });

  return {
    controller() {
      assert(controller);

      return controller;
    },
    extension,
  };
};

const insertTextAtEnd = (
  editor: ReturnType<typeof createSeededEditor>,
  text: string,
  options?: EditorUpdateOptions
) => {
  editor.update((tx) => {
    tx.text.insert(text, {
      at: { path: [0, 0], offset: Editor.string(editor, [0]).length },
    });
  }, options);
};

describe('collab adapter extension contract', () => {
  it('exports local commits and suppresses remote, skipped, paused, and cleaned-up loops without editor monkey-patches', () => {
    const editor = createSeededEditor();
    const fakeAdapter = createFakeCollabAdapterExtension();
    const unextend = editor.extend(fakeAdapter.extension);
    const adapter = fakeAdapter.controller();

    assert.equal('apply' in editor, false);
    assert.equal('onChange' in editor, false);
    assert.equal('connectYjs' in editor, false);
    assert.equal(adapter.state().originClientId, 'local-client');

    insertTextAtEnd(editor, '!');

    assert.equal(adapter.exports().length, 1);
    assert.deepEqual(
      adapter.exports()[0]?.map((operation) => operation.type),
      ['insert_text']
    );

    adapter.importRemote([
      {
        type: 'insert_text',
        path: [0, 0],
        offset: Editor.string(editor, [0]).length,
        text: '?',
      },
    ]);

    assert.equal(Editor.string(editor, []), 'one!?');
    assert.equal(adapter.exports().length, 1);
    assert.equal(adapter.remoteImports(), 1);
    assert.deepEqual(Editor.getLastCommit(editor)?.tags, [
      'collaboration',
      'remote-import',
    ]);
    assert.deepEqual(
      Editor.getLastCommit(editor)?.metadata,
      remoteCollabOptions.metadata
    );

    insertTextAtEnd(editor, '#', { tag: 'skip-collab' });
    assert.equal(Editor.string(editor, []), 'one!?#');
    assert.equal(adapter.exports().length, 1);

    adapter.pause();
    insertTextAtEnd(editor, '$');
    assert.equal(Editor.string(editor, []), 'one!?#$');
    assert.equal(adapter.exports().length, 1);

    adapter.connect();
    insertTextAtEnd(editor, '+');
    assert.equal(Editor.string(editor, []), 'one!?#$+');
    assert.equal(adapter.exports().length, 2);

    const listenerEventsBeforeCleanup = adapter.listenerEvents().length;
    unextend();

    insertTextAtEnd(editor, '~');

    assert.equal(Editor.string(editor, []), 'one!?#$+~');
    assert.equal(adapter.listenerEvents().length, listenerEventsBeforeCleanup);
  });
});
