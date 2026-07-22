import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  deleteBackward as editorDeleteBackward,
  getExtensionRegistry as editorGetExtensionRegistry,
  getSnapshot as editorGetSnapshot,
  insertText as editorInsertText,
  replace as editorReplace,
  string as editorString,
} from '@platejs/plite/internal';

import {
  createEditor,
  defineEditorExtension,
  editorCommands,
  type EditorExtensionInput,
} from '@platejs/plite';
import { hasCommandHandler } from '../src/core/command-registry';

const asExtensionInput = (extension: unknown): EditorExtensionInput =>
  extension as EditorExtensionInput;

describe('extension method hard cut', () => {
  it('rejects object methods before mutating the editor', () => {
    const editor = createEditor();
    const methodsExtension = asExtensionInput({
      name: 'method-link',
      methods: {
        insertLink() {},
      },
    });

    assert.throws(
      () => editor.extend(methodsExtension),
      /Editor extension "method-link" cannot use methods\. Add state or tx groups instead\./
    );
    assert.equal('insertText' in editor, false);
    assert.equal('insertLink' in editor, false);
    assert.equal(editorGetExtensionRegistry(editor).extensions.size, 0);
  });

  it('rejects malformed command registrations before mutating the editor', () => {
    const editor = createEditor();
    const commandExtension = asExtensionInput({
      commands: () => [
        {
          handler: () => false,
        },
      ],
      name: 'command-extension',
    });

    assert.throws(
      () => editor.extend(commandExtension),
      /command registrations must be created by the extension command factory/
    );
    assert.equal(editorGetExtensionRegistry(editor).extensions.size, 0);
    assert.equal(
      editorGetExtensionRegistry(editor).commands.byDescriptor.size,
      0
    );
  });

  it('rejects unsupported extension lifecycle slots before mutating the editor', () => {
    const editor = createEditor();

    assert.throws(
      () =>
        editor.extend(
          asExtensionInput({
            name: 'setup-only-register',
            register() {},
          })
        ),
      /Editor extension "setup-only-register" cannot use register\. Declare extension resources directly\./
    );
    assert.throws(
      () =>
        editor.extend(
          asExtensionInput({
            commitListeners: [() => {}],
            name: 'commit-slot',
          })
        ),
      /Editor extension "commit-slot" cannot use commitListeners\. Add onCommit instead\./
    );
    assert.equal(editorGetExtensionRegistry(editor).extensions.size, 0);
  });

  it('rejects functional methods before mutating the editor', () => {
    const editor = createEditor();
    const methodsExtension = asExtensionInput({
      name: 'method-wrapper',
      methods() {
        return {
          insertText() {},
        };
      },
    });

    assert.throws(
      () => editor.extend(methodsExtension),
      /Editor extension "method-wrapper" cannot use methods\. Add state or tx groups instead\./
    );
    assert.equal('insertText' in editor, false);
    assert.equal(editorGetExtensionRegistry(editor).extensions.size, 0);
  });

  it('keeps dependency validation on namespace extensions before mutating the editor', () => {
    const editor = createEditor();
    const missingDependency = defineEditorExtension({
      name: 'dependent',
      dependencies: ['missing'],
      state: {
        dependent() {
          return {};
        },
      },
    });
    const a = defineEditorExtension({
      name: 'a',
      dependencies: ['b'],
    });
    const b = defineEditorExtension({
      name: 'b',
      dependencies: ['a'],
    });

    assert.throws(
      () => editor.extend(missingDependency),
      /missing dependency "missing"/
    );
    assert.throws(() => editor.extend([a, b]), /cyclic dependency/);
    assert.equal(editorGetExtensionRegistry(editor).extensions.size, 0);
    assert.equal(
      editor.read((state) => 'dependent' in state),
      false
    );
  });

  it('discards earlier namespace groups when a later extension fails', () => {
    const editor = createEditor();
    const first = defineEditorExtension({
      name: 'first-table',
      state: {
        table() {
          return { source: 'first' };
        },
      },
    });
    const second = defineEditorExtension({
      name: 'second-table',
      state: {
        table() {
          return { source: 'second' };
        },
      },
    });

    assert.throws(
      () => editor.extend([first, second]),
      /state group "table".*conflicts/
    );
    assert.equal(editorGetExtensionRegistry(editor).extensions.size, 0);
    assert.equal(
      editor.read((state) => 'table' in state),
      false
    );
  });

  it('activates options and cleanup signal around extension-owned state', () => {
    const editor = createEditor();
    const cleanupEvents: string[] = [];
    let runtimeMode: {
      cleanup: () => void;
      get: () => 'cell' | 'text';
      set: (value: 'cell' | 'text') => void;
    } | null = null;

    const unextend = editor.extend(
      defineEditorExtension({
        activate(_editor, context) {
          assert.equal(context.name, 'runtime-table');
          assert.equal(context.options.initialMode, 'text');

          let active = true;
          let current: 'cell' | 'text' = context.options.initialMode;
          const mode = {
            cleanup() {
              active = false;
            },
            get() {
              if (!active) throw new Error('Extension state is inactive.');

              return current;
            },
            set(value: 'cell' | 'text') {
              if (!active) throw new Error('Extension state is inactive.');
              current = value;
            },
          };
          runtimeMode = mode;
          context.signal.addEventListener('abort', () => {
            cleanupEvents.push(`abort:${mode.get()}`);
          });
          context.onCleanup(() => {
            cleanupEvents.push(`cleanup:${mode.get()}`);
            mode.cleanup();
          });
        },
        name: 'runtime-table',
        options: { initialMode: 'text' as const },
        state: {
          table() {
            return {
              mode: () => runtimeMode?.get(),
            };
          },
        },
        tx: {
          table() {
            return {
              setMode(nextMode: 'text' | 'cell') {
                runtimeMode?.set(nextMode);
              },
            };
          },
        },
      })
    );

    assert.equal(
      editor.read((state) =>
        (state as typeof state & { table: { mode(): string } }).table.mode()
      ),
      'text'
    );

    editor.update((tx) => {
      (
        tx as typeof tx & { table: { setMode(mode: 'text' | 'cell'): void } }
      ).table.setMode('cell');
    });

    assert.equal(
      editor.read((state) =>
        (state as typeof state & { table: { mode(): string } }).table.mode()
      ),
      'cell'
    );

    unextend();

    assert.deepEqual(cleanupEvents, ['abort:cell', 'cleanup:cell']);
    assert.throws(() => runtimeMode?.get(), /Extension state is inactive/);
    assert.equal(
      editor.read((state) => 'table' in state),
      false
    );
  });

  it('resolves editor api handles only from installed extension tokens', () => {
    const installed = defineEditorExtension({
      name: 'history',
      api: {
        history: {
          run(_options: { save?: boolean }, fn: () => void) {
            fn();
          },
        },
      },
    });
    const fresh = defineEditorExtension({
      name: 'history',
      api: {
        history: {
          run(_options: { save?: boolean }, fn: () => void) {
            fn();
          },
        },
      },
    });
    const editor = createEditor({ extensions: [installed] as const });
    let called = false;

    assert.equal(editor.getApi(installed), editor.api.history);
    editor.getApi(installed).run({ save: false }, () => {
      called = true;
    });
    assert.equal(called, true);
    assert.throws(
      () => editor.getApi(fresh),
      /Editor extension "history" is not installed on this editor\./
    );
  });

  it('pure command handlers delegate, override, and extend one spec', () => {
    const seenOffsets: number[] = [];
    const editor = createEditor({
      extensions: [
        defineEditorExtension({
          name: 'insert-text-command',
          commands: ({ around }) => [
            around(editorCommands.insertText, ({ input, state, next }) => {
              seenOffsets.push(state.selection()?.anchor.offset ?? -1);
              const spec = next({
                ...input,
                text: input.text.toUpperCase(),
              });

              if (!spec) return false;

              return state.transaction.extend(spec, (tx) => {
                seenOffsets.push(tx.selection()?.anchor.offset ?? -1);
                tx.tags.add('extended-command');
              });
            }),
          ],
        }),
      ],
      initialValue: [{ type: 'paragraph', children: [{ text: 'one' }] }],
    });

    editor.update((tx) => {
      tx.selection.set({ path: [0, 0], offset: 3 });
    });
    editorInsertText(editor, '!');

    assert.deepEqual(seenOffsets, [3, 4]);
    assert.equal(editorString(editor, [0]), 'one!');
    assert.deepEqual(editorGetSnapshot(editor).version, 2);
  });

  it('extension clipboard middleware receives the owned transaction', () => {
    const editor = createEditor();
    const seenOffsets: number[] = [];
    let hasTx = false;

    editorReplace(editor, {
      children: [{ type: 'paragraph', children: [{ text: 'one' }] }],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [0, 0], offset: 2 },
      },
    });

    editor.extend(
      defineEditorExtension({
        name: 'clipboard-state',
        clipboard: {
          insertData(_data, context) {
            hasTx = 'tx' in context;
            seenOffsets.push(context.tx.selection()?.anchor.offset ?? -1);

            return context.next();
          },
        },
      })
    );

    assert.equal(editor.api.clipboard.insertData({} as DataTransfer), false);
    assert.deepEqual(seenOffsets, [2]);
    assert.equal(hasTx, true);
  });

  it('detects registered semantic command handlers by token', () => {
    const editor = createEditor({
      extensions: [
        defineEditorExtension({
          name: 'insert-break-command',
          commands: ({ handle }) => [
            handle(editorCommands.insertBreak, (_context) => false),
          ],
        }),
      ],
    });

    assert.equal(hasCommandHandler(editor, editorCommands.insertText), false);
    assert.equal(hasCommandHandler(editor, editorCommands.insertBreak), true);

    editor.extend(
      defineEditorExtension({
        name: 'insert-text-command',
        commands: ({ handle }) => [
          handle(editorCommands.insertText, (_context) => false),
        ],
      })
    );

    assert.equal(hasCommandHandler(editor, editorCommands.insertText), true);
  });

  it('a handled command can intentionally produce no document change', () => {
    const editor = createEditor();
    const seenUnits: string[] = [];

    editorReplace(editor, {
      children: [{ type: 'paragraph', children: [{ text: 'one' }] }],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      },
    });

    editor.extend(
      defineEditorExtension({
        name: 'delete-backward-command',
        commands: ({ handle }) => [
          handle(editorCommands.delete, ({ input, state }) => {
            seenUnits.push(input.unit);
            return state.transaction(() => {});
          }),
        ],
      })
    );

    editorDeleteBackward(editor);

    assert.deepEqual(seenUnits, ['character']);
    assert.equal(editorString(editor, [0]), 'one');
  });

  it('command priority beats install order', () => {
    const editor = createEditor();
    const calls: string[] = [];

    editor.extend([
      defineEditorExtension({
        name: 'low-delete-backward-command',
        commands: ({ handle }) => [
          handle(editorCommands.delete, (_context) => {
            calls.push('low');
            return false;
          }),
        ],
      }),
      defineEditorExtension({
        name: 'high-delete-backward-command',
        priority: 10,
        commands: ({ handle }) => [
          handle(editorCommands.delete, ({ state }) => {
            calls.push('high');
            return state.transaction(() => {});
          }),
        ],
      }),
    ]);

    editorDeleteBackward(editor);

    assert.deepEqual(calls, ['high']);
  });

  it('validates peer dependencies and conflicts before mutating the editor', () => {
    const editor = createEditor();
    const missingPeer = defineEditorExtension({
      name: 'needs-peer',
      peerDependencies: ['peer-host'],
      state: {
        needsPeer() {
          return {};
        },
      },
    });

    assert.throws(
      () => editor.extend(missingPeer),
      /missing peer dependency "peer-host"/
    );
    assert.equal(editorGetExtensionRegistry(editor).extensions.size, 0);
    assert.equal(
      editor.read((state) => 'needsPeer' in state),
      false
    );

    const peerHost = defineEditorExtension({ name: 'peer-host' });
    const cleanupHost = editor.extend(peerHost);
    const cleanupPeer = editor.extend(missingPeer);

    assert.equal(
      editorGetExtensionRegistry(editor).extensions.has('needs-peer'),
      true
    );

    cleanupPeer();
    cleanupHost();

    assert.throws(
      () =>
        editor.extend([
          defineEditorExtension({
            conflicts: ['conflict-b'],
            name: 'conflict-a',
          }),
          defineEditorExtension({ name: 'conflict-b' }),
        ]),
      /Editor extension "conflict-a" conflicts with "conflict-b"/
    );
    assert.equal(editorGetExtensionRegistry(editor).extensions.size, 0);

    const cleanupInstalled = editor.extend(
      defineEditorExtension({
        conflicts: ['late-conflict'],
        name: 'installed-conflict',
      })
    );

    assert.throws(
      () => editor.extend(defineEditorExtension({ name: 'late-conflict' })),
      /Editor extension "late-conflict" conflicts with "installed-conflict"/
    );
    assert.equal(
      editorGetExtensionRegistry(editor).extensions.has('late-conflict'),
      false
    );

    cleanupInstalled();
  });

  it('uses latest same-name extensions and enabled false tombstones', () => {
    const editor = createEditor();
    const first = defineEditorExtension({
      api: {
        duplicate: {
          value: 'first',
        },
      },
      name: 'duplicate',
      state: {
        duplicate() {
          return { value: () => 'first' };
        },
      },
    });
    const second = defineEditorExtension({
      api: {
        duplicate: {
          value: 'second',
        },
      },
      name: 'duplicate',
      state: {
        duplicate() {
          return { value: () => 'second' };
        },
      },
    });

    editor.extend([first, second]);

    assert.equal(
      (editor.api as { duplicate?: { value: string } }).duplicate?.value,
      'second'
    );
    assert.equal(
      editor.read((state) =>
        (
          state as unknown as { duplicate: { value: () => string } }
        ).duplicate.value()
      ),
      'second'
    );
    assert.throws(
      () => editor.getApi(first as never),
      /Editor extension "duplicate" is not installed on this editor\./
    );

    editor.extend(
      defineEditorExtension({
        enabled: false,
        name: 'duplicate',
      })
    );

    assert.equal((editor.api as { duplicate?: unknown }).duplicate, undefined);
    assert.equal(
      editor.read((state) => 'duplicate' in state),
      false
    );
    assert.equal(
      editorGetExtensionRegistry(editor).extensions.has('duplicate'),
      false
    );
  });

  it('merges object API capabilities from shared API names', () => {
    const editor = createEditor();

    editor.extend([
      defineEditorExtension({
        api: {
          host: {
            focus: () => 'focus',
          },
        },
        name: 'host-focus',
      }),
      defineEditorExtension({
        api: {
          host: {
            blur: () => 'blur',
          },
        },
        name: 'host-blur',
      }),
    ]);

    const host = (
      editor.api as unknown as {
        host: { blur: () => string; focus: () => string };
      }
    ).host;

    assert.equal(host.focus(), 'focus');
    assert.equal(host.blur(), 'blur');
  });

  it('uses latest callable API capability from shared API names', () => {
    const editor = createEditor();
    const installFallback = editor.extend(
      defineEditorExtension({
        api: {
          redecorate: () => 'fallback',
        },
        name: 'fallback-redecorate',
      })
    );

    assert.equal(
      (editor.api as unknown as { redecorate: () => string }).redecorate(),
      'fallback'
    );

    const installOverride = editor.extend(
      defineEditorExtension({
        api: {
          redecorate: () => 'override',
        },
        name: 'mounted-redecorate',
      })
    );

    assert.equal(
      (editor.api as unknown as { redecorate: () => string }).redecorate(),
      'override'
    );

    installOverride();

    assert.equal(
      (editor.api as unknown as { redecorate: () => string }).redecorate(),
      'fallback'
    );

    installFallback();

    assert.equal(
      (editor.api as unknown as { redecorate?: unknown }).redecorate,
      undefined
    );
  });

  it('keeps installed same-name extension when replacement validation fails', () => {
    const editor = createEditor();
    const installed = defineEditorExtension({
      api: {
        duplicate: {
          value: 'installed',
        },
      },
      name: 'duplicate',
      state: {
        duplicate() {
          return { value: () => 'installed' };
        },
      },
    });
    const replacement = defineEditorExtension({
      dependencies: ['missing'],
      api: {
        duplicate: {
          value: 'replacement',
        },
      },
      name: 'duplicate',
      state: {
        duplicate() {
          return { value: () => 'replacement' };
        },
      },
    });

    editor.extend(installed);

    assert.throws(
      () => editor.extend(replacement),
      /missing dependency "missing"/
    );
    assert.equal(
      (editor.api as { duplicate?: { value: string } }).duplicate?.value,
      'installed'
    );
    assert.equal(
      editor.read((state) =>
        (
          state as unknown as { duplicate: { value: () => string } }
        ).duplicate.value()
      ),
      'installed'
    );
    assert.equal(
      editor.getApi(installed as never),
      (editor.api as { duplicate?: unknown }).duplicate
    );
    assert.throws(
      () => editor.getApi(replacement as never),
      /Editor extension "duplicate" is not installed on this editor\./
    );
  });
});
