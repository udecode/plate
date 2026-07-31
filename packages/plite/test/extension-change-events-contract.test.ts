import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  defineEditorSchema,
  defineEditorExtension,
  schema,
  type SnapshotIndex,
} from '@platejs/plite';

import {
  forEachEditorNodeChange,
  hasChangedRuntimeAncestor,
} from '../src/core/change-events';

const paragraph = (text: string) => ({
  children: [{ text }],
  type: 'p',
});

const section = (text: string) => ({
  children: [paragraph(text)],
  type: 'section',
});

describe('extension change events', () => {
  it('runs every installed lifecycle listener', () => {
    const calls: string[] = [];
    const editor = createEditor({
      extensions: [
        defineEditorExtension({
          name: 'first-lifecycle-listener',
          on: {
            commit() {
              calls.push('first');
            },
          },
        }),
        defineEditorExtension({
          name: 'second-lifecycle-listener',
          on: {
            commit() {
              calls.push('second');
            },
          },
        }),
      ],
      initialValue: [paragraph('one')],
    });

    editor.update.text.insert('!', {
      at: { offset: 3, path: [0, 0] },
    });

    assert.deepEqual(calls, ['first', 'second']);
  });

  it('notifies node changes from committed semantic intents', () => {
    const events: unknown[] = [];
    const editor = createEditor({
      extensions: [
        defineEditorExtension({
          name: 'node-observer',
          on: {
            nodeChange(context) {
              events.push({
                kind: context.kind,
                node: context.node,
                path: context.path,
                previousPath: context.previousPath,
                prevNode: context.prevNode,
                root: context.root,
              });
            },
          },
        }),
      ],
      initialValue: [{ children: [{ text: 'hello' }], type: 'p' }],
    });

    editor.update.nodes.set({ variant: 'lead' } as never, { at: [0] });

    assert.deepEqual(events, [
      {
        kind: 'update',
        node: {
          children: [{ text: 'hello' }],
          type: 'p',
          variant: 'lead',
        },
        path: [0],
        previousPath: [0],
        prevNode: {
          children: [{ text: 'hello' }],
          type: 'p',
        },
        root: undefined,
      },
    ]);
  });

  it('notifies text changes from committed semantic intents', () => {
    const events: unknown[] = [];
    const editor = createEditor({
      extensions: [
        defineEditorExtension({
          name: 'text-observer',
          on: {
            textChange(context) {
              events.push({
                node: context.node,
                path: context.path,
                previousPath: context.previousPath,
                prevText: context.prevText,
                root: context.root,
                text: context.text,
              });
            },
          },
        }),
      ],
      initialSelection: {
        kind: 'text' as const,
        anchor: { offset: 5, path: [0, 0] },
        focus: { offset: 5, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'hello' }], type: 'p' }],
    });

    editor.update.text.insert('!');

    assert.deepEqual(events, [
      {
        node: {
          children: [{ text: 'hello!' }],
          type: 'p',
        },
        path: [0, 0],
        previousPath: [0, 0],
        prevText: 'hello',
        root: undefined,
        text: 'hello!',
      },
    ]);
  });

  it('emits one structural event per inserted subtree in primary and named roots', () => {
    const events: unknown[] = [];
    const editor = createEditor({
      extensions: [
        defineEditorExtension({
          name: 'node-observer',
          on: {
            nodeChange({ kind, path, root }) {
              events.push({ kind, path, root });
            },
          },
        }),
      ],
      initialValue: {
        children: [paragraph('main'), section('existing main section')],
        roots: {
          comments: [paragraph('comment'), section('existing comment section')],
        },
      },
    });
    const comments = editor.read.root('comments');

    editor.update((tx) => {
      tx.nodes.insert(section('main child'), { at: [2] });
      tx.roots.replace('comments', [...comments, section('comment child')]);
    });
    editor.update((tx) => {
      tx.nodes.remove({ at: [2] });
      tx.roots.replace('comments', [...comments]);
    });

    assert.deepEqual(events, [
      { kind: 'insert', path: [2], root: undefined },
      { kind: 'insert', path: [2], root: 'comments' },
      { kind: 'remove', path: [2], root: undefined },
      { kind: 'remove', path: [2], root: 'comments' },
    ]);
  });

  it('does not report ordinary sibling shifts as moves', () => {
    const events: unknown[] = [];
    const editor = createEditor({
      extensions: [
        defineEditorExtension({
          name: 'node-observer',
          on: {
            nodeChange({ kind, path, previousPath }) {
              events.push({ kind, path, previousPath });
            },
          },
        }),
      ],
      initialValue: [section('alpha'), section('beta')],
    });

    editor.update.nodes.insert(section('inserted'), { at: [0] });
    editor.update.nodes.remove({ at: [0] });

    assert.deepEqual(events, [
      { kind: 'insert', path: [0], previousPath: null },
      { kind: 'remove', path: [0], previousPath: [0] },
    ]);
  });

  it('reports only the maximal node for a real subtree move', () => {
    const events: unknown[] = [];
    const editor = createEditor({
      extensions: [
        defineEditorExtension({
          name: 'node-observer',
          on: {
            nodeChange({ kind, path, previousPath }) {
              events.push({ kind, path, previousPath });
            },
          },
        }),
      ],
      initialValue: [section('alpha'), section('beta'), section('gamma')],
    });

    editor.update.nodes.move({ at: [2], to: [0] });

    assert.deepEqual(events, [{ kind: 'move', path: [0], previousPath: [2] }]);
  });

  it('preserves insert, remove, and move laws across sibling widths', () => {
    for (let size = 2; size <= 8; size++) {
      for (let index = 0; index <= size; index++) {
        const events: unknown[] = [];
        const editor = createEditor({
          extensions: [
            defineEditorExtension({
              name: `insert-observer-${size}-${index}`,
              on: {
                nodeChange({ kind, node, path, previousPath }) {
                  events.push({ kind, node, path, previousPath });
                },
              },
            }),
          ],
          initialValue: Array.from({ length: size }, (_, item) =>
            section(`item-${item}`)
          ),
        });

        editor.update.nodes.insert(section('inserted'), { at: [index] });

        assert.deepEqual(events, [
          {
            kind: 'insert',
            node: section('inserted'),
            path: [index],
            previousPath: null,
          },
        ]);
      }

      for (let index = 0; index < size; index++) {
        const events: unknown[] = [];
        const editor = createEditor({
          extensions: [
            defineEditorExtension({
              name: `remove-observer-${size}-${index}`,
              on: {
                nodeChange({ kind, node, path, previousPath, prevNode }) {
                  events.push({ kind, node, path, previousPath, prevNode });
                },
              },
            }),
          ],
          initialValue: Array.from({ length: size }, (_, item) =>
            section(`item-${item}`)
          ),
        });

        editor.update.nodes.remove({ at: [index] });

        assert.deepEqual(events, [
          {
            kind: 'remove',
            node: null,
            path: [index],
            previousPath: [index],
            prevNode: section(`item-${index}`),
          },
        ]);
      }

      for (let source = 0; source < size; source++) {
        for (let target = 0; target < size; target++) {
          if (source === target) continue;

          const events: unknown[] = [];
          const editor = createEditor({
            extensions: [
              defineEditorExtension({
                name: `move-observer-${size}-${source}-${target}`,
                on: {
                  nodeChange({ kind, node, path, previousPath }) {
                    events.push({ kind, node, path, previousPath });
                  },
                },
              }),
            ],
            initialValue: Array.from({ length: size }, (_, item) =>
              section(`item-${item}`)
            ),
          });

          editor.update.nodes.move({ at: [source], to: [target] });

          assert.deepEqual(events, [
            {
              kind: 'move',
              node: section(`item-${source}`),
              path: [target],
              previousPath: [source],
            },
          ]);
        }
      }
    }
  });

  it('reports a cross-parent move separately from schema default insertion', () => {
    const events: unknown[] = [];
    const documentSchema = defineEditorSchema({
      elements: {
        paragraph: {
          content: schema.content.text({ default: 'text', min: 1 }),
        } as const,
        section: {
          content: schema.content.group('block', {
            default: { type: 'paragraph' },
            min: 1,
          }),
        } as const,
      },
      id: 'change-event-default-insertion',
      root: schema.content.type('section'),
      unknown: 'reject',
      version: 1,
    });
    const editor = createEditor({
      extensions: [
        documentSchema,
        defineEditorExtension({
          name: 'cross-parent-observer',
          on: {
            nodeChange({ kind, node, path, previousPath }) {
              events.push({ kind, node, path, previousPath });
            },
          },
        }),
      ],
      initialValue: [
        {
          children: [{ children: [{ text: 'moved' }], type: 'paragraph' }],
          type: 'section',
        },
        {
          children: [{ children: [{ text: 'target' }], type: 'paragraph' }],
          type: 'section',
        },
      ],
    });

    editor.update.nodes.move({ at: [0, 0], to: [1, 1] });

    assert.deepEqual(events, [
      {
        kind: 'move',
        node: { children: [{ text: 'moved' }], type: 'paragraph' },
        path: [1, 1],
        previousPath: [0, 0],
      },
      {
        kind: 'insert',
        node: { children: [{ text: '' }], type: 'paragraph' },
        path: [0, 0],
        previousPath: null,
      },
    ]);
  });

  it('keeps a sparse 10000-block insertion off full snapshot indexes', () => {
    const editor = createEditor({
      initialValue: Array.from({ length: 10_000 }, (_, index) =>
        paragraph(`item-${index}`)
      ),
    });
    const before = editor.read.value();

    editor.update.nodes.insert(paragraph('inserted'), { at: [5000] });

    const after = editor.read.value();
    const commit = editor.read.lastCommit();

    assert.ok(commit);

    const work = { entries: 0, idAt: 0, pathOf: 0 };
    const count = (index: SnapshotIndex): SnapshotIndex => ({
      entries() {
        work.entries += 1;
        throw new Error('sparse change events must not materialize entries');
      },
      idAt(path) {
        work.idAt += 1;
        return index.idAt(path);
      },
      pathOf(runtimeId) {
        work.pathOf += 1;
        return index.pathOf(runtimeId);
      },
    });
    const instrumentedCommit = {
      ...commit,
      after: { ...commit.after, index: count(commit.after.index) },
      before: { ...commit.before, index: count(commit.before.index) },
    } as typeof commit;
    const events: unknown[] = [];

    forEachEditorNodeChange(
      editor,
      instrumentedCommit,
      before,
      after,
      ({ kind, path, previousPath }) => {
        events.push({ kind, path, previousPath });
      }
    );

    assert.deepEqual(events, [
      { kind: 'insert', path: [5000], previousPath: null },
    ]);
    assert.equal(work.entries, 0);
    assert.equal(work.pathOf, 0);
    assert.ok(
      work.idAt <= 16,
      `expected bounded idAt work, received ${work.idAt}`
    );
  });

  it('checks only ancestor paths and handles document-root boundaries', () => {
    let entriesCalls = 0;
    let idAtCalls = 0;
    const index = {
      entries() {
        entriesCalls += 1;
        throw new Error('ancestor lookup must not scan the snapshot index');
      },
      idAt(path: readonly number[]) {
        idAtCalls += 1;
        return path.length === 1 ? 'changed-parent' : null;
      },
    } as unknown as SnapshotIndex;
    const changed = new Set(['changed-parent']);

    assert.equal(hasChangedRuntimeAncestor(changed, index, []), false);
    assert.equal(hasChangedRuntimeAncestor(changed, index, [0]), false);
    assert.equal(idAtCalls, 0);

    assert.equal(hasChangedRuntimeAncestor(changed, index, [7, 3, 1]), true);
    assert.equal(idAtCalls, 1);
    assert.equal(entriesCalls, 0);

    idAtCalls = 0;
    assert.equal(hasChangedRuntimeAncestor(new Set(), index, [7, 3, 1]), false);
    assert.equal(idAtCalls, 2);
    assert.equal(entriesCalls, 0);
  });
});
