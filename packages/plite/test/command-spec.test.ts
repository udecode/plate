import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  createEditorRuntime,
  createEditorView,
  defineCommand,
  defineEditorExtension,
  defineEditorSchema,
  defineUpdateAnnotation,
  editorCommands,
  element,
  type EditorCommandRegistration,
  type EditorTransactionDraftRef,
  type Point,
  SelectionApi,
  schema,
  type TransactionSpec,
  type Value,
} from '@platejs/plite';
import { dispatchCommand } from '@platejs/plite/internal';
import { defineTestSchema } from './support/schema';

type InsertCommand = {
  text: string;
  type: 'test.insert';
};

const createTextEditor = (...commands: EditorCommandRegistration<any>[]) =>
  createEditor({
    extensions:
      commands.length === 0
        ? []
        : [defineEditorExtension({ commands, name: 'test.commands' })],
    initialSelection: SelectionApi.text({
      anchor: { offset: 1, path: [0, 0] },
      focus: { offset: 1, path: [0, 0] },
    }),
    initialValue: [{ type: 'paragraph', children: [{ text: 'ab' }] }] as Value,
  });

const insert = defineCommand<InsertCommand>({
  run: ({ command, state }) =>
    state.transaction((tx) => {
      tx.text.insert(command.text);
    }),
  type: 'test.insert',
});

const deleteWordBackward = defineCommand<{
  type: 'test.delete-word-backward';
}>({
  run: ({ state }) =>
    state.transaction((tx) => {
      tx.text.delete({ reverse: true, unit: 'word' });
    }),
  type: 'test.delete-word-backward',
});

describe('pure command transaction specs', () => {
  it('builds a frozen spec without publishing or moving anchors', () => {
    const editor = createTextEditor();
    const anchor = editor.anchor(
      { offset: 1, path: [0, 0] },
      { association: 'forward', deletion: 'nearest' }
    );
    let commits = 0;

    editor.subscribeCommit(() => commits++);
    const spec = insert.run({
      command: { text: '!', type: insert.type },
      state: editor.read((state) => state),
      tags: Object.freeze([]),
    }) as TransactionSpec;

    assert.equal(Object.isFrozen(spec), true);
    assert.throws(
      () => (spec.changes.roots as Map<string, unknown>).clear(),
      /Cannot mutate a published DocumentChange map/
    );
    assert.throws(
      () => (spec.changes.createRoots as Set<string>).add('other'),
      /Cannot mutate a published DocumentChange set/
    );
    assert.equal(editor.read.text.string([]), 'ab');
    assert.deepEqual(anchor.resolve(), { offset: 1, path: [0, 0] });
    assert.equal(commits, 0);

    assert.equal(editor.update.command(insert, { text: '!' }), true);
    assert.equal(editor.read.text.string([]), 'a!b');
    assert.deepEqual(anchor.resolve(), { offset: 2, path: [0, 0] });
    assert.equal(commits, 1);
    anchor.release();
  });

  it('reuses the committed runtime index while dispatching a command spec', () => {
    const editor = createTextEditor();
    let commits = 0;
    const profiledIds: string[] = [];
    const profilerGlobal = globalThis as typeof globalThis & {
      __PLITE_REACT_RENDER_PROFILER__?: {
        record?: (event: { id: string; kind: string }) => void;
      };
    };
    const previousProfiler = profilerGlobal.__PLITE_REACT_RENDER_PROFILER__;

    void editor.read.runtime.snapshot().index;
    editor.subscribeCommit(() => commits++);

    try {
      profilerGlobal.__PLITE_REACT_RENDER_PROFILER__ = {
        record(event) {
          if (event.kind === 'core-time') profiledIds.push(event.id);
        },
      };

      assert.equal(editor.update.command(insert, { text: '!' }), true);
    } finally {
      profilerGlobal.__PLITE_REACT_RENDER_PROFILER__ = previousProfiler;
    }

    assert.equal(
      profiledIds.filter((id) => id === 'runtime-index-full-build').length,
      0
    );
    assert.equal(
      profiledIds.filter((id) => id === 'transaction-runtime-ids').length,
      1
    );
    assert.equal(
      profiledIds.filter((id) => id === 'transaction-callback').length,
      1
    );
    assert.equal(editor.read.text.string([]), 'a!b');
    assert.equal(commits, 1);
  });

  it('evaluates against an active draft and publishes one outer commit', () => {
    const editor = createTextEditor();
    let commits = 0;

    editor.subscribeCommit(() => commits++);
    editor.update((tx) => {
      tx.text.insert('x');
      tx.command(insert, { text: 'y' });
    });

    assert.equal(editor.read.text.string([]), 'axyb');
    assert.equal(commits, 1);
  });

  it('applies sequential semantic commands in one explicit transaction', () => {
    const editor = createTextEditor();
    let commits = 0;
    const profiledIds: string[] = [];
    const profilerGlobal = globalThis as typeof globalThis & {
      __PLITE_REACT_RENDER_PROFILER__?: {
        record?: (event: { id: string; kind: string }) => void;
      };
    };
    const previousProfiler = profilerGlobal.__PLITE_REACT_RENDER_PROFILER__;

    editor.subscribeCommit(() => commits++);
    try {
      profilerGlobal.__PLITE_REACT_RENDER_PROFILER__ = {
        record(event) {
          if (event.kind === 'core-time') profiledIds.push(event.id);
        },
      };

      editor.update((tx) => {
        tx.command(insert, { text: 'x' });
        tx.command(insert, { text: 'y' });
      });
    } finally {
      profilerGlobal.__PLITE_REACT_RENDER_PROFILER__ = previousProfiler;
    }

    assert.equal(editor.read.text.string([]), 'axyb');
    assert.equal(commits, 1);
    assert.equal(
      profiledIds.filter((id) => id === 'transaction-runtime-ids').length,
      2
    );
    assert.equal(
      profiledIds.filter((id) => id === 'transaction-callback').length,
      1
    );
  });

  it('keeps one-shot command policy at its update boundary', () => {
    const editor = createTextEditor();

    assert.equal(
      editor.update({ tags: 'semantic-command' }).command(insert, {
        text: '!',
      }),
      true
    );
    assert.deepEqual(editor.read.lastCommit()?.tags, ['semantic-command']);

    assert.throws(
      () =>
        editor.update({ tags: 'outer' }, () => {
          editor.update({ tags: 'inner' }).command(insert, { text: '?' });
        }),
      /cannot be nested/
    );
    assert.equal(editor.read.text.string([]), 'a!b');
  });

  it('routes one-shot updates through commands and keeps tx methods primitive', () => {
    const seen: string[] = [];
    const editor = createTextEditor(
      editorCommands.insertText.handle(({ command }, next) => {
        seen.push(command.text);

        return next({ ...command, text: command.text.toUpperCase() });
      })
    );

    editor.update.text.insert('x');

    assert.deepEqual(seen, ['x']);
    assert.equal(editor.read.text.string([]), 'aXb');

    editor.update((tx) => {
      tx.text.insert('y');
    });

    assert.deepEqual(seen, ['x']);
    assert.equal(editor.read.text.string([]), 'aXyb');
  });

  it('removes an empty block after a block void before deleting the void', () => {
    const createBlockVoidEditor = () =>
      createEditor({
        extensions: [
          defineTestSchema('test.block-void-boundary', {
            image: { void: 'block' },
          }),
        ],
        initialSelection: SelectionApi.text({
          anchor: { offset: 0, path: [1, 0] },
          focus: { offset: 0, path: [1, 0] },
        }),
        initialValue: [
          { type: 'image', children: [{ text: '' }] },
          { type: 'paragraph', children: [{ text: '' }] },
          { type: 'paragraph', children: [{ text: 'after' }] },
        ],
      });
    const editor = createBlockVoidEditor();

    editor.update.text.deleteBackward();

    assert.deepEqual(editor.read.children(), [
      { type: 'image', children: [{ text: '' }] },
      { type: 'paragraph', children: [{ text: 'after' }] },
    ]);
    assert.deepEqual(editor.read.selection(), {
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });

    const primitiveEditor = createBlockVoidEditor();

    primitiveEditor.update((tx) => tx.text.deleteBackward());

    assert.deepEqual(primitiveEditor.read.children(), [
      { type: 'paragraph', children: [{ text: '' }] },
      { type: 'paragraph', children: [{ text: 'after' }] },
    ]);
  });

  it('preserves leading inline voids when deleting their split-block boundary', () => {
    const boundaryOffset = 'before'.length;
    const editor = createEditor({
      extensions: [
        defineTestSchema('test.inline-void-boundary', {
          mention: { void: 'markable-inline' },
        }),
      ],
      initialSelection: SelectionApi.text({
        anchor: { offset: boundaryOffset, path: [0, 0] },
        focus: { offset: boundaryOffset, path: [0, 0] },
      }),
      initialValue: [
        {
          type: 'paragraph',
          children: [
            { text: 'before' },
            {
              type: 'mention',
              character: 'Ada',
              children: [{ bold: true, text: '' }],
            },
            { text: ' or ' },
            {
              type: 'mention',
              character: 'Lin',
              children: [{ text: '' }],
            },
            { text: '!' },
          ],
        },
      ],
    });

    editor.update.break.insert();

    assert.deepEqual(editor.read.children(), [
      { type: 'paragraph', children: [{ text: 'before' }] },
      {
        type: 'paragraph',
        children: [
          { text: '' },
          {
            type: 'mention',
            character: 'Ada',
            children: [{ bold: true, text: '' }],
          },
          { text: ' or ' },
          {
            type: 'mention',
            character: 'Lin',
            children: [{ text: '' }],
          },
          { text: '!' },
        ],
      },
    ]);
    assert.deepEqual(editor.read.selection(), {
      kind: 'text',
      anchor: { offset: 0, path: [1, 0] },
      focus: { offset: 0, path: [1, 0] },
    });

    editor.update.text.deleteBackward();

    assert.deepEqual(editor.read.children(), [
      {
        type: 'paragraph',
        children: [
          { text: 'before' },
          {
            type: 'mention',
            character: 'Ada',
            children: [{ bold: true, text: '' }],
          },
          { text: ' or ' },
          {
            type: 'mention',
            character: 'Lin',
            children: [{ text: '' }],
          },
          { text: '!' },
        ],
      },
    ]);
    assert.deepEqual(editor.read.selection(), {
      kind: 'text',
      anchor: { offset: boundaryOffset, path: [0, 0] },
      focus: { offset: boundaryOffset, path: [0, 0] },
    });
  });

  it('replaces an explicit text target independently of the current selection', () => {
    const editor = createEditor({
      initialSelection: SelectionApi.text({
        anchor: { offset: 2, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      }),
      initialValue: [{ type: 'paragraph', children: [{ text: 'iS' }] }],
    });
    let commits = 0;

    editor.subscribeCommit(() => commits++);
    dispatchCommand(editor, editorCommands.insertText, {
      options: {
        at: SelectionApi.text({
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 1, path: [0, 0] },
        }),
      },
      text: 'I',
      type: 'insert_text',
    });

    assert.equal(editor.read.text.string([]), 'IS');
    assert.deepEqual(editor.read.selection(), {
      kind: 'text',
      anchor: { offset: 1, path: [0, 0] },
      focus: { offset: 1, path: [0, 0] },
    });
    assert.equal(commits, 1);
  });

  it('dispatches collapse and block toggle as pure semantic commands', () => {
    const seen: string[] = [];
    const editor = createEditor({
      extensions: [
        defineEditorExtension({
          commands: [
            editorCommands.collapse.handle(({ command }, next) => {
              seen.push(command.type);

              return next();
            }),
            editorCommands.toggleBlock.handle(({ command }, next) => {
              seen.push(command.type);

              return next();
            }),
          ],
          name: 'test.semantic-selection-and-block-commands',
        }),
      ],
      initialSelection: SelectionApi.text({
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      }),
      initialValue: [{ type: 'paragraph', children: [{ text: 'ab' }] }],
    });

    dispatchCommand(editor, editorCommands.toggleBlock, {
      blockType: 'heading-one',
      options: {
        collapse: { edge: 'end' },
        defaultType: 'paragraph',
      },
      type: 'toggle_block',
    });

    dispatchCommand(editor, editorCommands.select, {
      target: SelectionApi.text({
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      }),
      type: 'select',
    });
    dispatchCommand(editor, editorCommands.collapse, {
      options: { edge: 'start' },
      type: 'collapse_selection',
    });

    assert.deepEqual(seen, ['toggle_block', 'collapse_selection']);
    assert.deepEqual(editor.read.selection(), {
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });
    assert.deepEqual(editor.read.children(), [
      { type: 'heading-one', children: [{ text: 'ab' }] },
    ]);
  });

  it('clears exclusive marks and collapses in one semantic command', () => {
    const editor = createEditor({
      initialSelection: SelectionApi.text({
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      }),
      initialValue: [
        {
          type: 'paragraph',
          children: [{ subscript: true, text: 'ab' }],
        },
      ],
    });

    dispatchCommand(editor, editorCommands.toggleMark, {
      key: 'superscript',
      options: {
        clear: 'subscript',
        collapse: { edge: 'end' },
      },
      type: 'toggle_mark',
      value: true,
    });

    assert.deepEqual(editor.read.children(), [
      {
        type: 'paragraph',
        children: [{ superscript: true, text: 'ab' }],
      },
    ]);
    assert.deepEqual(editor.read.selection(), {
      kind: 'text',
      anchor: { offset: 2, path: [0, 0] },
      focus: { offset: 2, path: [0, 0] },
    });

    dispatchCommand(editor, editorCommands.select, {
      target: SelectionApi.text({
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      }),
      type: 'select',
    });
    dispatchCommand(editor, editorCommands.toggleMark, {
      key: 'superscript',
      options: { clear: 'subscript' },
      type: 'toggle_mark',
      value: true,
    });

    assert.deepEqual(editor.read.children(), [
      { type: 'paragraph', children: [{ text: 'ab' }] },
    ]);
  });

  it('checks the active collapsed mark before clearing exclusive peers', () => {
    const editor = createTextEditor();

    editor.update((tx) => {
      tx.marks.set({ bold: true, italic: true });
    });
    dispatchCommand(editor, editorCommands.toggleMark, {
      key: 'bold',
      options: { clear: ['bold', 'italic'] },
      type: 'toggle_mark',
      value: true,
    });

    assert.deepEqual(editor.read.marks(), { italic: true });
  });

  it('keeps command specs rooted to the dispatching view', () => {
    const runtime = createEditorRuntime({
      initialValue: {
        children: [{ type: 'paragraph', children: [{ text: 'main' }] }],
        roots: {
          header: [{ type: 'paragraph', children: [{ text: 'head' }] }],
        },
      },
    });
    const header = createEditorView(runtime, { root: 'header' });
    let commits = 0;
    const profiledIds: string[] = [];
    const profilerGlobal = globalThis as typeof globalThis & {
      __PLITE_REACT_RENDER_PROFILER__?: {
        record?: (event: { id: string; kind: string }) => void;
      };
    };
    const previousProfiler = profilerGlobal.__PLITE_REACT_RENDER_PROFILER__;
    const mainRuntimeId = runtime.read.runtime.idAt([0]);
    const headerRuntimeId = header.read.runtime.idAt([0]);

    runtime.subscribeCommit(() => commits++);
    try {
      profilerGlobal.__PLITE_REACT_RENDER_PROFILER__ = {
        record(event) {
          if (event.kind === 'core-time') profiledIds.push(event.id);
        },
      };

      assert.equal(header.update.command(insert, { text: '!' }), true);
      header.update((tx) => {
        assert.equal(tx.command(insert, { text: '?' }), true);
      });
    } finally {
      profilerGlobal.__PLITE_REACT_RENDER_PROFILER__ = previousProfiler;
    }

    assert.deepEqual(
      runtime.read((state) => state.value()),
      {
        children: [{ type: 'paragraph', children: [{ text: 'main' }] }],
        roots: {
          header: [{ type: 'paragraph', children: [{ text: 'head!?' }] }],
        },
      }
    );
    assert.equal(commits, 2);
    assert.equal(runtime.read.runtime.idAt([0]), mainRuntimeId);
    assert.equal(header.read.runtime.idAt([0]), headerRuntimeId);
    assert.equal(
      profiledIds.filter((id) => id === 'transaction-runtime-ids').length,
      2
    );
    assert.equal(
      profiledIds.filter((id) => id === 'transaction-callback').length,
      2
    );

    const readOnlyHeader = createEditorView(runtime, {
      readOnly: true,
      root: 'header',
    });

    assert.throws(() => {
      runtime.update(() => {
        readOnlyHeader.update.command(insert, {
          text: 'blocked',
        });
      });
    }, /read.only/i);
    assert.equal(commits, 2);
  });

  it('keeps direct selection clearing scoped to its view', () => {
    const selection = SelectionApi.text({
      anchor: { offset: 1, path: [0, 0] },
      focus: { offset: 1, path: [0, 0] },
    });
    const runtime = createEditorRuntime({
      initialSelection: selection,
      initialValue: {
        children: [{ type: 'paragraph', children: [{ text: 'main' }] }],
        roots: {
          header: [{ type: 'paragraph', children: [{ text: 'head' }] }],
        },
      },
    });
    const header = createEditorView(runtime, { root: 'header' });

    header.update.selection.set(null);

    assert.deepEqual(runtime.read.selection(), selection);
  });

  it('maps build-scoped refs through draft changes and expires them', () => {
    let leakedRef: EditorTransactionDraftRef<Point> | undefined;
    const insertBeforeTarget = defineCommand<{
      type: 'test.insert-before-target';
    }>({
      run: ({ state }) =>
        state.transaction((tx) => {
          const target = tx.refs.point(
            { offset: 2, path: [0, 0] },
            { association: 'forward', deletion: 'nearest' }
          );

          leakedRef = target;
          tx.text.insert('x');
          assert.deepEqual(target.resolve(), {
            offset: 3,
            path: [0, 0],
          });
          tx.selection.set(target.resolve()!);
        }),
      type: 'test.insert-before-target',
    });
    const editor = createTextEditor();

    dispatchCommand(editor, insertBeforeTarget, {
      type: insertBeforeTarget.type,
    });

    assert.equal(editor.read.text.string([]), 'axb');
    assert.deepEqual(
      editor.read.selection(),
      SelectionApi.text({
        anchor: { offset: 3, path: [0, 0] },
        focus: { offset: 3, path: [0, 0] },
      })
    );
    assert.throws(() => leakedRef?.resolve(), /no longer active/);
  });

  it('preserves priority and next command overrides before dispatch', () => {
    const seen: string[] = [];
    const editor = createTextEditor(
      insert.handle(
        ({ command }, next) => {
          seen.push(`low:${command.text}`);
          return next({ ...command, text: command.text.toUpperCase() });
        },
        { priority: 1 }
      ),
      insert.handle(
        ({ command }, next) => {
          seen.push(`high:${command.text}`);
          return next({ ...command, text: `${command.text}!` });
        },
        { priority: 2 }
      )
    );

    dispatchCommand(editor, insert, { text: 'z', type: insert.type });

    assert.deepEqual(seen, ['high:z', 'low:z!']);
    assert.equal(editor.read.text.string([]), 'aZ!b');
  });

  it('rejects multiple delegations from one handler', () => {
    const editor = createTextEditor(
      insert.handle((_context, next) => {
        next();

        return next();
      })
    );

    assert.throws(
      () => dispatchCommand(editor, insert, { text: 'x', type: insert.type }),
      /may delegate only once/
    );
    assert.equal(editor.read.text.string([]), 'ab');
  });

  it('rejects a handler that discards its delegated result', () => {
    const editor = createTextEditor(
      insert.handle(({ state }, next) => {
        next();

        return state.transaction((tx) => tx.text.insert('y'));
      })
    );

    assert.throws(
      () => dispatchCommand(editor, insert, { text: 'x', type: insert.type }),
      /must return their delegated result/
    );
    assert.equal(editor.read.text.string([]), 'ab');
  });

  it('extends a delegated spec on the same isolated draft', () => {
    const editor = createTextEditor(
      insert.handle(({ state }, next) => {
        const delegated = next();

        if (!delegated) return false;

        return state.transaction.extend(delegated, (tx) => {
          tx.text.insert('?');
        });
      })
    );

    dispatchCommand(editor, insert, { text: 'x', type: insert.type });

    assert.equal(editor.read.text.string([]), 'ax?b');
    assert.equal(editor.read.lastCommit()?.version, 1);
  });

  it('runs downstream handlers against the prefix state', () => {
    const observed: string[] = [];
    const editor = createTextEditor(
      insert.handle(
        ({ state }, next) => {
          observed.push(state.text.string([]));

          return next();
        },
        { priority: 1 }
      ),
      insert.handle(
        ({ state }, next) =>
          next.after(
            state.transaction((tx) => {
              tx.text.insert('x');
            })
          ),
        { priority: 2 }
      )
    );

    dispatchCommand(editor, insert, { text: '!', type: insert.type });

    assert.deepEqual(observed, ['axb']);
    assert.equal(editor.read.text.string([]), 'ax!b');
    assert.equal(editor.read.lastCommit()?.version, 1);
  });

  it('combines prefix metadata and selection into the delegated commit', () => {
    const origin = defineUpdateAnnotation<string>({ key: 'test.origin' });
    const editor = createTextEditor(
      insert.handle(({ state }, next) =>
        next.after(
          state.transaction((tx) => {
            tx.annotations.set(origin, 'prefix');
            tx.selection.move({ distance: 1 });
            tx.tags.add('test-prefix');
          })
        )
      )
    );

    dispatchCommand(editor, insert, { text: '!', type: insert.type });

    const commit = editor.read.lastCommit();

    assert.equal(editor.read.text.string([]), 'ab!');
    assert.equal(commit?.annotations[origin.key], 'prefix');
    assert.equal(commit?.tags.includes('test-prefix'), true);
    assert.equal(commit?.version, 1);
  });

  it('discards a prefix when downstream declines the command', () => {
    const decline = defineCommand<{ type: 'test.decline' }>({
      run: () => false,
      type: 'test.decline',
    });
    const editor = createTextEditor(
      decline.handle(({ state }, next) =>
        next.after(
          state.transaction((tx) => {
            tx.text.insert('x');
          })
        )
      )
    );
    let commits = 0;

    editor.subscribeCommit(() => commits++);

    assert.equal(
      dispatchCommand(editor, decline, { type: decline.type }),
      false
    );
    assert.equal(editor.read.text.string([]), 'ab');
    assert.equal(commits, 0);
  });

  it('publishes a prefix when downstream handles an empty transaction', () => {
    const consume = defineCommand<{ type: 'test.consume' }>({
      run: ({ state }) => state.transaction(() => {}),
      type: 'test.consume',
    });
    const editor = createTextEditor(
      consume.handle(({ state }, next) =>
        next.after(
          state.transaction((tx) => {
            tx.text.insert('x');
          })
        )
      )
    );

    assert.equal(
      dispatchCommand(editor, consume, { type: consume.type }),
      true
    );
    assert.equal(editor.read.text.string([]), 'axb');
    assert.equal(editor.read.lastCommit()?.version, 1);
  });

  it('composes nested prepared continuations in handler order', () => {
    const editor = createTextEditor(
      insert.handle(
        ({ state }, next) =>
          next.after(state.transaction((tx) => tx.text.insert('y'))),
        { priority: 1 }
      ),
      insert.handle(
        ({ state }, next) =>
          next.after(state.transaction((tx) => tx.text.insert('x'))),
        { priority: 2 }
      )
    );

    dispatchCommand(editor, insert, { text: 'z', type: insert.type });

    assert.equal(editor.read.text.string([]), 'axyzb');
    assert.equal(editor.read.lastCommit()?.version, 1);
  });

  it('discards prepared contexts after a downstream exception', () => {
    let active = true;
    const editor = createTextEditor(
      insert.handle(
        (_context, next) => {
          if (active) throw new Error('downstream failed');

          return next();
        },
        { priority: 1 }
      ),
      insert.handle(
        ({ state }, next) =>
          active
            ? next.after(state.transaction((tx) => tx.text.insert('x')))
            : next(),
        { priority: 2 }
      )
    );

    assert.throws(
      () =>
        dispatchCommand(editor, insert, {
          text: '!',
          type: insert.type,
        }),
      /downstream failed/
    );
    assert.equal(editor.read.text.string([]), 'ab');

    active = false;
    dispatchCommand(editor, insert, { text: '!', type: insert.type });

    assert.equal(editor.read.text.string([]), 'a!b');
  });

  it('rejects stale and cross-editor spec composition', () => {
    const editor = createTextEditor();
    const other = createTextEditor();
    const state = editor.read((current) => current);
    const spec = state.transaction((tx) => tx.text.insert('x'));

    assert.notEqual(spec, false);
    assert.throws(
      () =>
        other
          .read((current) => current)
          .transaction.extend(spec as TransactionSpec, () => {}),
      /different editor/
    );

    editor.update((tx) => tx.text.insert('y'));

    assert.throws(
      () => state.transaction.extend(spec as TransactionSpec, () => {}),
      /stale transaction spec/
    );
  });

  it('preserves runtime identity when a command spec splits a block', () => {
    const editor = createTextEditor();
    const blockRuntimeId = editor.read.runtime.idAt([0]);

    editor.update((tx) => tx.break.insert());

    assert.deepEqual(editor.read.children(), [
      { type: 'paragraph', children: [{ text: 'a' }] },
      { type: 'paragraph', children: [{ text: 'b' }] },
    ]);
    assert.deepEqual(editor.read.selection(), {
      kind: 'text',
      anchor: { offset: 0, path: [1, 0] },
      focus: { offset: 0, path: [1, 0] },
    });
    assert.equal(editor.read.runtime.idAt([0]), blockRuntimeId);
    assert.deepEqual(editor.read.runtime.pathOf(blockRuntimeId!), [0]);
    assert.notEqual(editor.read.runtime.idAt([1]), blockRuntimeId);
  });

  it('publishes one canonical wrap after transient move steps', () => {
    const selection = SelectionApi.text({
      anchor: { offset: 1, path: [0, 0] },
      focus: { offset: 1, path: [1, 0] },
    });
    const editor = createEditor({
      initialSelection: selection,
      initialValue: [
        { type: 'paragraph', children: [{ text: 'ab' }] },
        { type: 'paragraph', children: [{ text: 'cd' }] },
      ],
    });

    editor.read.runtime.snapshot();
    const firstId = editor.read.runtime.idAt([0]);
    const secondId = editor.read.runtime.idAt([1]);

    editor.update((tx) => {
      tx.nodes.wrap({ type: 'quote', children: [] }, { at: selection });
    });

    assert.deepEqual(editor.read.children(), [
      {
        type: 'quote',
        children: [
          { type: 'paragraph', children: [{ text: 'ab' }] },
          { type: 'paragraph', children: [{ text: 'cd' }] },
        ],
      },
    ]);
    assert.deepEqual(editor.read.selection(), {
      kind: 'text',
      anchor: { offset: 1, path: [0, 0, 0] },
      focus: { offset: 1, path: [0, 1, 0] },
    });
    assert.deepEqual(editor.read.runtime.pathOf(firstId!), [0, 0]);
    assert.deepEqual(editor.read.runtime.pathOf(secondId!), [0, 1]);
    assert.equal(editor.read.lastCommit()?.changes.empty, false);
  });

  it('keeps retained runtime identities and cuts explicit replacement identity', () => {
    const editor = createTextEditor();

    editor.read.runtime.snapshot();
    const blockId = editor.read.runtime.idAt([0]);
    const textId = editor.read.runtime.idAt([0, 0]);

    editor.update((tx) => {
      tx.nodes.replace(
        { type: 'paragraph', children: [{ text: 'replacement' }] },
        { at: [0] }
      );
    });

    const replacementId = editor.read.runtime.idAt([0]);
    const replacementCommit = editor.read.lastCommit();

    assert.notEqual(replacementId, blockId);
    assert.notEqual(editor.read.runtime.idAt([0, 0]), textId);
    assert.equal(editor.read.runtime.pathOf(blockId!), null);
    assert.equal(editor.read.runtime.pathOf(textId!), null);
    assert.equal(editor.read.runtime.snapshot().index.idAt([0]), replacementId);
    assert.equal(replacementCommit?.changed.has('root-order'), true);
    assert.equal(replacementCommit?.changed.has('structure'), true);
    assert.equal(
      replacementCommit?.changed.runtimeIds('path').includes(replacementId!),
      true
    );
    assert.deepEqual(replacementCommit?.changed.topLevelRanges(), [[0, 0]]);

    editor.update((tx) => tx.nodes.set({ role: 'note' }, { at: [0] }));

    assert.equal(editor.read.runtime.idAt([0]), replacementId);
  });

  it('publishes the canonical representation produced by a command spec', () => {
    const editor = createEditor({
      initialSelection: SelectionApi.text({
        anchor: { offset: 1, path: [0, 6] },
        focus: { offset: 1, path: [0, 6] },
      }),
      initialValue: [
        {
          type: 'paragraph',
          children: [
            { text: 'This is editable ' },
            { bold: true, text: 'rich' },
            { text: ' text, ' },
            { italic: true, text: 'much' },
            { text: ' better than a ' },
            { code: true, text: '<textarea>' },
            { text: '!' },
          ],
        },
      ],
    });

    for (let index = 0; index < 4; index++) {
      dispatchCommand(editor, deleteWordBackward, {
        type: deleteWordBackward.type,
      });
    }

    assert.deepEqual(editor.read.children()[0], {
      type: 'paragraph',
      children: [
        { text: 'This is editable ' },
        { bold: true, text: 'rich' },
        { text: ' text, ' },
        { italic: true, text: 'much' },
        { text: ' ' },
      ],
    });
    assert.deepEqual(editor.read.lastCommit()?.after.children[0], {
      type: 'paragraph',
      children: [
        { text: 'This is editable ' },
        { bold: true, text: 'rich' },
        { text: ' text, ' },
        { italic: true, text: 'much' },
        { text: ' ' },
      ],
    });
  });

  it('preserves an explicitly selected path when a spec inserts at that path', () => {
    const selection = SelectionApi.text({
      anchor: { offset: 0, path: [1, 0] },
      focus: { offset: 0, path: [1, 0] },
    });
    const editor = createEditor({
      initialSelection: selection,
      initialValue: [
        { type: 'paragraph', children: [{ text: 'before' }] },
        { type: 'paragraph', children: [{ text: 'after' }] },
      ],
    });
    const insertAtSelection = defineCommand<{ type: 'test.insert-block' }>({
      run: ({ state }) =>
        state.transaction((tx) => {
          tx.nodes.insert(
            { type: 'paragraph', children: [{ text: 'inserted' }] },
            { at: [1] }
          );
          tx.selection.set(selection);
        }),
      type: 'test.insert-block',
    });

    dispatchCommand(editor, insertAtSelection, {
      type: insertAtSelection.type,
    });

    assert.deepEqual(editor.read.children(), [
      { type: 'paragraph', children: [{ text: 'before' }] },
      { type: 'paragraph', children: [{ text: 'inserted' }] },
      { type: 'paragraph', children: [{ text: 'after' }] },
    ]);
    assert.deepEqual(editor.read.selection(), selection);
  });

  it('selects the remaining sibling after deleting a fully selected block', () => {
    const selection = SelectionApi.text({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 'alpha'.length, path: [0, 0] },
    });
    const editor = createEditor({
      initialSelection: selection,
      initialValue: [
        { type: 'paragraph', children: [{ text: 'alpha' }] },
        { type: 'paragraph', children: [{ text: 'beta' }] },
      ],
    });

    dispatchCommand(editor, editorCommands.deleteFragment, {
      at: selection,
      direction: 'forward',
      type: 'delete_fragment',
    });

    assert.deepEqual(editor.read.children(), [
      { type: 'paragraph', children: [{ text: 'beta' }] },
    ]);
    assert.deepEqual(
      editor.read.selection(),
      SelectionApi.text({
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      })
    );
  });

  it('uses the schema root default when text replaces a structural block', () => {
    const selection = SelectionApi.text({
      anchor: { offset: 0, path: [0, 0, 0] },
      focus: { offset: 'one'.length, path: [0, 0, 0] },
    });
    const editor = createEditor({
      extensions: [
        defineEditorSchema({
          elements: {
            'bulleted-list': element({
              content: schema.content.group('list-item', {
                default: { type: 'list-item' },
                min: 1,
              }),
              groups: ['block'],
            }),
            'list-item': element({
              content: schema.content.text({ default: 'text', min: 1 }),
              groups: ['list-item'],
            }),
            paragraph: element({
              content: schema.content.text({ default: 'text', min: 1 }),
              groups: ['block'],
            }),
          },
          groups: { 'list-item': schema.group() },
          id: 'test.structural-blocks',
          root: schema.root({
            content: schema.content.group('block', {
              default: { type: 'paragraph' },
              min: 1,
            }),
          }),
          version: 1,
        }),
      ],
      initialSelection: selection,
      initialValue: [
        {
          type: 'bulleted-list',
          children: [{ type: 'list-item', children: [{ text: 'one' }] }],
        },
      ],
    });

    dispatchCommand(editor, editorCommands.insertText, {
      options: { at: selection },
      text: 'Z',
      type: 'insert_text',
    });

    assert.deepEqual(editor.read.children(), [
      { type: 'paragraph', children: [{ text: 'Z' }] },
    ]);
    assert.deepEqual(
      editor.read.selection(),
      SelectionApi.text({
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      })
    );
  });

  it('roots explicit paths in command specs to the dispatching view', () => {
    const insertBlock = defineCommand<{ type: 'test.insert-root-block' }>({
      run: ({ state }) =>
        state.transaction((tx) => {
          tx.nodes.insert(
            { type: 'paragraph', children: [{ text: 'second' }] },
            { at: [1] }
          );
        }),
      type: 'test.insert-root-block',
    });
    const runtime = createEditorRuntime({
      initialValue: {
        children: [{ type: 'paragraph', children: [{ text: 'main' }] }],
        roots: {
          header: [{ type: 'paragraph', children: [{ text: 'first' }] }],
        },
      },
    });
    const header = createEditorView(runtime, { root: 'header' });

    dispatchCommand(header, insertBlock, { type: insertBlock.type });

    assert.deepEqual(
      runtime.read((state) => state.value()),
      {
        children: [{ type: 'paragraph', children: [{ text: 'main' }] }],
        roots: {
          header: [
            { type: 'paragraph', children: [{ text: 'first' }] },
            { type: 'paragraph', children: [{ text: 'second' }] },
          ],
        },
      }
    );
  });
});
