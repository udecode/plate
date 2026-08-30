import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import fc from 'fast-check';
import {
  ContentSlice,
  createEditor,
  createEditorView,
  defineCommand,
  defineExtension,
  defineEditorSchema,
  defineUpdateAnnotation,
  editorCommands,
  type Editor,
  type EditorCommand,
  type EditorExtensionDefinitionInput,
  type EditorExtensionReference,
  type EditorTransactionAnchor,
  type Point,
  property,
  type Range,
  SelectionApi,
  schema,
  type TransactionSpec,
  type Value,
} from 'plitejs';

import { createCommandRegistration } from '../src/core/command-definition';
import { registerCommandInRegistry } from '../src/core/command-registry';
import {
  createExtensionRegistry,
  finalizeExtensionRegistry,
  initializeBaseExtensionRegistry,
  validateConfiguredExtensionRegistry,
} from '../src/core/extension-registry';
import {
  dispatchCommand,
  evaluateCommand,
  getEditorLiveSelection,
  probeCommandNativeEquivalent,
} from '../src/internal';
import { defineTestSchema } from './support/schema';

type InsertCommand = {
  text: string;
};

const publicRange = ({ anchor, focus }: Range): Range => ({ anchor, focus });

const createTextEditorWithExtensions = (
  extensions: readonly EditorExtensionReference[] = []
): Editor<Value> =>
  createEditor({
    extensions,
    initialSelection: SelectionApi.text({
      anchor: { offset: 1, path: [0, 0] },
      focus: { offset: 1, path: [0, 0] },
    }),
    initialValue: [{ type: 'paragraph', children: [{ text: 'ab' }] }] as Value,
  });

type CommandDeclarations = NonNullable<
  EditorExtensionDefinitionInput['commands']
>;

const createTextEditor = (commands?: CommandDeclarations) =>
  createTextEditorWithExtensions(
    commands ? [defineExtension('test.commands', { commands })] : []
  );

const commandExtension = (name: string, commands: CommandDeclarations) =>
  defineExtension(name, { commands });

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

const CommandScriptPosition = schema.property.exclusive(
  'plate:script-position'
);
const CommandScriptSchema = defineEditorSchema('schema:command-script-schema', {
  elements: {
    paragraph: { content: schema.content.text() },
  },
  id: 'command-script-schema',
  properties: [
    schema.textProperty('subscript', property.boolean(), {
      exclusive: [CommandScriptPosition],
    }),
    schema.textProperty('superscript', property.boolean(), {
      exclusive: [CommandScriptPosition],
    }),
  ],
  root: schema.content.type('paragraph'),
  unknown: 'reject',
  version: 1,
});

describe('pure command transaction specs', () => {
  it('keeps pass-through command registration native-equivalent', () => {
    const plain = createTextEditor();
    const handled = createTextEditor(({ handle }) => [
      handle(editorCommands.insertText, () => false),
    ]);
    const wrapped = createTextEditor(({ around }) => [
      around(editorCommands.insertText, ({ next }) => next()),
    ]);
    const forwarded = createTextEditor(({ around }) => [
      around(editorCommands.insertText, ({ input, next }) => next(input)),
    ]);

    for (const editor of [plain, handled, wrapped, forwarded]) {
      const evaluation = evaluateCommand(editor, editorCommands.insertText, {
        text: 'x',
      });

      assert.equal(evaluation.result === false, false);
      assert.equal(evaluation.nativeEquivalent, true);
      assert.deepEqual(evaluation.materialHandlers, []);
      assert.equal(editor.read.text.string([]), 'ab');
    }
  });

  it('keeps cached command state reads live across committed changes', () => {
    const observed: Array<{
      selectionOffset: number | undefined;
      text: string;
      version: number;
    }> = [];
    const editor = createTextEditor(({ around }) => [
      around(editorCommands.insertText, ({ next, state }) => {
        const selection = state.selection();

        observed.push({
          selectionOffset: selection?.anchor.offset,
          text: state.text.string([]),
          version: state.runtime.snapshot().version,
        });

        return next();
      }),
    ]);

    assert.equal(
      probeCommandNativeEquivalent(editor, editorCommands.insertText, {
        text: 'x',
      }).nativeEquivalent,
      true
    );

    editor.update((tx) => {
      tx.text.insert('x', { at: { offset: 1, path: [0, 0] } });
      tx.selection.set({ offset: 2, path: [0, 0] });
    });

    assert.equal(
      probeCommandNativeEquivalent(editor, editorCommands.insertText, {
        text: 'y',
      }).nativeEquivalent,
      true
    );
    assert.deepEqual(observed, [
      { selectionOffset: 1, text: 'ab', version: 0 },
      { selectionOffset: 2, text: 'axb', version: 1 },
    ]);
  });

  it('keeps cached command state scoped to the dispatching editor view', () => {
    const observed: string[] = [];
    const runtime = createEditor({
      extensions: [
        defineExtension('test.view-command-state', {
          commands: ({ around }) => [
            around(editorCommands.insertText, ({ next, state }) => {
              observed.push(state.text.string([]));

              return next();
            }),
          ],
        }),
      ],
      initialValue: {
        children: [{ type: 'paragraph', children: [{ text: 'main' }] }],
        roots: {
          header: [{ type: 'paragraph', children: [{ text: 'head' }] }],
        },
      },
    });
    const header = createEditorView(runtime, { root: 'header' });

    assert.equal(
      probeCommandNativeEquivalent(runtime, editorCommands.insertText, {
        text: 'x',
      }).nativeEquivalent,
      true
    );
    assert.equal(
      probeCommandNativeEquivalent(header, editorCommands.insertText, {
        text: 'y',
      }).nativeEquivalent,
      true
    );
    assert.deepEqual(observed, ['main', 'head']);
  });

  it('marks material and rewritten command results model-owned', () => {
    const handled = createTextEditor(({ handle }) => [
      handle(editorCommands.insertText, ({ state }) =>
        state.transaction((tx) => {
          tx.text.insert('handled');
        })
      ),
    ]);
    const rewritten = createTextEditor(({ around }) => [
      around(editorCommands.insertText, ({ next }) => next({ text: 'y' })),
    ]);
    const prefixed = createTextEditor(({ around }) => [
      around(editorCommands.insertText, ({ next, state }) =>
        next.after(
          state.transaction((tx) => {
            tx.tags.add('prefix');
          })
        )
      ),
    ]);

    for (const [editor, owner] of [
      [handled, 'test.commands'],
      [rewritten, 'test.commands'],
      [prefixed, 'test.commands'],
    ] as const) {
      const evaluation = evaluateCommand(editor, editorCommands.insertText, {
        text: 'x',
      });

      assert.equal(evaluation.result === false, false);
      assert.equal(evaluation.nativeEquivalent, false);
      assert.deepEqual(evaluation.materialHandlers, [owner]);
      assert.equal(editor.read.text.string([]), 'ab');
    }
  });

  it('probes pass-through handlers against the real default without publishing', () => {
    const passThrough = createTextEditor(({ around, handle }) => [
      around(editorCommands.insertText, ({ next }) => next()),
      handle(editorCommands.insertText, () => false),
    ]);
    const consumesDefault = createTextEditor(({ around }) => [
      around(editorCommands.insertText, ({ next, state }) => {
        const result = next();

        if (result === false) return false;

        return state.transaction.extend(result, () => {});
      }),
    ]);

    assert.deepEqual(
      probeCommandNativeEquivalent(passThrough, editorCommands.insertText, {
        text: 'x',
      }),
      { materialHandlers: [], nativeEquivalent: true }
    );
    assert.deepEqual(
      probeCommandNativeEquivalent(consumesDefault, editorCommands.insertText, {
        text: 'x',
      }),
      {
        materialHandlers: ['test.commands'],
        nativeEquivalent: false,
      }
    );
    assert.equal(passThrough.read.text.string([]), 'ab');
    assert.equal(consumesDefault.read.text.string([]), 'ab');
  });

  it('rejects native equivalence when an unhandled default command rejects', () => {
    const reject = defineCommand<{ text: string }>('test.reject-native', {
      build: () => false,
    });
    const editor = createTextEditor();

    assert.deepEqual(
      probeCommandNativeEquivalent(editor, reject, { text: 'x' }),
      {
        materialHandlers: [],
        nativeEquivalent: false,
      }
    );
  });

  it('classifies reflective middleware from the real default result', () => {
    const caughtInspection = createTextEditor(({ around }) => [
      around(editorCommands.insertText, ({ next }) => {
        const result = next();

        try {
          Object.getPrototypeOf(result);
        } catch {
          // This probe only verifies that hostile proxy traps stay contained.
        }

        return result;
      }),
    ]);
    const reflectiveInspection = createTextEditor(({ around }) => [
      around(editorCommands.insertText, ({ next }) => {
        const result = next();

        try {
          Object.isExtensible(result);
        } catch {
          // This probe only verifies that hostile proxy traps stay contained.
        }

        return result;
      }),
    ]);
    const wrappedInspection = createTextEditor(({ around }) => [
      around(editorCommands.insertText, ({ next }) => {
        const result = next();

        try {
          structuredClone(result);
        } catch {
          // This probe only verifies that hostile proxy traps stay contained.
        }

        return result;
      }),
    ]);

    for (const editor of [
      caughtInspection,
      reflectiveInspection,
      wrappedInspection,
    ]) {
      assert.deepEqual(
        probeCommandNativeEquivalent(editor, editorCommands.insertText, {
          text: 'x',
        }),
        {
          materialHandlers: [],
          nativeEquivalent: true,
        }
      );
    }
  });

  it('builds a frozen spec without publishing or moving anchors', () => {
    const editor = createTextEditor();
    const anchor = editor.anchor(
      { offset: 1, path: [0, 0] },
      { association: 'forward', deletion: 'nearest' }
    );
    let commits = 0;

    editor.subscribeCommit(() => (commits += 1) - 1);
    const spec = editor.read((state) => insert.build(state, { text: '!' }));

    assert.notEqual(spec, false);
    if (spec === false) throw new Error('Expected a transaction spec.');

    assert.equal(Object.isFrozen(spec), true);
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

  it('rejects structurally forged specs', () => {
    const editor = createTextEditor();
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
        prepares += 1;

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
          const orderedActions = actions
            .map((action, index) => [index, action] as const)
            .sort((left, right) => {
              const leftAround = left[1].startsWith('around');
              const rightAround = right[1].startsWith('around');

              return leftAround === rightAround ? 0 : leftAround ? -1 : 1;
            });
          const expectedTrace: string[] = [];
          const actualTrace: string[] = [];
          const prepare = (trace: string[], input: Input) => {
            trace.push(`prepare:${input.value}`);

            return { value: input.value + 1 };
          };
          const evaluate = (
            position: number,
            input: Input,
            prepared = false
          ): boolean => {
            const nextInput = prepared ? input : prepare(expectedTrace, input);
            const entry = orderedActions[position];

            if (!entry) {
              expectedTrace.push(`default:${nextInput.value}`);
              if (terminal === 'throw') throw new Error('default');

              return terminal === 'spec';
            }
            const [index, action] = entry;

            expectedTrace.push(`${index}:${action}:${nextInput.value}`);
            if (action.endsWith('throw')) throw new Error(`action-${index}`);
            if (action.endsWith('spec')) return true;
            if (action === 'around-next') {
              return evaluate(position + 1, nextInput, true);
            }
            if (action === 'around-rewrite') {
              return evaluate(
                position + 1,
                { value: nextInput.value + index + 1 },
                false
              );
            }
            return evaluate(position + 1, nextInput, true);
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
      [
        editorCommands.toggleBlock.id,
        () => {
          editor.update.blocks.toggle({ type: 'p' });
        },
      ],
      [
        editorCommands.insertBreak.id,
        () => {
          editor.update.break.insert();
        },
      ],
      [
        editorCommands.insertSoftBreak.id,
        () => {
          editor.update.break.insertSoft();
        },
      ],
      [
        editorCommands.deleteFragment.id,
        () => {
          editor.update.fragment.delete();
        },
      ],
      [
        editorCommands.replaceSlice.id,
        () => editor.update.fragment.replace([{ text: 'x' }]),
      ],
      [
        editorCommands.addMark.id,
        () => {
          editor.update.marks.add('bold', true);
        },
      ],
      [
        editorCommands.removeMark.id,
        () => {
          editor.update.marks.remove('bold');
        },
      ],
      [
        editorCommands.toggleMark.id,
        () => editor.update.marks.toggle('bold', true),
      ],
      [
        editorCommands.insertNodes.id,
        () => {
          editor.update.nodes.insert({ text: 'x' });
        },
      ],
      [
        editorCommands.removeNodes.id,
        () => {
          editor.update.nodes.remove();
        },
      ],
      [
        editorCommands.setNodes.id,
        () => {
          editor.update.nodes.set({ bold: true });
        },
      ],
      [
        editorCommands.collapse.id,
        () => {
          editor.update.selection.collapse();
        },
      ],
      [
        editorCommands.move.id,
        () => {
          editor.update.selection.move();
        },
      ],
      [
        editorCommands.select.id,
        () => {
          editor.update.selection.set(selection);
        },
      ],
      [
        editorCommands.setSelection.id,
        () =>
          editor.update.command(editorCommands.setSelection, {
            props: { anchor: point },
          }),
      ],
      [
        editorCommands.replaceSlice.id,
        () => editor.update.slice.replace(ContentSlice.closed([{ text: 'x' }])),
      ],
      [
        editorCommands.delete.id,
        () => {
          editor.update.text.deleteBackward();
        },
      ],
      [
        editorCommands.delete.id,
        () => {
          editor.update.text.deleteForward();
        },
      ],
      [
        editorCommands.insertText.id,
        () => {
          editor.update.text.insert('x');
        },
      ],
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
    const selfEditor: ReturnType<typeof createTextEditor> = createTextEditor(
      ({ handle }) => [
        handle(self, () => {
          dispatchCommand(selfEditor, self);

          return false;
        }),
      ]
    );
    const mutualEditor: ReturnType<typeof createTextEditor> = createTextEditor(
      ({ handle }) => [
        handle(left, () => {
          dispatchCommand(mutualEditor, right);

          return false;
        }),
        handle(right, () => {
          dispatchCommand(mutualEditor, left);

          return false;
        }),
      ]
    );

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
    editor.subscribeCommit(() => (commits += 1) - 1);

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
      profiledIds.filter((id) => id === 'transaction-node-keys').length,
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

    editor.subscribeCommit(() => (commits += 1) - 1);
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

    editor.subscribeCommit(() => (commits += 1) - 1);
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
      profiledIds.filter((id) => id === 'transaction-node-keys').length,
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

  it('keeps a node selection intact when a replacement slice cannot fit', () => {
    const selection = SelectionApi.nodes([[0], [2]]);
    const editor = createEditor({
      extensions: [CommandScriptSchema],
      initialSelection: selection,
      initialValue: [
        { type: 'paragraph', children: [{ text: 'one' }] },
        { type: 'paragraph', children: [{ text: 'middle' }] },
        { type: 'paragraph', children: [{ text: 'three' }] },
      ],
    });
    const before = editor.read.value();
    const result = dispatchCommand(editor, editorCommands.replaceSlice, {
      slice: ContentSlice.closed([
        { type: 'quote', children: [{ text: 'cannot fit' }] },
      ]),
    });

    assert.equal(result, false);
    assert.deepEqual(editor.read.value(), before);
    assert.deepEqual(getEditorLiveSelection(editor), selection);
  });

  it('removes the remaining selected nodes after an open slice fits', () => {
    const editor = createEditor({
      extensions: [CommandScriptSchema],
      initialSelection: SelectionApi.nodes([[0], [2]]),
      initialValue: [
        { type: 'paragraph', children: [{ text: 'one' }] },
        { type: 'paragraph', children: [{ text: 'middle' }] },
        { type: 'paragraph', children: [{ text: 'three' }] },
      ],
    });
    const result = dispatchCommand(editor, editorCommands.replaceSlice, {
      slice: ContentSlice.fromJSON({
        content: [{ type: 'paragraph', children: [{ text: 'replacement' }] }],
        openEnd: 1,
        openStart: 1,
      }),
    });

    assert.equal(result, true);
    assert.deepEqual(editor.read.children(), [
      { type: 'paragraph', children: [{ text: 'replacement' }] },
      { type: 'paragraph', children: [{ text: 'middle' }] },
    ]);
    assert.deepEqual(editor.read.selection(), {
      anchor: { offset: 11, path: [0, 0] },
      focus: { offset: 11, path: [0, 0] },
    });
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
      anchor: { offset: boundaryOffset, path: [0, 0] },
      focus: { offset: boundaryOffset, path: [0, 0] },
    });
  });

  it('runs command prepare, handler, and build callbacks inside the read guard', () => {
    const editor = createTextEditor();
    const prepareCommand = defineCommand<{ text: string }>(
      'test.guarded-prepare',
      {
        prepare: (input) => {
          editor.update(() => {});

          return input;
        },
      }
    );
    const buildCommand = defineCommand<{ text: string }>('test.guarded-build', {
      build: () => {
        editor.update(() => {});

        return false;
      },
    });
    const handlerCommand = defineCommand<{ text: string }>(
      'test.guarded-handler'
    );
    const handlerEditor: Editor<Value> = createTextEditor(({ handle }) => [
      handle(handlerCommand, () => {
        handlerEditor.update(() => {});

        return false;
      }),
    ]);

    for (const [targetEditor, command] of [
      [editor, prepareCommand],
      [editor, buildCommand],
      [handlerEditor, handlerCommand],
    ] as const) {
      assert.throws(
        () =>
          probeCommandNativeEquivalent(targetEditor, command, { text: 'x' }),
        /editor\.update cannot be started inside editor\.read/
      );
      assert.equal(targetEditor.read.text.string([]), 'ab');
    }
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

    editor.subscribeCommit(() => (commits += 1) - 1);
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
    assert.deepEqual(editor.read.selection(), {
      anchor: { offset: 'This is example'.length, path: [0, 0] },
      focus: { offset: 'This is example'.length, path: [0, 0] },
    });
  });

  it('dispatches collapse and block toggle as pure semantic commands', () => {
    const seen: string[] = [];
    const editor = createEditor({
      extensions: [
        defineEditorSchema('schema:semantic-block-commands', {
          elements: {
            'heading-one': { content: schema.content.text() },
            paragraph: { content: schema.content.text() },
          },
          root: schema.content.types(['paragraph', 'heading-one'], {
            default: { type: 'paragraph' },
            min: 1,
          }),
        }),
        defineExtension('test.semantic-selection-and-block-commands', {
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
        }),
      ],
      initialSelection: SelectionApi.text({
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      }),
      initialValue: [{ type: 'paragraph', children: [{ text: 'ab' }] }],
    });

    dispatchCommand(editor, editorCommands.toggleBlock, {
      options: {
        collapse: { edge: 'end' },
      },
      props: { type: 'heading-one' },
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
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });
    assert.deepEqual(editor.read.children(), [
      { type: 'heading-one', children: [{ text: 'ab' }] },
    ]);
  });

  it('applies schema-exclusive marks and collapses in one semantic command', () => {
    const editor = createEditor({
      extensions: [CommandScriptSchema],
      initialSelection: SelectionApi.text({
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      }),
      initialValue: [
        {
          type: 'paragraph',
          children: [{ superscript: true, text: 'ab' }],
        },
      ],
    });

    dispatchCommand(editor, editorCommands.toggleMark, {
      key: 'subscript',
      options: {
        collapse: { edge: 'end' },
      },
      value: true,
    });

    assert.deepEqual(editor.read.children(), [
      {
        type: 'paragraph',
        children: [{ subscript: true, text: 'ab' }],
      },
    ]);
    assert.deepEqual(editor.read.selection(), {
      anchor: { offset: 2, path: [0, 0] },
      focus: { offset: 2, path: [0, 0] },
    });

    dispatchCommand(editor, editorCommands.select, {
      target: SelectionApi.text({
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      }),
    });
  });

  it('keeps command specs rooted to the dispatching view', () => {
    const runtime = createEditor({
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
    const mainNodeKey = runtime.key([0]);
    const headerNodeKey = header.key([0]);

    runtime.subscribeCommit(() => (commits += 1) - 1);
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
    assert.equal(runtime.key([0]), mainNodeKey);
    assert.equal(header.key([0]), headerNodeKey);
    assert.equal(
      profiledIds.filter((id) => id === 'transaction-node-keys').length,
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
        builds += 1;

        return state.transaction((tx) => {
          tx.text.insert(input.text);
        });
      },
      prepare: (input) => {
        prepares += 1;

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
    const runtime = createEditor({
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

    assert.deepEqual(runtime.read.selection(), publicRange(selection));
  });

  it('maps build-scoped anchors through draft changes and expires them', () => {
    let leakedRef: EditorTransactionAnchor<Point> | undefined;
    const insertBeforeTarget = defineCommand('test.insert-before-target', {
      build: ({ state }) =>
        state.transaction((tx) => {
          const target = tx.anchor(
            { offset: 2, path: [0, 0] },
            { association: 'forward', deletion: 'nearest' }
          );

          leakedRef = target;
          tx.text.insert('x');
          assert.deepEqual(target.resolve(), {
            offset: 3,
            path: [0, 0],
          });
          tx.selection.set(target.resolve());
        }),
    });
    const editor = createTextEditor();

    dispatchCommand(editor, insertBeforeTarget);

    assert.equal(editor.read.text.string([]), 'axb');
    assert.deepEqual(editor.read.selection(), {
      anchor: { offset: 3, path: [0, 0] },
      focus: { offset: 3, path: [0, 0] },
    });
    assert.throws(() => leakedRef?.resolve(), /no longer active/);
  });

  it('preserves application order and next command overrides before dispatch', () => {
    const seen: string[] = [];
    const editor = createTextEditorWithExtensions([
      defineExtension('low-command-priority', {
        commands: ({ around }) => [
          around(insert, ({ input, next }) => {
            seen.push(`low:${input.text}`);
            return next({ ...input, text: input.text.toUpperCase() });
          }),
        ],
      }),
      defineExtension('high-command-priority', {
        commands: ({ around }) => [
          around(insert, ({ input, next }) => {
            seen.push(`high:${input.text}`);
            return next({ ...input, text: `${input.text}!` });
          }),
        ],
      }),
    ]);

    dispatchCommand(editor, insert, { text: 'z' });

    assert.deepEqual(seen, ['low:z', 'high:Z']);
    assert.equal(editor.read.text.string([]), 'aZ!b');
  });

  it('keeps dependency-resolved command order ahead of application order', () => {
    const seen: string[] = [];
    const dependency = defineExtension('command-order-dependency', {
      commands: ({ around }) => [
        around(insert, ({ input, next }) => {
          seen.push(`dependency:${input.text}`);
          return next({ ...input, text: input.text.toUpperCase() });
        }),
      ],
    });
    const dependent = defineExtension('command-order-dependent', {
      commands: ({ around }) => [
        around(insert, ({ input, next }) => {
          seen.push(`dependent:${input.text}`);
          return next({ ...input, text: `${input.text}!` });
        }),
      ],
      dependencies: [dependency],
    });
    const editor = createTextEditorWithExtensions([dependent]);

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
      }),
      'base'
    );
    registerCommandInRegistry(
      configured.commands,
      createCommandRegistration(insert, 'handle', () => {
        calls.push('configured');
        return false as const;
      }),
      'configured'
    );
    initializeBaseExtensionRegistry(editor, finalizeExtensionRegistry(base));

    const registry = validateConfiguredExtensionRegistry(
      editor,
      finalizeExtensionRegistry(configured)
    );
    const entries = registry.commands.byDescriptor.get(insert)?.entries as
      | ReadonlyArray<Readonly<{ run: () => false }>>
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
      commandExtension('prefix-writer', ({ around }) => [
        around(insert, ({ state, next }) =>
          next.after(
            state.transaction((tx) => {
              tx.text.insert('x');
            })
          )
        ),
      ]),
      commandExtension('prefix-observer', ({ handle }) => [
        handle(insert, ({ state }) => {
          observed.push(state.text.string([]));

          return false;
        }),
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

    editor.subscribeCommit(() => (commits += 1) - 1);

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
      commandExtension('nested-prefix-high', ({ around }) => [
        around(insert, ({ state, next }) =>
          next.after(state.transaction((tx) => tx.text.insert('x')))
        ),
      ]),
      commandExtension('nested-prefix-low', ({ around }) => [
        around(insert, ({ state, next }) =>
          next.after(state.transaction((tx) => tx.text.insert('y')))
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
      commandExtension('throwing-prefix', ({ around }) => [
        around(insert, ({ state, next }) =>
          active
            ? next.after(state.transaction((tx) => tx.text.insert('x')))
            : next()
        ),
      ]),
      commandExtension('throwing-handler', ({ handle }) => [
        handle(insert, () => {
          if (active) throw new Error('downstream failed');

          return false;
        }),
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
      () => other.read((current) => current).transaction.extend(spec, () => {}),
      /different editor/
    );

    editor.update((tx) => tx.text.insert('y'));

    assert.throws(
      () => state.transaction.extend(spec, () => {}),
      /stale transaction spec/
    );
  });

  it('preserves node key when a command spec splits a block', () => {
    const editor = createTextEditor();
    const blockNodeKey = editor.key([0]);

    editor.update((tx) => tx.break.insert());

    assert.deepEqual(editor.read.children(), [
      { type: 'paragraph', children: [{ text: 'a' }] },
      { type: 'paragraph', children: [{ text: 'b' }] },
    ]);
    assert.deepEqual(editor.read.selection(), {
      anchor: { offset: 0, path: [1, 0] },
      focus: { offset: 0, path: [1, 0] },
    });
    assert.equal(editor.key([0]), blockNodeKey);
    assert.deepEqual(editor.read.nodes.path(blockNodeKey!), [0]);
    assert.notEqual(editor.key([1]), blockNodeKey);
  });

  it('keeps split node keys injective while extending a delegated spec', () => {
    const editor = createEditor({
      extensions: [
        defineExtension('test.extend-split-command', {
          commands: ({ around }) => [
            around(editorCommands.insertBreak, ({ next, state }) => {
              const delegated = next();

              if (delegated === false) return false;

              return state.transaction.extend(delegated, (tx) => {
                tx.nodes.set({ type: 'quote' }, { at: [0] });
              });
            }),
          ],
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
    const blockNodeKey = editor.key([0]);

    assert.equal(dispatchCommand(editor, editorCommands.insertBreak), true);
    assert.deepEqual(editor.read.children(), [
      { type: 'quote', children: [{ text: '' }] },
      { type: 'paragraph', children: [{ text: 'ab' }] },
    ]);
    assert.equal(editor.key([1]), blockNodeKey);
    assert.notEqual(editor.key([0]), blockNodeKey);
    assert.deepEqual(editor.read.nodes.path(blockNodeKey!), [1]);
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
    const firstKey = editor.key([0]);
    const secondKey = editor.key([1]);

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
      anchor: { offset: 1, path: [0, 0, 0] },
      focus: { offset: 1, path: [0, 1, 0] },
    });
    assert.deepEqual(editor.read.nodes.path(firstKey!), [0, 0]);
    assert.deepEqual(editor.read.nodes.path(secondKey!), [0, 1]);
    assert.equal(editor.read.lastCommit()?.changes.empty, false);
  });

  it('keeps retained node keys and cuts explicit replacement identity', () => {
    const editor = createTextEditor();

    editor.read.runtime.snapshot();
    const blockKey = editor.key([0]);
    const textKey = editor.key([0, 0]);

    editor.update((tx) => {
      tx.nodes.replace(
        { type: 'paragraph', children: [{ text: 'replacement' }] },
        { at: [0] }
      );
    });

    const replacementKey = editor.key([0]);
    const replacementCommit = editor.read.lastCommit();

    assert.notEqual(replacementKey, blockKey);
    assert.notEqual(editor.key([0, 0]), textKey);
    assert.equal(editor.read.nodes.path(blockKey!), undefined);
    assert.equal(editor.read.nodes.path(textKey!), undefined);
    assert.equal(
      editor.read.runtime.snapshot().index.keyAt([0]),
      replacementKey
    );
    assert.equal(replacementCommit?.changed.has('root-order'), true);
    assert.equal(replacementCommit?.changed.has('structure'), true);
    assert.equal(
      replacementCommit?.changed.nodeKeys('path').includes(replacementKey!),
      true
    );
    assert.deepEqual(replacementCommit?.changed.topLevelRanges(), [[0, 0]]);

    editor.update((tx) => tx.nodes.set({ role: 'note' }, { at: [0] }));

    assert.equal(editor.key([0]), replacementKey);
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
    assert.deepEqual(editor.read.selection(), publicRange(selection));
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
    assert.deepEqual(editor.read.selection(), {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });
  });

  it('uses the schema root default after deleting every selected block', () => {
    const selection = SelectionApi.text({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 'heading'.length, path: [0, 0] },
    });
    const editor = createEditor({
      extensions: [
        defineEditorSchema('schema:derived', {
          elements: {
            heading: {
              content: schema.content.text({ default: 'text', min: 1 }),
            } as const,
            paragraph: {
              content: schema.content.text({ default: 'text', min: 1 }),
            } as const,
          },
          root: schema.content.types(['heading', 'paragraph'], {
            default: { type: 'paragraph' },
            min: 1,
          }),
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
    assert.deepEqual(editor.read.selection(), {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });
  });

  it('uses the schema root default when text replaces a structural block', () => {
    const selection = SelectionApi.text({
      anchor: { offset: 0, path: [0, 0, 0] },
      focus: { offset: 'one'.length, path: [0, 0, 0] },
    });
    const editor = createEditor({
      extensions: [
        defineEditorSchema('schema:test.structural-blocks', {
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
          root: schema.content.group('block', {
            default: { type: 'paragraph' },
            min: 1,
          }),
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
    assert.deepEqual(editor.read.selection(), {
      anchor: { offset: 1, path: [0, 0] },
      focus: { offset: 1, path: [0, 0] },
    });
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
    const runtime = createEditor({
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
