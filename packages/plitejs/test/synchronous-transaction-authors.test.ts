import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
// oxlint-disable typescript/no-floating-promises, typescript/no-misused-promises -- Promise-returning authors are intentional rejection fixtures.

import {
  createEditor,
  createEditorView,
  defineCommand,
  definePlugin,
  defineStateField,
  txOnly,
  txRead,
} from 'plitejs';

const paragraph = (text: string) => ({
  type: 'paragraph',
  children: [{ text }],
});
const point = { path: [0, 0], offset: 3 };
const field = defineStateField({
  key: 'synchronous-authors.field',
  initial: () => '',
});

describe('synchronous transaction authors', () => {
  for (const root of ['main', 'header'] as const) {
    for (const mode of [
      'callback',
      'configured callback',
      'direct plugin',
      'configured plugin',
      'plugin portal',
      'configured portal',
      'ignored plugin result',
      'nested method',
      'callable method',
      'tx-only method',
      'pure spec',
      'extended spec',
      'command',
      'extended command',
    ] as const) {
      it(`rolls back ${mode} on ${root} and retires its continuation`, async () => {
        let release!: () => void;
        const gate = new Promise<void>((resolve) => {
          release = resolve;
        });
        let pending: Promise<void> | undefined;
        const start = (write: () => void, resume: () => void) => {
          pending = (async () => {
            write();
            await gate;
            resume();
          })();

          return pending;
        };
        let afterCommits = 0;
        const plugin = definePlugin('unfinished', {
          stateFields: [field],
          update: ({ tx, context }) => {
            const append = () =>
              start(
                () => {
                  tx.text.insert('!', { at: point });
                  tx.setField(field, 'partial');
                  tx.tags.add('partial');
                  context.afterCommit(() => {
                    afterCommits += 1;
                  });
                },
                () => tx.text.insert('?', { at: point })
              );

            return {
              append,
              nested: Object.assign(() => append(), { append }),
              scoped: txOnly(() => append()),
            };
          },
        });
        const build: NonNullable<
          NonNullable<Parameters<typeof defineCommand>[1]>['build']
        > = ({ state }) => {
          const author: Parameters<typeof state.transaction>[0] = (tx) =>
            start(
              () => {
                tx.text.insert('!', { at: point });
                tx.setField(field, 'partial');
                tx.tags.add('partial');
              },
              () => tx.text.insert('?', { at: point })
            );

          return mode === 'extended spec' || mode === 'extended command'
            ? state.transaction.extend(
                state.transaction((tx) => {
                  tx.text.insert('base', { at: point });
                }),
                author
              )
            : state.transaction(author);
        };
        const command = defineCommand(`unfinished.${mode}`, { build });
        const runtime = createEditor({
          plugins: [plugin],
          initialSelection: { kind: 'text', anchor: point, focus: point },
          initialValue: {
            children: [paragraph('one')],
            roots: { header: [paragraph('one')] },
          },
        });
        const editor =
          root === 'main' ? runtime : createEditorView(runtime, { root });
        const before = editor.read.runtime.snapshot();
        const { version } = editor.read.runtime.snapshot();
        let notifications = 0;
        let commits = 0;
        runtime.subscribe(() => {
          notifications += 1;
        });
        runtime.subscribeCommit(() => {
          commits += 1;
        });

        try {
          assert.throws(() => {
            switch (mode) {
              case 'callback':
              case 'configured callback': {
                editor.update(
                  mode === 'configured callback' ? { tags: 'configured' } : {},
                  (tx, context) =>
                    start(
                      () => {
                        tx.text.insert('!', { at: point });
                        tx.setField(field, 'partial');
                        tx.tags.add('partial');
                        context.afterCommit(() => {
                          afterCommits += 1;
                        });
                      },
                      () => tx.text.insert('?', { at: point })
                    )
                );
                break;
              }
              case 'direct plugin': {
                editor.update.unfinished.append();
                break;
              }
              case 'configured plugin': {
                editor.update({ tags: 'configured' }).unfinished.append();
                break;
              }
              case 'plugin portal': {
                editor.plugin(plugin).update.append();
                break;
              }
              case 'configured portal': {
                editor.plugin(plugin).update({ tags: 'configured' }).append();
                break;
              }
              case 'ignored plugin result': {
                editor.update((tx) => {
                  tx.unfinished.append();
                });
                break;
              }
              case 'nested method': {
                editor.update.unfinished.nested.append();
                break;
              }
              case 'callable method': {
                editor.update.unfinished.nested();
                break;
              }
              case 'tx-only method': {
                editor.update((tx) => {
                  tx.unfinished.scoped();
                });
                break;
              }
              case 'pure spec':
              case 'extended spec': {
                editor.read((state) =>
                  build({ input: undefined, state, tags: [] })
                );
                break;
              }
              case 'command':
              case 'extended command': {
                editor.update.command(command);
                break;
              }
            }
          }, /must be synchronous/);
          assert.deepEqual(editor.read.runtime.snapshot(), before);
          assert.equal(editor.read.runtime.snapshot().version, version);
          assert.equal(editor.read.getField(field), '');
          assert.equal(runtime.read.text.string([]), 'one');
          assert.equal(notifications, 0);
          assert.equal(commits, 0);
          assert.equal(afterCommits, 0);
        } finally {
          const rejected =
            pending &&
            assert.rejects(pending, /transaction is no longer active/);
          release();
          await rejected;
        }

        assert.deepEqual(editor.read.runtime.snapshot(), before);
        editor.update.text.insert('ok', { at: point });
        assert.equal(editor.read.text.string([]), 'oneok');
        assert.equal(editor.read.runtime.snapshot().version, version + 1);
        assert.equal(commits, 1);
        assert.equal(afterCommits, 0);
      });
    }
  }

  it('preserves Promise-valued reads, method aliases and synchronous results', async () => {
    const result = Promise.resolve('read');
    const shared = () => result;
    const plugin = definePlugin('mixed', {
      read: () => ({ read: shared, nested: { read: shared } }),
      update: ({ tx }) => ({
        writeAlias: shared,
        markedRead: txRead(() => result),
        append() {
          tx.text.insert('!', { at: point });

          return false;
        },
      }),
    });
    const readOnly = definePlugin('readOnly', {
      read: () => ({ value: () => result }),
    });
    const editor = createEditor({
      plugins: [plugin, readOnly],
      initialValue: [paragraph('one')],
    });

    assert.equal(editor.read.mixed.read(), result);
    editor.update((tx) => {
      assert.equal(tx.mixed.read(), result);
      assert.equal(tx.mixed.nested.read(), result);
      assert.equal(tx.mixed.markedRead(), result);
      assert.equal(tx.readOnly.value(), result);
      assert.equal(tx.mixed.read, tx.mixed.nested.read);
      assert.throws(() => tx.mixed.writeAlias(), /must be synchronous/);
    });
    assert.equal(editor.update.mixed.append(), false);
    assert.equal(editor.read.text.string([]), 'one!');
    assert.equal(await result, 'read');
  });

  for (const result of [
    { then() {} },
    Object.assign(() => {}, { then() {} }),
  ]) {
    it(`rejects a ${typeof result} thenable from plugins and specs`, () => {
      const plugin = definePlugin('thenable', {
        update: ({ tx }) => ({
          append() {
            tx.text.insert('!', { at: point });

            return result;
          },
        }),
      });
      const editor = createEditor({
        plugins: [plugin],
        initialValue: [paragraph('one')],
      });

      assert.throws(
        () => editor.update.thenable.append(),
        /must be synchronous/
      );
      assert.throws(
        () =>
          editor.read((state) =>
            state.transaction((tx) => {
              tx.text.insert('!', { at: point });

              return result;
            })
          ),
        /must be synchronous/
      );
      assert.throws(
        () =>
          editor.read((state) =>
            state.transaction((tx) => {
              tx.thenable.append();
            })
          ),
        /must be synchronous/
      );
      assert.equal(editor.read.text.string([]), 'one');
      assert.equal(editor.read.runtime.snapshot().version, 0);
    });
  }
});
