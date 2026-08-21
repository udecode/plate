import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  defineCommand,
  defineExtension,
  editorReads,
  type Element,
  type NodeEntry,
  SelectionApi,
} from '@platejs/plite';
import { dispatchCommand } from '@platejs/plite/internal';

import { defineRead } from '../src/core/read-definition';
import { executeEditorRead } from '../src/core/read-registry';

const entry = (text: string, path: number): NodeEntry<Element> => [
  { children: [{ text }], type: 'paragraph' },
  [path],
];

describe('descriptor-based extension read middleware', () => {
  it('composes descriptor middleware in extension order', () => {
    const seen: string[] = [];
    const first = defineExtension('first-merge-read', {
      readMiddleware: ({ around }) => [
        around(editorReads.nodes.shouldMergeNodesRemovePrevNode, ({ next }) => {
          seen.push('first:before');
          const result = next();
          seen.push('first:after');

          return result;
        }),
      ],
    });
    const second = defineExtension('second-merge-read', {
      readMiddleware: ({ around }) => [
        around(editorReads.nodes.shouldMergeNodesRemovePrevNode, ({ next }) => {
          seen.push('second');
          next();

          return false;
        }),
      ],
    });
    const current = entry('current', 1);
    const previous = entry('', 0);
    const editor = createEditor({ extensions: [first, second] });

    assert.equal(
      editor.read.nodes.shouldMergeNodesRemovePrevNode(previous, current),
      false
    );
    assert.deepEqual(seen, ['first:before', 'second', 'first:after']);
  });

  it('lets read middleware veto a schema-selectable node', () => {
    const allow = defineExtension('allow-selection', {
      readMiddleware: ({ around }) => [
        around(editorReads.nodes.isSelectable, ({ next }) => next()),
      ],
    });
    const deny = defineExtension('deny-selection', {
      readMiddleware: ({ around }) => [
        around(editorReads.nodes.isSelectable, () => false),
      ],
    });
    const editor = createEditor({ extensions: [allow, deny] });

    assert.equal(editor.read.nodes.isSelectable(entry('text', 0)[0]), false);
  });

  it('runs middleware inside the pure read boundary', () => {
    const impure = defineExtension('impure-selection-policy', {
      readMiddleware: ({ around }) => [
        around(editorReads.nodes.isSelectable, ({ editor }) => {
          editor.update(() => {});

          return false;
        }),
      ],
    });
    const editor = createEditor({ extensions: [impure] });

    assert.throws(
      () => editor.read.nodes.isSelectable(entry('text', 0)[0]),
      /editor\.update cannot be started inside editor\.read/
    );
  });

  it('composes export projections once in extension order', () => {
    const seen: string[] = [];
    const first = defineExtension('first-export', {
      readMiddleware: ({ around }) => [
        around(editorReads.slice.export, ({ next }) => {
          seen.push('first');

          return next();
        }),
      ],
    });
    const second = defineExtension('second-export', {
      readMiddleware: ({ around }) => [
        around(editorReads.slice.export, ({ next }) => {
          seen.push('second');

          return next();
        }),
      ],
    });
    const editor = createEditor({
      extensions: [first, second],
      initialSelection: SelectionApi.text({
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      }),
      initialValue: [entry('text', 0)[0]],
    });

    assert.deepEqual(editor.read.slice.export().content, [entry('text', 0)[0]]);
    assert.deepEqual(seen, ['first', 'second']);
  });

  it('rejects duplicate descriptor ids', () => {
    const first = defineRead<void, boolean>('test:duplicate-read');
    const second = defineRead<void, boolean>('test:duplicate-read');
    const editor = createEditor({
      extensions: [
        defineExtension('first-duplicate-read', {
          readMiddleware: ({ around }) => [around(first, ({ next }) => next())],
        }),
      ],
    });

    assert.throws(
      () =>
        editor.install(
          defineExtension('second-duplicate-read', {
            readMiddleware: ({ around }) => [
              around(second, ({ next }) => next()),
            ],
          })
        ),
      /cannot install multiple descriptor identities/
    );
  });

  it('rejects delegating twice', () => {
    const read = defineRead<void, boolean>('test:double-next-read');
    const editor = createEditor({
      extensions: [
        defineExtension('double-next-read', {
          readMiddleware: ({ around }) => [
            around(read, ({ next }) => {
              next();

              assert.throws(() => next(), /handlers may delegate only once/);

              return true;
            }),
          ],
        }),
      ],
    });

    assert.equal(
      executeEditorRead(editor, read, undefined, () => false),
      true
    );
  });

  it('preserves an intentional undefined result after delegation', () => {
    const read = defineRead<void, boolean | undefined>(
      'test:undefined-read-result'
    );
    const editor = createEditor({
      extensions: [
        defineExtension('undefined-read-result', {
          readMiddleware: ({ around }) => [
            around(read, ({ next }) => {
              assert.equal(next(), true);

              // Explicit undefined is the middleware override under test.
              return undefined;
            }),
          ],
        }),
      ],
    });

    assert.equal(
      executeEditorRead(editor, read, undefined, () => true),
      undefined
    );
  });

  it('reads the active transaction draft', () => {
    const seen: string[] = [];
    const inspect = defineCommand('test:inspect-read-draft');
    const editor = createEditor({
      extensions: [
        defineExtension('transaction-local-read', {
          commands: ({ around, handle }) => [
            around(inspect, ({ state, next }) =>
              next.after(
                state.transaction((tx) => {
                  tx.text.insert('!', {
                    at: { offset: 4, path: [0, 0] },
                  });
                })
              )
            ),
            handle(inspect, ({ state }) => {
              state.nodes.isSelectable(entry('text', 0)[0]);

              return state.transaction((tx) =>
                tx.tags.add('read-draft-observed')
              );
            }),
          ],
          readMiddleware: ({ around }) => [
            around(editorReads.nodes.isSelectable, ({ next, state }) => {
              seen.push(state.text.string([0]));

              return next();
            }),
          ],
        }),
      ],
      initialValue: [entry('text', 0)[0]],
    });

    dispatchCommand(editor, inspect);

    assert.deepEqual(seen, ['text!']);
  });

  it('keeps lazy handler cleanup inside the read boundary', () => {
    const read = defineRead<void, Generator<number, void>>(
      'test:generator-read'
    );
    const editor = createEditor({
      extensions: [
        defineExtension('generator-read', {
          readMiddleware: ({ around }) => [
            around(read, ({ editor, next }) =>
              (function* lazyReadMiddleware() {
                try {
                  yield* next();
                } finally {
                  editor.update(() => {});
                }
              })()
            ),
          ],
        }),
      ],
    });
    const result = executeEditorRead(
      editor,
      read,
      undefined,
      function* executeGeneratorRead() {
        yield 1;
      }
    );

    assert.throws(() => {
      for (const _value of result) break;
    }, /editor\.update cannot be started inside editor\.read/);
  });

  it('preserves the complete generator protocol through middleware', () => {
    const read = defineRead<void, Generator<number, string, unknown>>(
      'test:generator-protocol-read'
    );
    const marker = new Error('resume');
    let caught = false;
    let cleaned = false;
    const editor = createEditor({
      extensions: [
        defineExtension('generator-protocol-read', {
          readMiddleware: ({ around }) => [
            around(read, ({ next }) =>
              (function* protocolReadMiddleware() {
                return yield* next();
              })()
            ),
          ],
        }),
      ],
    });
    const result = executeEditorRead(
      editor,
      read,
      undefined,
      function* executeProtocolRead() {
        try {
          yield 1;
        } catch (error) {
          assert.equal(error, marker);
          caught = true;
          yield 2;
        } finally {
          cleaned = true;
        }

        return 'done';
      }
    );

    assert.deepEqual(result.next(), { done: false, value: 1 });
    assert.deepEqual(result.throw(marker), { done: false, value: 2 });
    assert.equal(caught, true);
    assert.deepEqual(result.return('stopped'), {
      done: true,
      value: 'stopped',
    });
    assert.equal(cleaned, true);
  });
});
