import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  getSnapshot as editorGetSnapshot,
  replace as editorReplace,
  string as editorString,
} from '@platejs/plite/internal';

import {
  createEditor,
  createEditorView,
  defineExtension,
  type EditorCommitHandler,
} from '@platejs/plite';

const paragraph = (text: string) => ({
  type: 'paragraph',
  children: [{ text }],
});

type ViewAfterCommitEvent = {
  editor: unknown;
  root: string | undefined;
  snapshotText: string;
  text: string;
};

const seedEditor = <TEditor extends ReturnType<typeof createEditor>>(
  editor: TEditor = createEditor() as TEditor
) => {
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

describe('editor.update afterCommit', () => {
  it('runs registered effects once after a successful outer commit', () => {
    const editor = seedEditor();
    const events: string[] = [];

    editor.update((tx, { afterCommit }) => {
      afterCommit(({ commit, snapshot }) => {
        assert.equal(commit.changed.has('text'), true);
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

  it('drops registered effects when an update discards its draft', () => {
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

  it('runs update effects in registration order', () => {
    const editor = seedEditor();
    const events: string[] = [];

    editor.update((tx, { afterCommit }) => {
      afterCommit(() => {
        events.push('outer-before');
      });

      tx.text.insert('!');

      afterCommit(() => {
        events.push('middle');
      });
      tx.text.insert('?');

      afterCommit(() => {
        events.push('outer-after');
      });
    });

    assert.equal(editorString(editor, []), 'one!?');
    assert.deepEqual(events, ['outer-before', 'middle', 'outer-after']);
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
          defineExtension('nested-on-commit', {
            on: {
              commit({ commit, editor }) {
                if (
                  commit.changed.has('text') &&
                  editorString(editor, []) === 'one!'
                ) {
                  editor.update((tx) => {
                    tx.text.insert('?');
                  });
                }
              },
            },
          }),
        ] as const,
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

  it('keeps an extension onCommit snapshot tied to its commit during nested updates', () => {
    const versions: string[] = [];
    const editor = seedEditor(
      createEditor({
        extensions: [
          defineExtension('nested-on-commit-snapshot', {
            on: {
              commit({ commit, editor, snapshot }) {
                if (
                  commit.changed.has('text') &&
                  editorString(editor, []) === 'one!'
                ) {
                  editor.update((tx) => {
                    tx.text.insert('?');
                  });
                  versions.push(
                    `commit:${commit.version}:snapshot:${snapshot.version}:live:${editorGetSnapshot(editor).version}`
                  );
                }
              },
            },
          }),
        ] as const,
      })
    );

    editor.update((tx) => {
      tx.text.insert('!');
    });

    assert.equal(editorString(editor, []), 'one!?');
    assert.deepEqual(versions, ['commit:2:snapshot:2:live:3']);
  });

  it('keeps a named-root extension snapshot scoped and stable during nested updates', () => {
    const runtime = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    const events: string[] = [];

    headerEditor.install(
      defineExtension('nested-named-root-on-commit-snapshot', {
        on: {
          commit({ commit, editor, snapshot }) {
            const [block] = snapshot.children as readonly {
              readonly children: readonly { readonly text: string }[];
            }[];
            const snapshotText = block?.children[0]?.text ?? '';

            if (
              !commit.changed.has('text', 'header') ||
              snapshotText !== 'header!'
            ) {
              return;
            }

            editor.update((tx) => {
              tx.text.insert('?', { at: { path: [0, 0], offset: 7 } });
            });
            events.push(
              `commit:${commit.version}:snapshot:${snapshot.version}:${snapshotText}:live:${editorGetSnapshot(editor).version}:${editor.read((state) => state.text.string([]))}`
            );
          },
        },
      })
    );

    headerEditor.update((tx) => {
      tx.text.insert('!', { at: { path: [0, 0], offset: 6 } });
    });

    assert.equal(editorString(runtime, []), 'body');
    assert.equal(editorString(headerEditor, []), 'header!?');
    assert.deepEqual(events, ['commit:2:snapshot:2:header!:live:3:header!?']);
  });

  it('runs update-local effects after extension onCommit listeners', () => {
    const events: string[] = [];
    const editor = seedEditor(
      createEditor({
        extensions: [
          defineExtension('commit-order', {
            on: {
              commit() {
                events.push('onCommit');
              },
            },
          }),
        ] as const,
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
    const runtime = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    let event: ViewAfterCommitEvent | null = null;

    headerEditor.update((tx, { afterCommit }) => {
      afterCommit(({ editor, snapshot }) => {
        const [block] = snapshot.children as readonly {
          readonly children: readonly { readonly text: string }[];
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

    const recordedEvent = event as unknown as ViewAfterCommitEvent | null;

    assert.equal(recordedEvent?.editor, headerEditor);
    assert.deepEqual(recordedEvent, {
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
