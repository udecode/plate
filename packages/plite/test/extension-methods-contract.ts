import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createEditor, defineExtension, editorCommands } from '@platejs/plite';
import {
  deleteBackward as editorDeleteBackward,
  getExtensionRegistry as editorGetExtensionRegistry,
  getSnapshot as editorGetSnapshot,
  insertText as editorInsertText,
  replace as editorReplace,
  string as editorString,
} from '@platejs/plite/internal';

import { hasCommandHandler } from '../src/core/command-registry';

describe('extension method hard cut', () => {
  it('rejects one stable name with different descriptor identities', () => {
    const editor = createEditor();
    const first = defineExtension('duplicate-descriptor-name', {
      api: () => ({ duplicateIdentity: 'first' }),
    });
    const second = defineExtension('duplicate-descriptor-name', {
      api: () => ({ duplicateIdentity: 'second' }),
    });

    assert.throws(
      () => editor.install([first, second]),
      /"duplicate-descriptor-name" has multiple descriptor identities/
    );
    assert.equal(editorGetExtensionRegistry(editor).extensions.size, 0);
  });

  it('activates factory inputs and cleanup signal around extension-owned state', () => {
    const editor = createEditor();
    const cleanupEvents: string[] = [];
    const initialMode = 'text' as const;
    let runtimeMode: {
      cleanup: () => void;
      get: () => 'cell' | 'text';
      set: (value: 'cell' | 'text') => void;
    } | null = null;

    const unextend = editor.install(
      defineExtension('runtime-table', {
        activate(context) {
          assert.equal(context.extensionName, 'runtime-table');

          let active = true;
          let current: 'cell' | 'text' = initialMode;
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
    assert.throws(() => runtimeMode?.get(), /Extension state is inactive/);
    assert.equal(
      editor.read((state) => 'runtime-table' in state),
      false
    );
  });

  it('resolves editor api handles only from installed extension tokens', () => {
    const installed = defineExtension('history', {
      api: () => ({
        run(_options: { save?: boolean }, fn: () => void) {
          fn();
        },
      }),
    });
    const fresh = defineExtension('history', {
      api: () => ({
        run(_options: { save?: boolean }, fn: () => void) {
          fn();
        },
      }),
    });
    const editor = createEditor({ extensions: [installed] as const });
    let called = false;

    assert.equal(editor.extension(installed).api, editor.api.history);
    editor.extension(installed).api.run({ save: false }, () => {
      called = true;
    });
    assert.equal(called, true);
    assert.throws(
      () => editor.extension(fresh),
      /Editor extension "history" is not installed on this editor\./
    );
  });

  it('resolves editor api handles from installed API factories', () => {
    const installed = defineExtension('factory-owner', {
      api() {
        return {
          read: () => 42,
        };
      },
    });
    const editor = createEditor({ extensions: [installed] as const });

    assert.equal(editor.extension(installed).api, editor.api['factory-owner']);
    assert.equal(editor.extension(installed).api.read(), 42);
  });

  it('pure command handlers delegate, override, and extend one spec', () => {
    const seenOffsets: number[] = [];
    const editor = createEditor({
      extensions: [
        defineExtension('insert-text-command', {
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
      extensions: [
        defineExtension('insert-break-command', {
          commands: ({ handle }) => [
            handle(editorCommands.insertBreak, (_context) => false),
          ],
        }),
      ],
    });

    assert.equal(hasCommandHandler(editor, editorCommands.insertText), false);
    assert.equal(hasCommandHandler(editor, editorCommands.insertBreak), true);

    editor.install(
      defineExtension('insert-text-command', {
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
      defineExtension('delete-backward-command', {
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
      defineExtension('low-delete-backward-command', {
        commands: ({ handle }) => [
          handle(editorCommands.delete, (_context) => {
            calls.push('low');
            return false;
          }),
        ],
      }),
      defineExtension('high-delete-backward-command', {
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
      defineExtension('terminal-delete-command', {
        commands: ({ handle }) => [
          handle(editorCommands.delete, ({ state }) => {
            calls.push('handle');
            return state.transaction(() => {});
          }),
        ],
      }),
      defineExtension('around-delete-command', {
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
    const conflictB = defineExtension('conflict-b', {});
    const conflictA = defineExtension('conflict-a', {
      conflicts: [conflictB],
    });

    assert.throws(
      () => editor.install([conflictA, conflictB]),
      /Editor extension "conflict-a" conflicts with "conflict-b"/
    );
    assert.equal(editorGetExtensionRegistry(editor).extensions.size, 0);

    const lateConflict = defineExtension('late-conflict', {});
    const cleanupInstalled = editor.install(
      defineExtension('installed-conflict', {
        conflicts: [lateConflict],
      })
    );

    assert.throws(
      () => editor.install(lateConflict),
      /Editor extension "late-conflict" conflicts with "installed-conflict"/
    );
    assert.equal(
      editorGetExtensionRegistry(editor).extensions.has('late-conflict'),
      false
    );

    cleanupInstalled();
  });

  it('rejects active same-name descriptors and accepts disabled tombstones', () => {
    const editor = createEditor();
    const first = defineExtension('duplicate', {
      api: () => ({
        value: 'first',
      }),
      read: () => ({ value: () => 'first' }),
    });
    const second = defineExtension('duplicate', {
      api: () => ({
        value: 'second',
      }),
      read: () => ({ value: () => 'second' }),
    });

    assert.throws(
      () => editor.install([first, second]),
      /Editor extension "duplicate" has multiple descriptor identities/
    );
    assert.equal(editorGetExtensionRegistry(editor).extensions.size, 0);

    editor.install(first);

    editor.install(
      defineExtension('duplicate', {
        enabled: false,
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

  it('keeps installed same-name extension when replacement validation fails', () => {
    const editor = createEditor();
    const installed = defineExtension('duplicate', {
      api: () => ({
        value: 'installed',
      }),
      read: () => ({ value: () => 'installed' }),
    });
    const replacement = defineExtension('duplicate', {
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
        editor.extension as unknown as (extension: typeof installed) => {
          api: { value: string };
        }
      )(installed).api,
      (editor.api as { duplicate?: unknown }).duplicate
    );
    assert.throws(
      () =>
        (
          editor.extension as unknown as (extension: typeof replacement) => {
            api: { value: string };
          }
        )(replacement),
      /Editor extension "duplicate" is not installed on this editor\./
    );
  });
});
