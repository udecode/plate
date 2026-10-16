import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  definePlugin,
  definePluginSlot,
  PluginPublicationError,
} from 'plitejs';

import {
  createDormantEditor,
  releaseEditor,
  startEditor,
} from '../src/internal';

const paragraph = (text: string) => ({
  children: [{ text }],
  type: 'paragraph',
});

const resourcePlugin = (name: string, log: string[], label = name) =>
  definePlugin(name, {
    activate({ acquire, afterPublish, beforePublish, onCleanup }) {
      log.push(`${label}:activate`);
      beforePublish(() => log.push(`${label}:beforePublish`));
      acquire(() => {
        log.push(`${label}:take`);

        return ({ reason }) => log.push(`${label}:release:${reason}`);
      });
      afterPublish(() => log.push(`${label}:afterPublish`));
      onCleanup(({ reason }) => log.push(`${label}:cleanup:${reason}`));
    },
  });

const throwingTake = (name: string) =>
  definePlugin(name, {
    activate({ acquire }) {
      acquire(() => {
        throw new Error(`${name} cannot take`);
      });
    },
  });

describe('editor lifetime', () => {
  it('takes outside resources after every plugin passed beforePublish', () => {
    const log: string[] = [];

    createEditor({
      initialValue: [paragraph('a')],
      plugins: [resourcePlugin('a', log), resourcePlugin('b', log)],
    });

    assert.deepEqual(log, [
      'a:activate',
      'b:activate',
      'a:beforePublish',
      'b:beforePublish',
      'a:take',
      'b:take',
      'a:afterPublish',
      'b:afterPublish',
    ]);
  });

  it('takes for a replacement before the replaced plugin cleans up', () => {
    const log: string[] = [];
    const slot = definePluginSlot('resource');
    const editor = createEditor({
      initialValue: [paragraph('a')],
      plugins: [slot.of(resourcePlugin('resource', log, 'old'))],
    });

    log.length = 0;
    editor.update((tx) => {
      tx.plugins.reconfigure(slot, resourcePlugin('resource', log, 'new'));
    });

    assert.deepEqual(log, [
      'new:activate',
      'new:beforePublish',
      'new:take',
      'old:release:replace',
      'old:cleanup:replace',
      'new:afterPublish',
    ]);
  });

  it('takes nothing when a later beforePublish rejects the publication', () => {
    const log: string[] = [];

    assert.throws(() =>
      createEditor({
        initialValue: [paragraph('a')],
        plugins: [
          resourcePlugin('a', log),
          definePlugin('reject', {
            activate({ beforePublish }) {
              beforePublish(() => {
                throw new Error('rejected');
              });
            },
          }),
        ],
      })
    );

    assert.equal(log.includes('a:take'), false);
  });

  it('rolls construction back and releases earlier takes when a take throws', () => {
    const log: string[] = [];

    assert.throws(
      () =>
        createEditor({
          initialValue: [paragraph('a')],
          plugins: [
            resourcePlugin('a', log),
            resourcePlugin('b', log),
            throwingTake('c'),
          ],
        }),
      (error) =>
        error instanceof PluginPublicationError &&
        error.phase === 'acquire' &&
        error.pluginName === 'c'
    );

    assert.deepEqual(log.slice(log.indexOf('b:take') + 1), [
      'b:release:rollback',
      'a:release:rollback',
      'b:cleanup:rollback',
      'a:cleanup:rollback',
    ]);
  });

  it('leaves an editor unchanged when a take throws during install', () => {
    const log: string[] = [];
    const editor = createEditor({ initialValue: [paragraph('a')] });
    const version = editor.read.lastCommit()?.version ?? 0;

    assert.throws(() =>
      editor.install([resourcePlugin('a', log), throwingTake('b')])
    );

    assert.deepEqual(
      {
        installed: Object.hasOwn(editor.api, 'a'),
        released: log.filter((entry) => entry.includes('release')),
        version: editor.read.lastCommit()?.version ?? 0,
      },
      { installed: false, released: ['a:release:rollback'], version }
    );
  });

  it('refuses an editor update inside a take', () => {
    assert.throws(
      () =>
        createEditor({
          initialValue: [paragraph('a')],
          plugins: [
            definePlugin('writer', {
              activate({ acquire, editor }) {
                acquire(() => {
                  editor.update((tx) => {
                    tx.text.insert('!', { at: { offset: 1, path: [0, 0] } });
                  });

                  return () => {};
                });
              },
            }),
          ],
        }),
      (error) =>
        error instanceof PluginPublicationError && error.phase === 'acquire'
    );
  });

  it('takes nothing for a dormant editor until it starts', () => {
    const log: string[] = [];
    const editor = createDormantEditor({
      initialValue: [paragraph('a')],
      plugins: [resourcePlugin('a', log)],
    });
    const beforeStart = log.includes('a:take');

    startEditor(editor);

    assert.deepEqual(
      { afterStart: log.at(-1), beforeStart },
      { afterStart: 'a:take', beforeStart: false }
    );
  });

  it('lets a failed start release its takes and retry', () => {
    const log: string[] = [];
    let fail = true;
    const editor = createDormantEditor({
      initialValue: [paragraph('a')],
      plugins: [
        resourcePlugin('a', log),
        definePlugin('flaky', {
          activate({ acquire }) {
            acquire(() => {
              if (fail) throw new Error('busy');

              return () => {};
            });
          },
        }),
      ],
    });

    assert.throws(() => startEditor(editor), /busy/);
    fail = false;
    startEditor(editor);

    assert.deepEqual(
      log.filter(
        (entry) => entry.includes('take') || entry.includes('release')
      ),
      ['a:take', 'a:release:rollback', 'a:take']
    );
  });

  it('releases every take, then cleans up, when the editor is destroyed', () => {
    const log: string[] = [];
    const editor = createEditor({
      initialValue: [paragraph('a')],
      plugins: [resourcePlugin('a', log), resourcePlugin('b', log)],
    });

    log.length = 0;
    editor.destroy();
    editor.destroy();

    assert.deepEqual(log, [
      'b:release:remove',
      'a:release:remove',
      'b:cleanup:remove',
      'a:cleanup:remove',
    ]);
  });

  it('keeps releasing when one release throws', () => {
    const log: string[] = [];
    const errors: unknown[] = [];
    const editor = createEditor({
      initialValue: [paragraph('a')],
      lifecycleErrorSink: (error) => errors.push(error.cause),
      plugins: [
        resourcePlugin('a', log),
        definePlugin('broken', {
          activate({ acquire }) {
            acquire(() => () => {
              throw new Error('release failed');
            });
          },
        }),
      ],
    });

    editor.destroy();

    assert.deepEqual(
      {
        errors: errors.map(String),
        released: log.filter((entry) => entry.includes('release')),
      },
      {
        errors: ['Error: release failed'],
        released: ['a:release:remove'],
      }
    );
  });

  it('releases an installed take once through its uninstall handle', () => {
    const log: string[] = [];
    const editor = createEditor({ initialValue: [paragraph('a')] });
    const uninstall = editor.install(resourcePlugin('a', log));

    uninstall();
    editor.destroy();

    assert.deepEqual(
      log.filter((entry) => entry.includes('release')),
      ['a:release:remove']
    );
  });

  it('refuses updates and installs after destroy', () => {
    const editor = createEditor({ initialValue: [paragraph('a')] });

    editor.destroy();

    assert.throws(() => editor.update(() => {}), /destroyed/);
    assert.throws(() => editor.install(resourcePlugin('a', [])), /destroyed/);
  });

  it('ignores an uninstall handle called after destroy', () => {
    const editor = createEditor({ initialValue: [paragraph('a')] });
    const uninstall = editor.install(resourcePlugin('a', []));

    editor.destroy();

    assert.doesNotThrow(uninstall);
  });

  it('releases once when a release ends the editor again', () => {
    const log: string[] = [];
    const editor = createEditor({
      initialValue: [paragraph('a')],
      plugins: [
        definePlugin('channel', {
          activate({ acquire, editor: current, onCleanup }) {
            acquire(() => () => {
              log.push('release');
              current.destroy();
            });
            onCleanup(() => log.push('cleanup'));
          },
        }),
      ],
    });

    editor.destroy();

    assert.deepEqual(log, ['release', 'cleanup']);
  });

  it('finishes every release of a plugin before its cleanup when a release ends the released editor', () => {
    const log: string[] = [];
    const editor = createDormantEditor({
      initialValue: [paragraph('a')],
      plugins: [
        definePlugin('channel', {
          activate({ acquire, editor: current, onCleanup }) {
            acquire(() => () => log.push('first:release'));
            acquire(() => () => {
              log.push('second:release');
              current.destroy();
            });
            onCleanup(() => log.push('cleanup'));
          },
        }),
      ],
    });

    startEditor(editor);
    releaseEditor(editor);

    assert.deepEqual(log, ['second:release', 'first:release', 'cleanup']);
  });

  it('finishes the releases of every plugin before any cleanup when a release ends the released editor', () => {
    const log: string[] = [];
    const editor = createDormantEditor({
      initialValue: [paragraph('a')],
      plugins: [
        resourcePlugin('first', log),
        definePlugin('second', {
          activate({ acquire, editor: current, onCleanup }) {
            acquire(() => () => {
              log.push('second:release');
              current.destroy();
            });
            onCleanup(() => log.push('second:cleanup'));
          },
        }),
      ],
    });

    startEditor(editor);
    log.length = 0;
    releaseEditor(editor);

    assert.deepEqual(log, [
      'second:release',
      'first:release:remove',
      'second:cleanup',
      'first:cleanup:remove',
    ]);
  });
});
