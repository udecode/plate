import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import fc from 'fast-check';

import {
  ContentSlice,
  createEditor,
  createEditorRuntime,
  createEditorView,
  defineCommand,
  defineEditorExtension,
  defineEditorSchema,
  defineUpdateAnnotation,
  editorCommands,
  type Editor,
  type EditorCommand,
  type EditorExtension,
  type EditorTransactionDraftRef,
  type Point,
  SelectionApi,
  schema,
  type TransactionSpec,
  type Value,
} from '@platejs/plite';
import { dispatchCommand } from '@platejs/plite/internal';
import { createCommandRegistration } from '../src/core/command-definition';
import { registerCommandInRegistry } from '../src/core/command-registry';
import {
  createExtensionRegistry,
  finalizeExtensionRegistry,
  initializeBaseExtensionRegistry,
  validateConfiguredExtensionRegistry,
} from '../src/core/extension-registry';
import { defineTestSchema } from './support/schema';

type InsertCommand = {
  text: string;
};

const createTextEditorWithExtensions = (
  extensions: readonly EditorExtension<any, any>[] = []
) =>
  createEditor({
    extensions,
    initialSelection: SelectionApi.text({
      anchor: { offset: 1, path: [0, 0] },
      focus: { offset: 1, path: [0, 0] },
    }),
    initialValue: [{ type: 'paragraph', children: [{ text: 'ab' }] }] as Value,
  });

type CommandDeclarations = NonNullable<EditorExtension['commands']>;

const createTextEditor = (commands?: CommandDeclarations) =>
  createTextEditorWithExtensions(
    commands ? [defineEditorExtension({ commands, name: 'test.commands' })] : []
  );

const commandExtension = (
  name: string,
  priority: number,
  commands: CommandDeclarations
) => defineEditorExtension({ commands, name, priority });

const insert = defineCommand<InsertCommand>('test.insert', {
  build: ({ input, state }) =>
    state.transaction((tx) => {
      tx.text.insert(input.text);
    }),
});

const deleteWordBackward = defineCommand('test.delete-word-backward', {
  build: ({ state }) =>
    state.transaction((tx) => {
      tx.text.delete({ reverse: true, unit: 'word' });
    }),
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
    const spec = editor.read((state) => insert.build(state, { text: '!' }));

    assert.notEqual(spec, false);
    if (spec === false) throw new Error('Expected a transaction spec.');

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

  it('rejects copied descriptors and structurally forged specs', () => {
    const editor = createTextEditor();
    const copied = { ...insert };
    const forged = {
      annotations: [],
      changes: editor.read((state) => state.transaction(() => {})).changes,
      effects: [],
      kind: 'transaction',
      tags: [],
    } as unknown as TransactionSpec;
    const forgedCommand = defineCommand('test.forged-spec', {
      build: () => forged,
    });

    assert.throws(
      () => dispatchCommand(editor, copied, { text: '!' }),
      /must be created with defineCommand/
    );
    assert.throws(
      () => dispatchCommand(editor, forgedCommand),
      /must return false or a transaction spec/
    );
    assert.equal(editor.read.text.string([]), 'ab');
  });

  it('prepares once through fallback and again only for explicit rewrites', () => {
    let prepares = 0;
    const command = defineCommand<{ value: number }>('test.prepare-count', {
      build: () => false,
      prepare(input) {
        prepares++;

        return Object.freeze({ ...input });
      },
    });
    const editor = createTextEditor(({ handle }) =>
      Array.from({ length: 32 }, () => handle(command, () => false))
    );

    assert.equal(dispatchCommand(editor, command, { value: 1 }), false);
    assert.equal(prepares, 1);

    const rewritingEditor = createTextEditor(({ around }) => [
      around(command, ({ input, next }) => next({ value: input.value + 1 })),
      around(command, ({ input, next }) => next({ value: input.value + 1 })),
    ]);

    prepares = 0;
    assert.equal(
      dispatchCommand(rewritingEditor, command, { value: 1 }),
      false
    );
    assert.equal(prepares, 3);
  });

  it('matches a reference model for mixed command chains from 0 through 32 handlers', () => {
    type Action =
      | 'around-false'
      | 'around-next'
      | 'around-rewrite'
      | 'around-spec'
      | 'around-throw'
      | 'handle-false'
      | 'handle-spec'
      | 'handle-throw';
    type Terminal = 'false' | 'spec' | 'throw';
    type Input = { value: number };
    const actionArbitrary = fc.constantFrom<Action>(
      'around-false',
      'around-next',
      'around-rewrite',
      'around-spec',
      'around-throw',
      'handle-false',
      'handle-spec',
      'handle-throw'
    );

    fc.assert(
      fc.property(
        fc.array(actionArbitrary, { maxLength: 32 }),
        fc.constantFrom<Terminal>('false', 'spec', 'throw'),
        (actions, terminal) => {
          const expectedTrace: string[] = [];
          const actualTrace: string[] = [];
          const prepare = (trace: string[], input: Input) => {
            trace.push(`prepare:${input.value}`);

            return { value: input.value + 1 };
          };
          const evaluate = (
            index: number,
            input: Input,
            prepared = false
          ): boolean => {
            const nextInput = prepared ? input : prepare(expectedTrace, input);
            const action = actions[index];

            if (!action) {
              expectedTrace.push(`default:${nextInput.value}`);
              if (terminal === 'throw') throw new Error('default');

              return terminal === 'spec';
            }

            expectedTrace.push(`${index}:${action}:${nextInput.value}`);
            if (action.endsWith('throw')) throw new Error(`action-${index}`);
            if (action.endsWith('spec')) return true;
            if (action === 'around-next') {
              return evaluate(index + 1, nextInput, true);
            }
            if (action === 'around-rewrite') {
              return evaluate(
                index + 1,
                { value: nextInput.value + index + 1 },
                false
              );
            }

            return evaluate(index + 1, nextInput, true);
          };
          const command = defineCommand<Input>('test.generated-chain', {
            build: ({ input, state }) => {
              actualTrace.push(`default:${input.value}`);
              if (terminal === 'throw') throw new Error('default');

              return terminal === 'spec' ? state.transaction(() => {}) : false;
            },
            prepare: (input) => prepare(actualTrace, input),
          });
          const editor = createTextEditor(({ around, handle }) =>
            actions.map((action, index) => {
              const record = (value: number) =>
                actualTrace.push(`${index}:${action}:${value}`);

              if (action.startsWith('handle')) {
                return handle(command, ({ input, state }) => {
                  record(input.value);
                  if (action === 'handle-throw') {
                    throw new Error(`action-${index}`);
                  }

                  return action === 'handle-spec'
                    ? state.transaction(() => {})
                    : false;
                });
              }

              return around(command, ({ input, next, state }) => {
                record(input.value);
                if (action === 'around-throw') {
                  throw new Error(`action-${index}`);
                }
                if (action === 'around-spec') {
                  return state.transaction(() => {});
                }
                if (action === 'around-next') return next();
                if (action === 'around-rewrite') {
                  return next({ value: input.value + index + 1 });
                }

                return false;
              });
            })
          );
          const run = (fn: () => boolean) => {
            try {
              return { result: fn() };
            } catch (error) {
              return {
                error: error instanceof Error ? error.message : String(error),
              };
            }
          };
          const expected = run(() => evaluate(0, { value: 0 }));
          const actual = run(() =>
            dispatchCommand(editor, command, { value: 0 })
          );

          assert.deepEqual(actual, expected);
          assert.deepEqual(actualTrace, expectedTrace);
        }
      ),
      { numRuns: 128, seed: 0x50_4c_49_54 }
    );
  });

  it('maps every semantic one-shot helper to exactly one command', () => {
    const seen: string[] = [];
    const editor = createTextEditor(({ handle }) => {
      const intercept = <Input>(command: EditorCommand<Input>) =>
        handle(command, ({ state }) => {
          seen.push(command.id);

          return state.transaction(() => {});
        });

      return [
        intercept(editorCommands.addMark),
        intercept(editorCommands.collapse),
        intercept(editorCommands.delete),
        intercept(editorCommands.deleteFragment),
        intercept(editorCommands.insertBreak),
        intercept(editorCommands.insertNodes),
        intercept(editorCommands.insertSoftBreak),
        intercept(editorCommands.insertText),
        intercept(editorCommands.move),
        intercept(editorCommands.removeMark),
        intercept(editorCommands.removeNodes),
        intercept(editorCommands.replaceSlice),
        intercept(editorCommands.select),
        intercept(editorCommands.setNodes),
        intercept(editorCommands.setSelection),
        intercept(editorCommands.toggleBlock),
        intercept(editorCommands.toggleMark),
      ];
    });
    const point = { offset: 1, path: [0, 0] };
    const selection = SelectionApi.text({ anchor: point, focus: point });
    const rows: ReadonlyArray<readonly [string, () => unknown]> = [
      [editorCommands.toggleBlock.id, () => editor.update.blocks.toggle('p')],
      [editorCommands.insertBreak.id, () => editor.update.break.insert()],
      [
        editorCommands.insertSoftBreak.id,
        () => editor.update.break.insertSoft(),
      ],
      [editorCommands.deleteFragment.id, () => editor.update.fragment.delete()],
      [
        editorCommands.replaceSlice.id,
        () => editor.update.fragment.replace([{ text: 'x' }]),
      ],
      [editorCommands.addMark.id, () => editor.update.marks.add('bold', true)],
      [editorCommands.removeMark.id, () => editor.update.marks.remove('bold')],
      [
        editorCommands.toggleMark.id,
        () => editor.update.marks.toggle('bold', true),
      ],
      [
        editorCommands.insertNodes.id,
        () => editor.update.nodes.insert({ text: 'x' }),
      ],
      [editorCommands.removeNodes.id, () => editor.update.nodes.remove()],
      [
        editorCommands.setNodes.id,
        () => editor.update.nodes.set({ bold: true }),
      ],
      [editorCommands.collapse.id, () => editor.update.selection.collapse()],
      [editorCommands.move.id, () => editor.update.selection.move()],
      [editorCommands.select.id, () => editor.update.selection.set(selection)],
      [
        editorCommands.setSelection.id,
        () => editor.update.selection.setRange({ anchor: point }),
      ],
      [
        editorCommands.replaceSlice.id,
        () => editor.update.slice.replace(ContentSlice.closed([{ text: 'x' }])),
      ],
      [editorCommands.delete.id, () => editor.update.text.deleteBackward()],
      [editorCommands.delete.id, () => editor.update.text.deleteForward()],
      [editorCommands.insertText.id, () => editor.update.text.insert('x')],
    ];

    for (const [expectedId, invoke] of rows) {
      const before = seen.length;

      invoke();
      assert.deepEqual(seen.slice(before), [expectedId]);
    }

    assert.equal(rows.length, 19);
  });

  it('rejects self and mutual command recursion by descriptor identity', () => {
    const self = defineCommand('test.recursion.self');
    const left = defineCommand('test.recursion.left');
    const right = defineCommand('test.recursion.right');
    let selfEditor!: ReturnType<typeof createTextEditor>;
    let mutualEditor!: ReturnType<typeof createTextEditor>;

    selfEditor = createTextEditor(({ handle }) => [
      handle(self, () => {
        dispatchCommand(selfEditor, self);

        return false;
      }),
    ]);
    mutualEditor = createTextEditor(({ handle }) => [
      handle(left, () => {
        dispatchCommand(mutualEditor, right);

        return false;
      }),
      handle(right, () => {
        dispatchCommand(mutualEditor, left);

        return false;
      }),
    ]);

    assert.throws(
      () => dispatchCommand(selfEditor, self),
      /test.recursion.self -> test.recursion.self/
    );
    assert.throws(
      () => dispatchCommand(mutualEditor, left),
      /test.recursion.left -> test.recursion.right -> test.recursion.left/
    );
  });

  it('tags only handled commands and reduces nested dispatches to one tag', () => {
    const declined = defineCommand('test.declined');
    const editor = createTextEditor();

    editor.update((tx) => {
      assert.equal(tx.command(declined), false);
      tx.text.insert('x');
    });
    assert.equal(
      editor.read.lastCommit()?.tags.includes('semantic-command'),
      false
    );

    editor.update((tx) => {
      tx.command(insert, { text: 'y' });
      tx.command(insert, { text: 'z' });
    });

    assert.equal(
      editor.read.lastCommit()?.tags.filter((tag) => tag === 'semantic-command')
        .length,
      1
    );
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
    const editor = createTextEditor(({ around }) => [
      around(editorCommands.insertText, ({ input, next }) => {
        seen.push(input.text);

        return next({ ...input, text: input.text.toUpperCase() });
      }),
    ]);

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
    });

    assert.equal(editor.read.text.string([]), 'IS');
    assert.deepEqual(editor.read.selection(), {
      kind: 'text',
      anchor: { offset: 1, path: [0, 0] },
      focus: { offset: 1, path: [0, 0] },
    });
    assert.equal(commits, 1);
  });

  it('replaces an explicit multi-leaf text target in document order', () => {
    const selection = SelectionApi.text({
      anchor: { offset: 'This is '.length, path: [0, 0] },
      focus: { offset: ' text'.length, path: [0, 2] },
    });
    const editor = createEditor({
      initialSelection: selection,
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

    dispatchCommand(editor, editorCommands.insertText, {
      options: {
        at: selection,
      },
      text: 'example',
    });

    assert.equal(
      editor.read.text.string([]),
      'This is example, much better than a <textarea>!'
    );
    assert.deepEqual(editor.read.children()[0], {
      type: 'paragraph',
      children: [
        { text: 'This is example, ' },
        { italic: true, text: 'much' },
        { text: ' better than a ' },
        { code: true, text: '<textarea>' },
        { text: '!' },
      ],
    });
    assert.deepEqual(
      editor.read.selection(),
      SelectionApi.text({
        anchor: { offset: 'This is example'.length, path: [0, 0] },
        focus: { offset: 'This is example'.length, path: [0, 0] },
      })
    );
  });

  it('dispatches collapse and block toggle as pure semantic commands', () => {
    const seen: string[] = [];
    const editor = createEditor({
      extensions: [
        defineEditorExtension({
          commands: ({ handle }) => [
            handle(editorCommands.collapse, () => {
              seen.push(editorCommands.collapse.id);

              return false;
            }),
            handle(editorCommands.toggleBlock, () => {
              seen.push(editorCommands.toggleBlock.id);

              return false;
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
    });

    dispatchCommand(editor, editorCommands.select, {
      target: SelectionApi.text({
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      }),
    });
    dispatchCommand(editor, editorCommands.collapse, {
      options: { edge: 'start' },
    });

    assert.deepEqual(seen, ['block.toggle', 'selection.collapse']);
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
    });
    dispatchCommand(editor, editorCommands.toggleMark, {
      key: 'superscript',
      options: { clear: 'subscript' },
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
    let builds = 0;
    let prepares = 0;
    const blocked = defineCommand<InsertCommand>('test.read-only', {
      build: ({ input, state }) => {
        builds++;

        return state.transaction((tx) => {
          tx.text.insert(input.text);
        });
      },
      prepare: (input) => {
        prepares++;

        return input;
      },
    });

    assert.throws(() => {
      runtime.update(() => {
        readOnlyHeader.update.command(insert, {
          text: 'blocked',
        });
      });
    }, /read.only/i);
    assert.throws(
      () => dispatchCommand(readOnlyHeader, blocked, { text: 'blocked' }),
      /read.only/i
    );
    assert.equal(prepares, 0);
    assert.equal(builds, 0);
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
    const insertBeforeTarget = defineCommand('test.insert-before-target', {
      build: ({ state }) =>
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
    });
    const editor = createTextEditor();

    dispatchCommand(editor, insertBeforeTarget);

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
    const editor = createTextEditorWithExtensions([
      defineEditorExtension({
        commands: ({ around }) => [
          around(insert, ({ input, next }) => {
            seen.push(`low:${input.text}`);
            return next({ ...input, text: input.text.toUpperCase() });
          }),
        ],
        name: 'low-command-priority',
        priority: 1,
      }),
      defineEditorExtension({
        commands: ({ around }) => [
          around(insert, ({ input, next }) => {
            seen.push(`high:${input.text}`);
            return next({ ...input, text: `${input.text}!` });
          }),
        ],
        name: 'high-command-priority',
        priority: 2,
      }),
    ]);

    dispatchCommand(editor, insert, { text: 'z' });

    assert.deepEqual(seen, ['high:z', 'low:z!']);
    assert.equal(editor.read.text.string([]), 'aZ!b');
  });

  it('keeps dependency-resolved command order ahead of conflicting priority', () => {
    const seen: string[] = [];
    const dependency = defineEditorExtension({
      commands: ({ around }) => [
        around(insert, ({ input, next }) => {
          seen.push(`dependency:${input.text}`);
          return next({ ...input, text: input.text.toUpperCase() });
        }),
      ],
      name: 'command-order-dependency',
      priority: 1,
    });
    const dependent = defineEditorExtension({
      commands: ({ around }) => [
        around(insert, ({ input, next }) => {
          seen.push(`dependent:${input.text}`);
          return next({ ...input, text: `${input.text}!` });
        }),
      ],
      dependencies: [dependency.name],
      name: 'command-order-dependent',
      priority: 100,
    });
    const editor = createTextEditorWithExtensions([dependent, dependency]);

    dispatchCommand(editor, insert, { text: 'z' });

    assert.deepEqual(seen, ['dependency:z', 'dependent:Z']);
    assert.equal(editor.read.text.string([]), 'aZ!b');
  });

  it('keeps configured command policy ahead of built-in fallback policy', () => {
    const calls: string[] = [];
    const editor = {} as Editor;
    const base = createExtensionRegistry();
    const configured = createExtensionRegistry({ configurationRevision: 1 });

    registerCommandInRegistry(
      base.commands,
      createCommandRegistration(insert, 'handle', () => {
        calls.push('base');
        return false as const;
      })
    );
    registerCommandInRegistry(
      configured.commands,
      createCommandRegistration(insert, 'handle', () => {
        calls.push('configured');
        return false as const;
      })
    );
    initializeBaseExtensionRegistry(editor, finalizeExtensionRegistry(base));

    const registry = validateConfiguredExtensionRegistry(
      editor,
      finalizeExtensionRegistry(configured)
    );
    const entries = registry.commands.byDescriptor.get(insert)?.entries as
      | readonly Readonly<{ run: () => false }>[]
      | undefined;

    for (const entry of entries ?? []) entry.run();

    assert.deepEqual(calls, ['configured', 'base']);
  });

  it('rejects multiple delegations from one handler', () => {
    const editor = createTextEditor(({ around }) => [
      around(insert, ({ next }) => {
        next();

        return next();
      }),
    ]);

    assert.throws(
      () => dispatchCommand(editor, insert, { text: 'x' }),
      /may delegate only once/
    );
    assert.equal(editor.read.text.string([]), 'ab');
  });

  it('rejects a handler that discards its delegated result', () => {
    const editor = createTextEditor(({ around }) => [
      around(insert, ({ next, state }) => {
        next();

        return state.transaction((tx) => tx.text.insert('y'));
      }),
    ]);

    assert.throws(
      () => dispatchCommand(editor, insert, { text: 'x' }),
      /must return their delegated result/
    );
    assert.equal(editor.read.text.string([]), 'ab');
  });

  it('extends a delegated spec on the same isolated draft', () => {
    const editor = createTextEditor(({ around }) => [
      around(insert, ({ next, state }) => {
        const delegated = next();

        if (!delegated) return false;

        return state.transaction.extend(delegated, (tx) => {
          tx.text.insert('?');
        });
      }),
    ]);

    dispatchCommand(editor, insert, { text: 'x' });

    assert.equal(editor.read.text.string([]), 'ax?b');
    assert.equal(editor.read.lastCommit()?.version, 1);
  });

  it('runs downstream handlers against the prefix state', () => {
    const observed: string[] = [];
    const editor = createTextEditorWithExtensions([
      commandExtension('prefix-observer', 1, ({ handle }) => [
        handle(insert, ({ state }) => {
          observed.push(state.text.string([]));

          return false;
        }),
      ]),
      commandExtension('prefix-writer', 2, ({ around }) => [
        around(insert, ({ state, next }) =>
          next.after(
            state.transaction((tx) => {
              tx.text.insert('x');
            })
          )
        ),
      ]),
    ]);

    dispatchCommand(editor, insert, { text: '!' });

    assert.deepEqual(observed, ['axb']);
    assert.equal(editor.read.text.string([]), 'ax!b');
    assert.equal(editor.read.lastCommit()?.version, 1);
  });

  it('combines prefix metadata and selection into the delegated commit', () => {
    const origin = defineUpdateAnnotation<string>({ key: 'test.origin' });
    const editor = createTextEditor(({ around }) => [
      around(insert, ({ state, next }) =>
        next.after(
          state.transaction((tx) => {
            tx.annotations.set(origin, 'prefix');
            tx.selection.move({ distance: 1 });
            tx.tags.add('test-prefix');
          })
        )
      ),
    ]);

    dispatchCommand(editor, insert, { text: '!' });

    const commit = editor.read.lastCommit();

    assert.equal(editor.read.text.string([]), 'ab!');
    assert.equal(commit?.annotations[origin.key], 'prefix');
    assert.equal(commit?.tags.includes('test-prefix'), true);
    assert.equal(commit?.version, 1);
  });

  it('discards a prefix when downstream declines the command', () => {
    const decline = defineCommand('test.decline', {
      build: () => false,
    });
    const editor = createTextEditor(({ around }) => [
      around(decline, ({ state, next }) =>
        next.after(
          state.transaction((tx) => {
            tx.text.insert('x');
          })
        )
      ),
    ]);
    let commits = 0;

    editor.subscribeCommit(() => commits++);

    assert.equal(dispatchCommand(editor, decline), false);
    assert.equal(editor.read.text.string([]), 'ab');
    assert.equal(commits, 0);
  });

  it('publishes a prefix when downstream handles an empty transaction', () => {
    const consume = defineCommand('test.consume', {
      build: ({ state }) => state.transaction(() => {}),
    });
    const editor = createTextEditor(({ around }) => [
      around(consume, ({ state, next }) =>
        next.after(
          state.transaction((tx) => {
            tx.text.insert('x');
          })
        )
      ),
    ]);

    assert.equal(dispatchCommand(editor, consume), true);
    assert.equal(editor.read.text.string([]), 'axb');
    assert.equal(editor.read.lastCommit()?.version, 1);
  });

  it('composes nested prepared continuations in handler order', () => {
    const editor = createTextEditorWithExtensions([
      commandExtension('nested-prefix-low', 1, ({ around }) => [
        around(insert, ({ state, next }) =>
          next.after(state.transaction((tx) => tx.text.insert('y')))
        ),
      ]),
      commandExtension('nested-prefix-high', 2, ({ around }) => [
        around(insert, ({ state, next }) =>
          next.after(state.transaction((tx) => tx.text.insert('x')))
        ),
      ]),
    ]);

    dispatchCommand(editor, insert, { text: 'z' });

    assert.equal(editor.read.text.string([]), 'axyzb');
    assert.equal(editor.read.lastCommit()?.version, 1);
  });

  it('discards prepared contexts after a downstream exception', () => {
    let active = true;
    const editor = createTextEditorWithExtensions([
      commandExtension('throwing-handler', 1, ({ handle }) => [
        handle(insert, () => {
          if (active) throw new Error('downstream failed');

          return false;
        }),
      ]),
      commandExtension('throwing-prefix', 2, ({ around }) => [
        around(insert, ({ state, next }) =>
          active
            ? next.after(state.transaction((tx) => tx.text.insert('x')))
            : next()
        ),
      ]),
    ]);

    assert.throws(
      () =>
        dispatchCommand(editor, insert, {
          text: '!',
        }),
      /downstream failed/
    );
    assert.equal(editor.read.text.string([]), 'ab');

    active = false;
    dispatchCommand(editor, insert, { text: '!' });

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

  it('keeps split runtime identities injective while extending a delegated spec', () => {
    const editor = createEditor({
      extensions: [
        defineEditorExtension({
          commands: ({ around }) => [
            around(editorCommands.insertBreak, ({ next, state }) => {
              const delegated = next();

              if (delegated === false) return false;

              return state.transaction.extend(delegated, (tx) => {
                tx.nodes.set({ type: 'quote' }, { at: [0] });
              });
            }),
          ],
          name: 'test.extend-split-command',
        }),
      ],
      initialSelection: SelectionApi.text({
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      }),
      initialValue: [
        { type: 'paragraph', children: [{ text: 'ab' }] },
      ] as Value,
    });
    const blockRuntimeId = editor.read.runtime.idAt([0]);

    assert.equal(dispatchCommand(editor, editorCommands.insertBreak), true);
    assert.deepEqual(editor.read.children(), [
      { type: 'quote', children: [{ text: '' }] },
      { type: 'paragraph', children: [{ text: 'ab' }] },
    ]);
    assert.equal(editor.read.runtime.idAt([1]), blockRuntimeId);
    assert.notEqual(editor.read.runtime.idAt([0]), blockRuntimeId);
    assert.deepEqual(editor.read.runtime.pathOf(blockRuntimeId!), [1]);
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
      dispatchCommand(editor, deleteWordBackward);
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
    const insertAtSelection = defineCommand('test.insert-block', {
      build: ({ state }) =>
        state.transaction((tx) => {
          tx.nodes.insert(
            { type: 'paragraph', children: [{ text: 'inserted' }] },
            { at: [1] }
          );
          tx.selection.set(selection);
        }),
    });

    dispatchCommand(editor, insertAtSelection);

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

  it('uses the schema root default after deleting every selected block', () => {
    const selection = SelectionApi.text({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 'heading'.length, path: [0, 0] },
    });
    const editor = createEditor({
      extensions: [
        defineEditorSchema({
          elements: {
            heading: {
              content: schema.content.text({ default: 'text', min: 1 }),
            } as const,
            paragraph: {
              content: schema.content.text({ default: 'text', min: 1 }),
            } as const,
          },
          identity: 'derived',
          root: {
            content: schema.content.types(['heading', 'paragraph'], {
              default: { type: 'paragraph' },
              min: 1,
            }),
          } as const,
          unknown: 'reject',
        }),
      ],
      initialSelection: selection,
      initialValue: [{ type: 'heading', children: [{ text: 'heading' }] }],
    });

    dispatchCommand(editor, editorCommands.deleteFragment, {
      at: selection,
      direction: 'forward',
    });

    assert.deepEqual(editor.read.children(), [
      { type: 'paragraph', children: [{ text: '' }] },
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
            'bulleted-list': {
              content: schema.content.group('list-item', {
                default: { type: 'list-item' },
                min: 1,
              }),
            } as const,
            'list-item': {
              content: schema.content.text({ default: 'text', min: 1 }),
              groups: ['list-item'],
            } as const,
            paragraph: {
              content: schema.content.text({ default: 'text', min: 1 }),
            } as const,
          },
          groups: { 'list-item': {} as const },
          id: 'test.structural-blocks',
          root: {
            content: schema.content.group('block', {
              default: { type: 'paragraph' },
              min: 1,
            }),
          } as const,
          unknown: 'reject',
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
    const insertBlock = defineCommand('test.insert-root-block', {
      build: ({ state }) =>
        state.transaction((tx) => {
          tx.nodes.insert(
            { type: 'paragraph', children: [{ text: 'second' }] },
            { at: [1] }
          );
        }),
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

    dispatchCommand(header, insertBlock);

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
