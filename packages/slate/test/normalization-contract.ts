import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Editor, getEditorRuntime } from '@platejs/slate/internal';
import { createEditor, type Descendant } from '../src';

describe('slate normalization contract', () => {
  it('repairs an empty block with an empty text child', () => {
    const editor = createEditor();

    Editor.replace(editor, {
      children: [{ type: 'block', children: [] } as Descendant],
      selection: null,
      marks: null,
    });

    assert.deepEqual(Editor.getSnapshot(editor).children, [
      { type: 'block', children: [{ text: '' }] },
    ]);
  });

  it('runs extension normalizers in order before the built-in fallback', () => {
    const editor = createEditor();
    const seen: string[] = [];

    editor.extend([
      {
        name: 'first-normalizer',
        normalizers: {
          node({ entry, next }) {
            if (entry[1].join('.') === '0') {
              seen.push('first');
            }

            next();
          },
        },
      },
      {
        name: 'second-normalizer',
        normalizers: {
          node({ entry, next }) {
            if (entry[1].join('.') === '0') {
              seen.push('second');
            }

            next();
          },
        },
      },
    ]);

    assert.equal(Editor.getExtensionRegistry(editor).normalizers.size, 2);

    Editor.replace(editor, {
      children: [{ type: 'block', children: [] } as Descendant],
      selection: null,
      marks: null,
    });

    assert.deepEqual(Editor.getSnapshot(editor).children, [
      { type: 'block', children: [{ text: '' }] },
    ]);
    assert.deepEqual(seen.slice(0, 2), ['first', 'second']);
  });

  it('routes editor root entries to editor normalizers and non-root entries to node normalizers', () => {
    const editor = createEditor();
    const seen: string[] = [];

    editor.extend({
      name: 'split-normalizers',
      normalizers: {
        editor({ next }) {
          seen.push('editor');
          next();
        },
        node({ entry, next }) {
          seen.push(`node:${entry[1].join('.')}`);
          next();
        },
      },
    });

    Editor.replace(editor, {
      children: [{ type: 'block', children: [] } as Descendant],
      selection: null,
      marks: null,
    });

    assert.deepEqual(Editor.getSnapshot(editor).children, [
      { type: 'block', children: [{ text: '' }] },
    ]);
    assert.equal(seen.includes('editor'), true);
    assert.equal(seen.includes('node:'), false);
    assert.equal(seen.includes('node:0'), true);
  });

  it('uses extension-local node normalizer ids for same-lane registration', () => {
    const editor = createEditor();
    const seen: string[] = [];

    editor.extend([
      {
        name: 'same-lane-a',
        normalizers: {
          node({ entry, next }) {
            if (entry[1].join('.') === '0') {
              seen.push('a');
            }

            next();
          },
        },
      },
      {
        name: 'same-lane-b',
        normalizers: {
          node({ entry, next }) {
            if (entry[1].join('.') === '0') {
              seen.push('b');
            }

            next();
          },
        },
      },
    ]);

    assert.deepEqual(
      [...Editor.getExtensionRegistry(editor).normalizers.keys()],
      ['same-lane-a:normalizers.node', 'same-lane-b:normalizers.node']
    );

    Editor.replace(editor, {
      children: [{ type: 'block', children: [] } as Descendant],
      selection: null,
      marks: null,
    });

    assert.deepEqual(seen.slice(0, 2), ['a', 'b']);
  });

  it('provides a scoped normalizer tx for one-repair reruns', () => {
    const editor = createEditor();
    let rootCalls = 0;

    editor.extend({
      name: 'layout-normalizer',
      normalizers: {
        editor({ next, tx }) {
          rootCalls += 1;

          if (tx.nodes.children().length < 2) {
            tx.nodes.insert(
              {
                type: 'paragraph',
                children: [{ text: '' }],
              } as Descendant,
              { at: [1] }
            );
            return;
          }

          next();
        },
      },
    });

    Editor.replace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'alpha' }],
        } as Descendant,
      ],
      selection: null,
      marks: null,
    });

    assert.deepEqual(Editor.getSnapshot(editor).children, [
      {
        type: 'paragraph',
        children: [{ text: 'alpha' }],
      },
      {
        type: 'paragraph',
        children: [{ text: '' }],
      },
    ]);
    assert.equal(rootCalls >= 2, true);
  });

  it('lets extension normalizers override fallback options and clean up', () => {
    const editor = createEditor();
    let calls = 0;

    const unextend = editor.extend({
      name: 'fallback-normalizer',
      normalizers: {
        editor({ next }) {
          calls += 1;
          next({
            fallbackElement: () => ({
              type: 'paragraph',
              children: [{ text: '' }],
            }),
          });
        },
      },
    });

    Editor.replace(editor, {
      children: [{ text: 'stray' } as Descendant],
      selection: null,
      marks: null,
    });

    assert.deepEqual(Editor.getSnapshot(editor).children, [
      {
        type: 'paragraph',
        children: [{ text: 'stray' }],
      },
    ]);
    assert.equal(calls > 0, true);

    unextend();
    calls = 0;

    Editor.normalize(editor);

    assert.equal(Editor.getExtensionRegistry(editor).normalizers.size, 0);
    assert.equal(calls, 0);
  });

  it('rejects calling normalizer next twice', () => {
    const editor = createEditor();

    editor.extend({
      name: 'double-next-normalizer',
      normalizers: {
        node({ next }) {
          next();
          assert.throws(
            () => next(),
            /Normalizer next\(\) cannot be called more than once\./
          );
        },
      },
    });

    Editor.replace(editor, {
      children: [{ type: 'block', children: [] } as Descendant],
      selection: null,
      marks: null,
    });
  });

  it('removes stray top-level text during replace-time block-only cleanup', () => {
    const editor = createEditor();

    Editor.replace(editor, {
      children: [
        { text: 'one' } as Descendant,
        { type: 'block', children: [{ text: 'two' }] } as Descendant,
        { text: 'three' } as Descendant,
        { type: 'block', children: [{ text: 'four' }] } as Descendant,
      ],
      selection: null,
      marks: null,
    });

    assert.deepEqual(Editor.getSnapshot(editor).children, [
      { type: 'block', children: [{ text: 'two' }] },
      { type: 'block', children: [{ text: 'four' }] },
    ]);
  });

  it('removes stray top-level text during node-op block-only cleanup', () => {
    const editor = createEditor();

    Editor.replace(editor, {
      children: [
        {
          type: 'block',
          children: [{ text: 'alpha' }],
        },
        {
          type: 'block',
          children: [{ text: 'beta' }],
        },
      ] as Descendant[],
      selection: null,
      marks: null,
    });

    editor.update((tx) => {
      tx.nodes.insert({ text: 'stray' }, { at: [0] });
    });

    assert.deepEqual(Editor.getSnapshot(editor).children, [
      {
        type: 'block',
        children: [{ text: 'alpha' }],
      },
      {
        type: 'block',
        children: [{ text: 'beta' }],
      },
    ]);
  });

  it('explicitly merges adjacent compatible text children in inline-style containers', () => {
    const editor = createEditor();

    Editor.replace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [
            { text: 'al', bold: true },
            { text: 'pha', bold: true },
          ],
        },
      ] as Descendant[],
      selection: null,
      marks: null,
    });

    Editor.normalize(editor);

    assert.deepEqual(Editor.getSnapshot(editor).children, [
      {
        type: 'paragraph',
        children: [{ text: 'alpha', bold: true }],
      },
    ]);
  });

  it('explicitly removes empty adjacent text in inline-style containers', () => {
    const editor = createEditor();

    Editor.replace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [
            { text: 'alpha', bold: true },
            { text: '', bold: true },
            { text: 'beta', bold: true },
          ],
        },
      ] as Descendant[],
      selection: null,
      marks: null,
    });

    Editor.normalize(editor);

    assert.deepEqual(Editor.getSnapshot(editor).children, [
      {
        type: 'paragraph',
        children: [{ text: 'alphabeta', bold: true }],
      },
    ]);
  });

  it('flattens a direct block child inserted into an inline-style container without merging unrelated text runs', () => {
    const editor = createEditor();

    Editor.replace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'alpha' }, { text: 'gamma' }],
        },
      ] as Descendant[],
      selection: null,
      marks: null,
    });

    editor.update((tx) => {
      tx.nodes.insert(
        {
          type: 'paragraph',
          children: [{ text: 'beta' }],
        } as Descendant,
        { at: [0, 1] }
      );
    });

    assert.deepEqual(Editor.getSnapshot(editor).children, [
      {
        type: 'paragraph',
        children: [{ text: 'alpha' }, { text: 'beta' }, { text: 'gamma' }],
      },
    ]);
  });

  it('fails deterministically when custom normalization revisits an earlier draft state', () => {
    const editor = createEditor();

    getEditorRuntime(editor).normalizeNode = (entry) => {
      const [node] = entry;

      if (!Editor.isEditor(node)) {
        return;
      }

      if (Editor.getChildren(editor).length === 1) {
        Editor.insertNodes(
          editor,
          {
            type: 'paragraph',
            children: [{ text: '' }],
          },
          { at: [1] }
        );
        return;
      }

      Editor.removeNodes(editor, { at: [1] });
    };

    assert.throws(() => {
      editor.update((tx) => {
        tx.value.replace({
          children: [
            {
              type: 'paragraph',
              children: [{ text: 'alpha' }],
            },
          ],
          marks: null,
          selection: null,
        });
      });
    }, /revisited an earlier draft state/);
  });

  it('rechecks a node transformed during custom normalization until it reaches fixpoint', () => {
    const editor = createEditor();
    const originalNormalizeNode = getEditorRuntime(editor).normalizeNode;

    getEditorRuntime(editor).normalizeNode = (entry, options) => {
      const [node, path] = entry;

      if (
        path.length === 1 &&
        !Editor.isEditor(node) &&
        'children' in node &&
        node.type === 'heading'
      ) {
        Editor.setNodes(editor, { type: 'paragraph' }, { at: path });
        return;
      }

      if (
        path.length === 1 &&
        !Editor.isEditor(node) &&
        'children' in node &&
        node.type === 'paragraph' &&
        (node as Descendant & { normalized?: boolean }).normalized !== true
      ) {
        Editor.setNodes(editor, { normalized: true }, { at: path });
        return;
      }

      originalNormalizeNode(entry, options);
    };

    editor.update((tx) => {
      tx.value.replace({
        children: [
          {
            type: 'heading',
            children: [{ text: 'alpha' }],
          },
        ],
        marks: null,
        selection: null,
      });
    });

    assert.deepEqual(Editor.getSnapshot(editor).children, [
      {
        type: 'paragraph',
        normalized: true,
        children: [{ text: 'alpha' }],
      },
    ]);
  });
});
