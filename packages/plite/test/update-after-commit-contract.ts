import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  getSnapshot as editorGetSnapshot,
  replace as editorReplace,
  string as editorString,
} from '@platejs/plite/internal';

import {
  createEditor,
  createEditorRuntime,
  createEditorView,
  type Descendant,
  defineEditorExtension,
  type EditorCommitHandler,
} from '../src';

const paragraph = (text: string): Descendant => ({
  type: 'paragraph',
  children: [{ text }],
});

const seedEditor = <TEditor extends ReturnType<typeof createEditor>>(
  editor: TEditor = createEditor() as TEditor
) => {
  editorReplace(editor, {
    children: [paragraph('one')],
    marks: null,
    selection: {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    },
  });

  return editor;
};

describe('editor.update afterCommit', () => {
  it('runs registered effects once after a successful outer commit', () => {
    const editor = seedEditor();
    const events: string[] = [];

    editor.update((tx, { afterCommit }) => {
      afterCommit(({ commit, snapshot }) => {
        assert.equal(commit.operations.length, 1);
        assert.equal(snapshot.version, commit.version);
        events.push(`after:${editorString(editor, [])}`);
      });

      tx.text.insert('!');
      assert.deepEqual(events, []);
    });

    assert.deepEqual(events, ['after:one!']);
  });

  it('drops registered effects when an update produces no commit', () => {
    const editor = seedEditor();
    const events: string[] = [];

    editor.update((_tx, { afterCommit }) => {
      afterCommit(() => {
        events.push('after');
      });
    });

    assert.deepEqual(events, []);
    assert.equal(editorString(editor, []), 'one');
  });

  it('drops registered effects when an update rolls back', () => {
    const editor = seedEditor();
    const events: string[] = [];

    assert.throws(() => {
      editor.update((tx, { afterCommit }) => {
        afterCommit(() => {
          events.push('after');
        });

        tx.text.insert('!');
        throw new Error('boom');
      });
    }, /boom/);

    assert.deepEqual(events, []);
    assert.equal(editorString(editor, []), 'one');
  });

  it('collects nested update effects on the outer commit in registration order', () => {
    const editor = seedEditor();
    const events: string[] = [];

    editor.update((tx, { afterCommit }) => {
      afterCommit(() => {
        events.push('outer-before');
      });

      tx.text.insert('!');

      editor.update((nestedTx, { afterCommit }) => {
        afterCommit(() => {
          events.push('inner');
        });

        nestedTx.text.insert('?');
      });

      afterCommit(() => {
        events.push('outer-after');
      });
    });

    assert.equal(editorString(editor, []), 'one!?');
    assert.deepEqual(events, ['outer-before', 'inner', 'outer-after']);
  });

  it('keeps each effect snapshot tied to the commit even when an earlier effect updates again', () => {
    const editor = seedEditor();
    const versions: string[] = [];

    editor.update((tx, { afterCommit }) => {
      afterCommit(({ editor }) => {
        editor.update((tx) => {
          tx.text.insert('?');
        });
      });

      afterCommit(({ commit, snapshot }) => {
        versions.push(
          `commit:${commit.version}:snapshot:${snapshot.version}:live:${editorGetSnapshot(editor).version}`
        );
      });

      tx.text.insert('!');
    });

    assert.equal(editorString(editor, []), 'one!?');
    assert.deepEqual(versions, ['commit:2:snapshot:2:live:3']);
  });

  it('captures effect snapshots before onCommit listeners can advance the editor', () => {
    const editor = seedEditor(
      createEditor({
        extensions: [
          defineEditorExtension({
            name: 'nested-on-commit',
            onCommit({ commit, editor }) {
              if (
                commit.operations.some(
                  (operation) =>
                    operation.type === 'insert_text' &&
                    'text' in operation &&
                    operation.text === '!'
                )
              ) {
                editor.update((tx) => {
                  tx.text.insert('?');
                });
              }
            },
          }),
        ],
      })
    );
    const versions: string[] = [];

    editor.update((tx, { afterCommit }) => {
      afterCommit(({ commit, snapshot }) => {
        versions.push(
          `commit:${commit.version}:snapshot:${snapshot.version}:live:${editorGetSnapshot(editor).version}`
        );
      });

      tx.text.insert('!');
    });

    assert.equal(editorString(editor, []), 'one!?');
    assert.deepEqual(versions, ['commit:2:snapshot:2:live:3']);
  });

  it('runs update-local effects after extension onCommit listeners', () => {
    const events: string[] = [];
    const editor = seedEditor(
      createEditor({
        extensions: [
          defineEditorExtension({
            name: 'commit-order',
            onCommit() {
              events.push('onCommit');
            },
          }),
        ],
      })
    );
    events.length = 0;

    editor.update((tx, { afterCommit }) => {
      afterCommit(() => {
        events.push('afterCommit');
      });

      tx.text.insert('!');
    });

    assert.deepEqual(events, ['onCommit', 'afterCommit']);
  });

  it('passes view-scoped editor and snapshot to view afterCommit handlers', () => {
    const runtime = createEditorRuntime({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    let event: {
      editor: unknown;
      root: string;
      snapshotText: string;
      text: string;
    } | null = null;

    headerEditor.update((tx, { afterCommit }) => {
      afterCommit(({ editor, snapshot }) => {
        const [block] = snapshot.children as {
          children: { text: string }[];
        }[];

        event = {
          editor,
          root: editor.read((state) => state.view.root()),
          snapshotText: block?.children[0]?.text ?? '',
          text: editor.read((state) => state.text.string([])),
        };
      });

      tx.text.insert('!');
    });

    assert.equal(event?.editor, headerEditor);
    assert.deepEqual(event, {
      editor: headerEditor,
      root: 'header',
      snapshotText: 'header!',
      text: 'header!',
    });
  });

  it('rejects afterCommit registration outside the active update callback', () => {
    const editor = seedEditor();
    let register: ((handler: EditorCommitHandler) => void) | null = null;

    editor.update((_tx, context) => {
      register = context.afterCommit;
    });

    assert(register);
    assert.throws(
      () =>
        register?.(() => {
          throw new Error('should not run');
        }),
      /afterCommit can only be registered during editor.update/
    );
  });

  it('rejects stale afterCommit registration during a later update', () => {
    const editor = seedEditor();
    const events: string[] = [];
    let register: ((handler: EditorCommitHandler) => void) | null = null;

    editor.update((_tx, context) => {
      register = context.afterCommit;
    });

    assert(register);

    editor.update((tx) => {
      assert.throws(
        () =>
          register?.(() => {
            events.push('stale');
          }),
        /afterCommit can only be registered during editor.update/
      );

      tx.text.insert('!');
    });

    assert.deepEqual(events, []);
  });
});
