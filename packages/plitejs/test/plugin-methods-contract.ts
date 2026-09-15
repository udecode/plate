import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createEditor, definePlugin, editorCommands } from 'plitejs';

import { hasCommandHandler } from '../src/core/command-registry';
import {
  deleteBackward as editorDeleteBackward,
  getPluginRegistry as editorGetPluginRegistry,
  getSnapshot as editorGetSnapshot,
  insertText as editorInsertText,
  replace as editorReplace,
  string as editorString,
} from '../src/internal';

describe('plugin method hard cut', () => {
  it('rejects one stable name with different descriptor identities', () => {
    const editor = createEditor();
    const first = definePlugin('duplicate-descriptor-name', {
      api: () => ({ duplicateIdentity: 'first' }),
    });
    const second = definePlugin('duplicate-descriptor-name', {
      api: () => ({ duplicateIdentity: 'second' }),
    });

    assert.throws(
      () => editor.install([first, second]),
      /"duplicate-descriptor-name" has multiple descriptor identities/
    );
    assert.equal(editorGetPluginRegistry(editor).plugins.size, 0);
  });

  it('activates factory inputs and cleanup signal around plugin-owned state', () => {
    const editor = createEditor();
    const cleanupEvents: string[] = [];
    const initialMode = 'text' as const;
    let runtimeMode: {
      cleanup: () => void;
      get: () => 'cell' | 'text';
      set: (value: 'cell' | 'text') => void;
    } | null = null;

    const unextend = editor.install(
      definePlugin('runtime-table', {
        activate(context) {
          assert.equal(context.pluginName, 'runtime-table');

          let active = true;
          let current: 'cell' | 'text' = initialMode;
          const mode = {
            cleanup() {
              active = false;
            },
            get() {
              if (!active) throw new Error('Plugin state is inactive.');

              return current;
            },
            set(value: 'cell' | 'text') {
              if (!active) throw new Error('Plugin state is inactive.');
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
        read: () => ({
          mode: () => runtimeMode?.get(),
        }),
        update: () => ({
          setMode(nextMode: 'text' | 'cell') {
            runtimeMode?.set(nextMode);
          },
        }),
      })
    );

    assert.equal(
      editor.read((state) =>
        (
          state as typeof state & {
            'runtime-table': { mode(): string };
          }
        )['runtime-table'].mode()
      ),
      'text'
    );

    editor.update((tx) => {
      (
        tx as typeof tx & {
          'runtime-table': { setMode(mode: 'text' | 'cell'): void };
        }
      )['runtime-table'].setMode('cell');
    });

    assert.equal(
      editor.read((state) =>
        (
          state as typeof state & {
            'runtime-table': { mode(): string };
          }
        )['runtime-table'].mode()
      ),
      'cell'
    );

    unextend();

    assert.deepEqual(cleanupEvents, ['abort:cell', 'cleanup:cell']);
    assert.throws(() => runtimeMode?.get(), /Plugin state is inactive/);
    assert.equal(
      editor.read((state) => 'runtime-table' in state),
      false
    );
  });

  it('resolves editor api handles only from installed plugin tokens', () => {
    const installed = definePlugin('history', {
      api: () => ({
        run(_options: { save?: boolean }, fn: () => void) {
          fn();
        },
      }),
    });
    const fresh = definePlugin('history', {
      api: () => ({
        run(_options: { save?: boolean }, fn: () => void) {
          fn();
        },
      }),
    });
    const editor = createEditor({ plugins: [installed] as const });
    let called = false;

    assert.equal(editor.plugin(installed).api, editor.api.history);
    editor.plugin(installed).api.run({ save: false }, () => {
      called = true;
    });
    assert.equal(called, true);
    assert.equal(editor.plugin(fresh).installed, false);
    assert.throws(
      () => editor.plugin(fresh).api,
      /Editor plugin "history" is not installed on this editor\./
    );
  });

  it('resolves editor api handles from installed API factories', () => {
    const installed = definePlugin('factory-owner', {
      api() {
        return {
          read: () => 42,
        };
      },
    });
    const editor = createEditor({ plugins: [installed] as const });

    assert.equal(editor.plugin(installed).api, editor.api['factory-owner']);
    assert.equal(editor.plugin(installed).api.read(), 42);
  });

  it('pure command handlers delegate, override, and extend one spec', () => {
    const seenOffsets: number[] = [];
    const editor = createEditor({
      plugins: [
        definePlugin('insert-text-command', {
          commands: ({ around }) => [
            around(editorCommands.insertText, ({ input, state, next }) => {
              const selection = state.selection();

              seenOffsets.push(selection?.anchor.offset ?? -1);
              const spec = next({
                ...input,
                text: input.text.toUpperCase(),
              });

              if (!spec) return false;

              return state.transaction.extend(spec, (tx) => {
                const transactionSelection = tx.selection();

                seenOffsets.push(transactionSelection?.anchor.offset ?? -1);
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

  it('detects registered semantic command handlers by token', () => {
    const editor = createEditor({
      plugins: [
        definePlugin('insert-break-command', {
          commands: ({ handle }) => [
            handle(editorCommands.insertBreak, (_context) => false),
          ],
        }),
      ],
    });

    assert.equal(hasCommandHandler(editor, editorCommands.insertText), false);
    assert.equal(hasCommandHandler(editor, editorCommands.insertBreak), true);

    editor.install(
      definePlugin('insert-text-command', {
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

    editor.install(
      definePlugin('delete-backward-command', {
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

  it('command handlers follow install order', () => {
    const editor = createEditor();
    const calls: string[] = [];

    editor.install([
      definePlugin('low-delete-backward-command', {
        commands: ({ handle }) => [
          handle(editorCommands.delete, (_context) => {
            calls.push('low');
            return false;
          }),
        ],
      }),
      definePlugin('high-delete-backward-command', {
        commands: ({ handle }) => [
          handle(editorCommands.delete, ({ state }) => {
            calls.push('high');
            return state.transaction(() => {});
          }),
        ],
      }),
    ]);

    editorDeleteBackward(editor);

    assert.deepEqual(calls, ['low', 'high']);
  });

  it('runs around middleware outside terminal handlers regardless of install order', () => {
    const editor = createEditor();
    const calls: string[] = [];

    editor.install([
      definePlugin('terminal-delete-command', {
        commands: ({ handle }) => [
          handle(editorCommands.delete, ({ state }) => {
            calls.push('handle');
            return state.transaction(() => {});
          }),
        ],
      }),
      definePlugin('around-delete-command', {
        commands: ({ around }) => [
          around(editorCommands.delete, ({ next }) => {
            calls.push('around:before');
            const result = next();
            calls.push('around:after');
            return result;
          }),
        ],
      }),
    ]);

    editorDeleteBackward(editor);

    assert.deepEqual(calls, ['around:before', 'handle', 'around:after']);
  });

  it('validates descriptor conflicts before mutating the editor', () => {
    const editor = createEditor();
    const conflictB = definePlugin('conflict-b', {});
    const conflictA = definePlugin('conflict-a', {
      conflicts: [conflictB],
    });

    assert.throws(
      () => editor.install([conflictA, conflictB]),
      /Editor plugin "conflict-a" conflicts with "conflict-b"/
    );
    assert.equal(editorGetPluginRegistry(editor).plugins.size, 0);

    const lateConflict = definePlugin('late-conflict', {});
    const cleanupInstalled = editor.install(
      definePlugin('installed-conflict', {
        conflicts: [lateConflict],
      })
    );

    assert.throws(
      () => editor.install(lateConflict),
      /Editor plugin "late-conflict" conflicts with "installed-conflict"/
    );
    assert.equal(
      editorGetPluginRegistry(editor).plugins.has('late-conflict'),
      false
    );

    cleanupInstalled();
  });

  it('rejects active same-name descriptors and accepts disabled tombstones', () => {
    const editor = createEditor();
    const first = definePlugin('duplicate', {
      api: () => ({
        value: 'first',
      }),
      read: () => ({ value: () => 'first' }),
    });
    const second = definePlugin('duplicate', {
      api: () => ({
        value: 'second',
      }),
      read: () => ({ value: () => 'second' }),
    });

    assert.throws(
      () => editor.install([first, second]),
      /Editor plugin "duplicate" has multiple descriptor identities/
    );
    assert.equal(editorGetPluginRegistry(editor).plugins.size, 0);

    editor.install(first);

    editor.install(
      definePlugin('duplicate', {
        enabled: false,
      })
    );

    assert.equal((editor.api as { duplicate?: unknown }).duplicate, undefined);
    assert.equal(
      editor.read((state) => 'duplicate' in state),
      false
    );
    assert.equal(
      editorGetPluginRegistry(editor).plugins.has('duplicate'),
      false
    );
  });

  it('keeps installed same-name plugin when replacement validation fails', () => {
    const editor = createEditor();
    const installed = definePlugin('duplicate', {
      api: () => ({
        value: 'installed',
      }),
      read: () => ({ value: () => 'installed' }),
    });
    const replacement = definePlugin('duplicate', {
      api: () => ({
        value: 'replacement',
      }),
      validate() {
        throw new Error('invalid replacement');
      },
      read: () => ({ value: () => 'replacement' }),
    });

    editor.install(installed);

    assert.throws(() => editor.install(replacement), /invalid replacement/);
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
      (
        editor.plugin as unknown as (plugin: typeof installed) => {
          api: { value: string };
        }
      )(installed).api,
      (editor.api as { duplicate?: unknown }).duplicate
    );
    assert.equal(editor.plugin(replacement).installed, false);
    assert.throws(
      () => editor.plugin(replacement).api,
      /Editor plugin "duplicate" is not installed on this editor\./
    );
  });
});
