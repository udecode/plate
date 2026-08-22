import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  createEditorView,
  defineExtension,
  type EditorCommitHandler,
} from '@platejs/plite';
import {
  getSnapshot as editorGetSnapshot,
  replace as editorReplace,
  subscribeSource as editorSubscribeSource,
  string as editorString,
} from '@platejs/plite/internal';

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
      afterCommit(({ editor: innerEditor }) => {
        innerEditor.update((innerTx) => {
          innerTx.text.insert('?');
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
              commit({ commit, editor: innerEditor2 }) {
                if (
                  commit.changed.has('text') &&
                  editorString(innerEditor2, []) === 'one!'
                ) {
                  innerEditor2.update((tx) => {
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
              commit({ commit, editor: innerEditor3, snapshot }) {
                if (
                  commit.changed.has('text') &&
                  editorString(innerEditor3, []) === 'one!'
                ) {
                  innerEditor3.update((tx) => {
                    tx.text.insert('?');
                  });
                  versions.push(
                    `commit:${commit.version}:snapshot:${snapshot.version}:live:${editorGetSnapshot(innerEditor3).version}`
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
            const [block] = snapshot.children as ReadonlyArray<{
              readonly children: ReadonlyArray<{ readonly text: string }>;
            }>;
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

  it('rolls back callback failures before publication', () => {
    const editor = createEditor({
      extensions: [
        defineExtension('throwing-transaction-change', {
          on: {
            transactionChange() {
              throw new Error('transaction-change failed');
            },
          },
        }),
      ] as const,
      initialValue: [paragraph('one')],
    });

    assert.throws(
      () =>
        editor.update((tx) => {
          tx.text.insert('!', { at: { offset: 3, path: [0, 0] } });
        }),
      /transaction-change failed/
    );
    assert.equal(editor.read.text.string([]), 'one');
    assert.equal(editor.read.runtime.snapshot().version, 0);
    assert.equal(editor.read.lastCommit(), null);
  });

  it('isolates post-commit observer failures after publication', () => {
    const assertCommitted = (
      actual: {
        commitVersion: number | undefined;
        text: string;
        version: number;
      },
      text: string,
      version: number
    ) => {
      assert.deepEqual(actual, {
        commitVersion: version,
        text,
        version,
      });
    };

    {
      const errors: Array<{ extensionName: string; phase: string }> = [];
      const events: string[] = [];
      const editor = createEditor({
        extensions: [
          defineExtension('throwing-extension-commit', {
            on: {
              commit() {
                events.push('throwing');
                throw new Error('extension commit failed');
              },
            },
          }),
          defineExtension('later-extension-commit', {
            on: { commit: () => events.push('later') },
          }),
        ] as const,
        initialValue: [paragraph('one')],
        lifecycleErrorSink(error) {
          errors.push({
            extensionName: error.extensionName,
            phase: error.phase,
          });
        },
      });

      assert.doesNotThrow(() => {
        editor.update((tx) => {
          tx.text.insert('!', { at: { offset: 3, path: [0, 0] } });
        });
      });
      assertCommitted(
        {
          commitVersion: editor.read.lastCommit()?.version,
          text: editor.read.text.string([]),
          version: editor.read.runtime.snapshot().version,
        },
        'one!',
        1
      );
      assert.deepEqual(events, ['throwing', 'later']);
      assert.deepEqual(errors, [
        {
          extensionName: 'throwing-extension-commit',
          phase: 'commit-listener',
        },
      ]);
      assert.doesNotThrow(() => {
        editor.update((tx) => {
          tx.text.insert('?', { at: { offset: 4, path: [0, 0] } });
        });
      });
      assertCommitted(
        {
          commitVersion: editor.read.lastCommit()?.version,
          text: editor.read.text.string([]),
          version: editor.read.runtime.snapshot().version,
        },
        'one!?',
        2
      );
    }

    {
      const errors: Array<{ extensionName: string; phase: string }> = [];
      const events: string[] = [];
      const editor = createEditor({
        extensions: [
          defineExtension('throwing-node-change', {
            on: {
              nodeChange() {
                events.push('throwing');
                throw new Error('node change failed');
              },
            },
          }),
          defineExtension('later-node-change', {
            on: { nodeChange: () => events.push('later') },
          }),
        ] as const,
        initialValue: [paragraph('one')],
        lifecycleErrorSink(error) {
          errors.push({
            extensionName: error.extensionName,
            phase: error.phase,
          });
        },
      });

      assert.doesNotThrow(() => {
        editor.update((tx) => {
          tx.nodes.set({ iteration: 1 }, { at: [0] });
        });
      });
      assert.equal(editor.read.runtime.snapshot().version, 1);
      assert.equal(editor.read.lastCommit()?.version, 1);
      assert.deepEqual(editor.read.runtime.snapshot().children, [
        {
          type: 'paragraph',
          children: [{ text: 'one' }],
          iteration: 1,
        },
      ]);
      assert.deepEqual(events, ['throwing', 'later']);
      assert.deepEqual(errors, [
        {
          extensionName: 'throwing-node-change',
          phase: 'node-change-listener',
        },
      ]);
      assert.doesNotThrow(() => {
        editor.update((tx) => {
          tx.nodes.set({ iteration: 2 }, { at: [0] });
        });
      });
      assert.equal(editor.read.runtime.snapshot().version, 2);
      assert.equal(editor.read.lastCommit()?.version, 2);
    }

    {
      const errors: Array<{ extensionName: string; phase: string }> = [];
      const events: string[] = [];
      const editor = createEditor({
        extensions: [
          defineExtension('throwing-text-change', {
            on: {
              textChange() {
                events.push('throwing');
                throw new Error('text change failed');
              },
            },
          }),
          defineExtension('later-text-change', {
            on: { textChange: () => events.push('later') },
          }),
        ] as const,
        initialValue: [paragraph('one')],
        lifecycleErrorSink(error) {
          errors.push({
            extensionName: error.extensionName,
            phase: error.phase,
          });
        },
      });

      assert.doesNotThrow(() => {
        editor.update((tx) => {
          tx.text.insert('!', { at: { offset: 3, path: [0, 0] } });
        });
      });
      assertCommitted(
        {
          commitVersion: editor.read.lastCommit()?.version,
          text: editor.read.text.string([]),
          version: editor.read.runtime.snapshot().version,
        },
        'one!',
        1
      );
      assert.deepEqual(events, ['throwing', 'later']);
      assert.deepEqual(errors, [
        {
          extensionName: 'throwing-text-change',
          phase: 'text-change-listener',
        },
      ]);
      assert.doesNotThrow(() => {
        editor.update((tx) => {
          tx.text.insert('?', { at: { offset: 4, path: [0, 0] } });
        });
      });
      assertCommitted(
        {
          commitVersion: editor.read.lastCommit()?.version,
          text: editor.read.text.string([]),
          version: editor.read.runtime.snapshot().version,
        },
        'one!?',
        2
      );
    }

    {
      const errors: Array<{ extensionName: string; phase: string }> = [];
      const events: string[] = [];
      const editor = createEditor({
        initialValue: [paragraph('one')],
        lifecycleErrorSink(error) {
          errors.push({
            extensionName: error.extensionName,
            phase: error.phase,
          });
        },
      });

      editor.subscribe(() => {
        events.push('throwing');
        throw new Error('snapshot listener failed');
      });
      editor.subscribe(() => events.push('later'));
      assert.doesNotThrow(() => {
        editor.update((tx) => {
          tx.text.insert('!', { at: { offset: 3, path: [0, 0] } });
        });
      });
      assertCommitted(
        {
          commitVersion: editor.read.lastCommit()?.version,
          text: editor.read.text.string([]),
          version: editor.read.runtime.snapshot().version,
        },
        'one!',
        1
      );
      assert.deepEqual(events, ['throwing', 'later']);
      assert.deepEqual(errors, [
        { extensionName: '$editor', phase: 'snapshot-listener' },
      ]);
      assert.doesNotThrow(() => {
        editor.update((tx) => {
          tx.text.insert('?', { at: { offset: 4, path: [0, 0] } });
        });
      });
      assertCommitted(
        {
          commitVersion: editor.read.lastCommit()?.version,
          text: editor.read.text.string([]),
          version: editor.read.runtime.snapshot().version,
        },
        'one!?',
        2
      );
    }

    {
      const errors: Array<{ extensionName: string; phase: string }> = [];
      const events: string[] = [];
      const editor = createEditor({
        initialValue: [paragraph('one')],
        lifecycleErrorSink(error) {
          errors.push({
            extensionName: error.extensionName,
            phase: error.phase,
          });
        },
      });

      editorSubscribeSource(editor, 'text', () => {
        events.push('throwing');
        throw new Error('source listener failed');
      });
      editorSubscribeSource(editor, 'text', () => events.push('later'));
      assert.doesNotThrow(() => {
        editor.update((tx) => {
          tx.text.insert('!', { at: { offset: 3, path: [0, 0] } });
        });
      });
      assertCommitted(
        {
          commitVersion: editor.read.lastCommit()?.version,
          text: editor.read.text.string([]),
          version: editor.read.runtime.snapshot().version,
        },
        'one!',
        1
      );
      assert.deepEqual(events, ['throwing', 'later']);
      assert.deepEqual(errors, [
        { extensionName: '$editor', phase: 'source-listener' },
      ]);
      assert.doesNotThrow(() => {
        editor.update((tx) => {
          tx.text.insert('?', { at: { offset: 4, path: [0, 0] } });
        });
      });
      assertCommitted(
        {
          commitVersion: editor.read.lastCommit()?.version,
          text: editor.read.text.string([]),
          version: editor.read.runtime.snapshot().version,
        },
        'one!?',
        2
      );
    }

    {
      const errors: Array<{ extensionName: string; phase: string }> = [];
      const events: string[] = [];
      const editor = createEditor({
        initialValue: [paragraph('one')],
        lifecycleErrorSink(error) {
          errors.push({
            extensionName: error.extensionName,
            phase: error.phase,
          });
        },
      });
      const insert = (text: string, offset: number) => {
        assert.doesNotThrow(() => {
          editor.update((tx, { afterCommit }) => {
            afterCommit(() => {
              events.push('throwing');
              throw new Error('after commit failed');
            });
            afterCommit(() => events.push('later'));
            tx.text.insert(text, { at: { offset, path: [0, 0] } });
          });
        });
      };

      insert('!', 3);
      assertCommitted(
        {
          commitVersion: editor.read.lastCommit()?.version,
          text: editor.read.text.string([]),
          version: editor.read.runtime.snapshot().version,
        },
        'one!',
        1
      );
      assert.deepEqual(events, ['throwing', 'later']);
      assert.deepEqual(errors, [
        { extensionName: '$editor', phase: 'after-commit' },
      ]);
      insert('?', 4);
      assertCommitted(
        {
          commitVersion: editor.read.lastCommit()?.version,
          text: editor.read.text.string([]),
          version: editor.read.runtime.snapshot().version,
        },
        'one!?',
        2
      );
    }
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
        const [block] = snapshot.children as ReadonlyArray<{
          readonly children: ReadonlyArray<{ readonly text: string }>;
        }>;

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

    assert.ok(register);
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

    assert.ok(register);

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
