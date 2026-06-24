import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createEditor, type Descendant, defineEditorExtension } from '../src';

const children: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: 'one' }],
  },
  {
    type: 'paragraph',
    children: [{ text: 'two' }],
  },
];

describe('extension query middleware', () => {
  it('intercepts grouped state read methods through extension.queries', () => {
    const editor = createEditor();
    const seen: string[] = [];

    editorReplace(editor, {
      children,
      selection: {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 3 },
      },
      marks: null,
    });

    editor.extend(
      defineEditorExtension({
        name: 'query-spy',
        queries: {
          fragment: {
            get({ next, options }) {
              seen.push('fragment.get');

              return next({ options });
            },
          },
          nodes: {
            entries({ next, options }) {
              seen.push('nodes.entries');

              return next({ options });
            },
          },
          text: {
            string({ at, next, options }) {
              seen.push('text.string');

              return `${next({ at, options })}!`;
            },
          },
        },
      })
    );

    assert.deepEqual(
      editor.read((state) =>
        Array.from(
          state.nodes.entries({
            at: [],
            match: (node) => 'children' in node,
          })
        )
      ),
      [
        [children[0], [0]],
        [children[1], [1]],
      ]
    );
    assert.equal(
      editor.read((state) => state.text.string([0])),
      'one!'
    );
    assert.deepEqual(
      editor.read((state) => state.fragment.get()),
      [{ type: 'paragraph', children: [{ text: 'one' }] }]
    );
    assert.equal(editorString(editor, [1]), 'two!');
    assert.deepEqual(seen, [
      'nodes.entries',
      'text.string',
      'fragment.get',
      'text.string',
    ]);
  });

  it('uses fragment query middleware to strip transient copy metadata', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ bold: true, text: 'alpha', transientPreview: true }],
        },
      ],
      marks: null,
      selection: {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 5 },
      },
    });

    editor.extend(
      defineEditorExtension({
        name: 'strip-transient-copy-metadata',
        queries: {
          fragment: {
            get({ next, options }) {
              return next({ options }).map((node) => ({
                ...node,
                children: node.children.map((child) => {
                  if (!('transientPreview' in child)) {
                    return child;
                  }

                  const { transientPreview: _transientPreview, ...clean } =
                    child;

                  return clean;
                }),
              }));
            },
          },
        },
      })
    );

    assert.deepEqual(
      editor.read((state) => state.fragment.get()),
      [
        {
          type: 'paragraph',
          children: [{ bold: true, text: 'alpha' }],
        },
      ]
    );
    assert.deepEqual(editorGetSnapshot(editor).children, [
      {
        type: 'paragraph',
        children: [{ bold: true, text: 'alpha', transientPreview: true }],
      },
    ]);
  });

  it('provides read-only state to query middleware', () => {
    const editor = createEditor();
    const seenOffsets: number[] = [];
    let hasTx = true;

    editorReplace(editor, {
      children,
      selection: {
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 1 },
      },
      marks: null,
    });

    editor.extend(
      defineEditorExtension({
        name: 'query-state',
        queries: {
          text: {
            string(context) {
              hasTx = 'tx' in context;
              seenOffsets.push(
                context.state.selection.get()?.anchor.offset ?? -1
              );

              return context.next({
                at: context.at,
                options: context.options,
              });
            },
          },
        },
      })
    );

    assert.equal(editorString(editor, [0]), 'one');
    assert.deepEqual(seenOffsets, [1]);
    assert.equal(hasTx, false);
  });

  it('covers accepted grouped query keys', () => {
    const editor = createEditor();
    const seen: string[] = [];

    editorReplace(editor, {
      children,
      selection: {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 3 },
      },
      marks: null,
    });

    editor.extend(
      defineEditorExtension({
        elements: [{ type: 'image', void: 'block' }],
        name: 'all-query-spy',
        queries: {
          fragment: {
            get({ next, options }) {
              seen.push('fragment.get');

              return next({ options });
            },
          },
          marks: {
            get({ next }) {
              seen.push('marks.get');

              return next();
            },
          },
          nodes: {
            above({ next, options }) {
              seen.push('nodes.above');

              return next({ options });
            },
            children({ at, next }) {
              seen.push('nodes.children');

              return next({ at });
            },
            elementReadOnly({ next, options }) {
              seen.push('nodes.elementReadOnly');

              return next({ options });
            },
            entries({ next, options }) {
              seen.push('nodes.entries');

              return next({ options });
            },
            find({ next, options }) {
              seen.push('nodes.find');

              return next({ options });
            },
            first({ at, next }) {
              seen.push('nodes.first');

              return next({ at });
            },
            get({ at, next }) {
              seen.push('nodes.get');

              return next({ at });
            },
            hasBlocks({ element, next }) {
              seen.push('nodes.hasBlocks');

              return next({ element });
            },
            hasInlines({ element, next }) {
              seen.push('nodes.hasInlines');

              return next({ element });
            },
            hasPath({ next, path }) {
              seen.push('nodes.hasPath');

              return next({ path });
            },
            hasTexts({ element, next }) {
              seen.push('nodes.hasTexts');

              return next({ element });
            },
            isBlock({ element, next }) {
              seen.push('nodes.isBlock');

              return next({ element });
            },
            isEmpty({ element, next }) {
              seen.push('nodes.isEmpty');

              return next({ element });
            },
            last({ at, next }) {
              seen.push('nodes.last');

              return next({ at });
            },
            leaf({ at, next, options }) {
              seen.push('nodes.leaf');

              return next({ at, options });
            },
            levels({ next, options }) {
              seen.push('nodes.levels');

              return next({ options });
            },
            path({ at, next, options }) {
              seen.push('nodes.path');

              return next({ at, options });
            },
            next({ next, options }) {
              seen.push('nodes.next');

              return next({ options });
            },
            parent({ at, next, options }) {
              seen.push('nodes.parent');

              return next({ at, options });
            },
            previous({ next, options }) {
              seen.push('nodes.previous');

              return next({ options });
            },
            shouldMergeNodesRemovePrevNode({ current, next, previous }) {
              seen.push('nodes.shouldMergeNodesRemovePrevNode');

              return next({ current, previous });
            },
            some({ next, options }) {
              seen.push('nodes.some');

              return next({ options });
            },
            toArray({ map, next, options }) {
              seen.push('nodes.toArray');

              return next({ map, options });
            },
            void({ next, options }) {
              seen.push('nodes.void');

              return next({ options });
            },
          },
          points: {
            after({ at, next, options }) {
              seen.push('points.after');

              return next({ at, options });
            },
            before({ at, next, options }) {
              seen.push('points.before');

              return next({ at, options });
            },
            end({ at, next }) {
              seen.push('points.end');

              return next({ at });
            },
            get({ at, next, options }) {
              seen.push('points.get');

              return next({ at, options });
            },
            isEdge({ at, next, point }) {
              seen.push('points.isEdge');

              return next({ at, point });
            },
            isEnd({ at, next, point }) {
              seen.push('points.isEnd');

              return next({ at, point });
            },
            isStart({ at, next, point }) {
              seen.push('points.isStart');

              return next({ at, point });
            },
            positions({ next, options }) {
              seen.push('points.positions');

              return next({ options });
            },
            start({ at, next }) {
              seen.push('points.start');

              return next({ at });
            },
          },
          ranges: {
            edges({ at, next }) {
              seen.push('ranges.edges');

              return next({ at });
            },
            get({ at, next, to }) {
              seen.push('ranges.get');

              return next({ at, to });
            },
            project({ next, range }) {
              seen.push('ranges.project');

              return next({ range });
            },
            unhang({ next, options, range }) {
              seen.push('ranges.unhang');

              return next({ options, range });
            },
          },
          text: {
            string({ at, next, options }) {
              seen.push('text.string');

              return next({ at, options });
            },
          },
        },
      })
    );

    const paragraph = children[0]!;

    editor.read((state) => {
      state.fragment.get();
      state.marks.get();
      state.nodes.above({ at: [0, 0] });
      state.nodes.children();
      state.nodes.elementReadOnly({ at: [0] });
      Array.from(state.nodes.entries({ at: [] }));
      state.nodes.find({ at: [] });
      state.nodes.first([]);
      state.nodes.get([0]);
      state.nodes.hasBlocks(paragraph);
      state.nodes.hasInlines(paragraph);
      state.nodes.hasPath([0]);
      state.nodes.hasTexts(paragraph);
      state.nodes.isBlock(paragraph);
      state.nodes.isEmpty(paragraph);
      state.nodes.last([]);
      state.nodes.leaf([0, 0]);
      Array.from(state.nodes.levels({ at: [0, 0] }));
      state.nodes.path([0, 0]);
      state.nodes.next({ at: [0] });
      state.nodes.parent([0, 0]);
      state.nodes.previous({ at: [1] });
      state.nodes.shouldMergeNodesRemovePrevNode(
        [{ text: '' }, [0, 0]],
        [{ text: 'two' }, [1, 0]]
      );
      state.nodes.some({ at: [] });
      state.nodes.toArray({ at: [] });
      state.nodes.void();
      state.points.after([0, 0]);
      state.points.before([0, 0]);
      state.points.end([0]);
      state.points.get([0]);
      state.points.isEdge({ path: [0, 0], offset: 0 }, [0]);
      state.points.isEnd({ path: [0, 0], offset: 3 }, [0]);
      state.points.isStart({ path: [0, 0], offset: 0 }, [0]);
      Array.from(state.points.positions({ at: [0] }));
      state.points.start([0]);
      state.ranges.edges([0]);
      state.ranges.get([0]);
      state.ranges.project({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 1 },
      });
      state.ranges.unhang({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 1 },
      });
      state.text.string([0]);
    });

    assert.deepEqual(seen, [
      'fragment.get',
      'marks.get',
      'nodes.above',
      'nodes.children',
      'nodes.elementReadOnly',
      'nodes.entries',
      'nodes.find',
      'nodes.first',
      'nodes.get',
      'nodes.hasBlocks',
      'nodes.hasInlines',
      'nodes.hasPath',
      'nodes.hasTexts',
      'nodes.isBlock',
      'nodes.isEmpty',
      'nodes.last',
      'nodes.leaf',
      'nodes.levels',
      'nodes.path',
      'nodes.next',
      'nodes.parent',
      'nodes.previous',
      'nodes.shouldMergeNodesRemovePrevNode',
      'nodes.some',
      'nodes.toArray',
      'nodes.void',
      'points.after',
      'points.before',
      'points.end',
      'points.get',
      'points.isEdge',
      'points.isEnd',
      'points.isStart',
      'points.positions',
      'points.start',
      'ranges.edges',
      'ranges.get',
      'ranges.project',
      'ranges.unhang',
      'text.string',
    ]);
  });

  it('routes static reads and editor.read state reads through the same query keys', () => {
    const editor = createEditor();
    const seen: string[] = [];

    editorReplace(editor, {
      children,
      selection: null,
      marks: null,
    });

    editor.extend(
      defineEditorExtension({
        name: 'static-query-spy',
        queries: {
          nodes: {
            elementReadOnly({ next, options }) {
              seen.push('nodes.elementReadOnly');

              return next({ options });
            },
            path({ at, next, options }) {
              seen.push('nodes.path');

              return next({ at, options });
            },
            shouldMergeNodesRemovePrevNode({ current, next, previous }) {
              seen.push('nodes.shouldMergeNodesRemovePrevNode');

              return next({ current, previous });
            },
          },
          points: {
            positions({ next, options }) {
              seen.push('points.positions');

              return next({ options });
            },
          },
        },
      })
    );

    editorPath(editor, [0, 0]);
    editor.read((state) => state.nodes.path([0, 0]));
    Array.from(editorPositions(editor, { at: [0] }));
    editor.read((state) => Array.from(state.points.positions({ at: [0] })));
    editorElementReadOnly(editor, { at: [0] });
    editor.read((state) => state.nodes.elementReadOnly({ at: [0] }));
    editorShouldMergeNodesRemovePrevNode(
      editor,
      [{ text: '' }, [0, 0]],
      [{ text: 'two' }, [1, 0]]
    );
    editor.read((state) =>
      state.nodes.shouldMergeNodesRemovePrevNode(
        [{ text: '' }, [0, 0]],
        [{ text: 'two' }, [1, 0]]
      )
    );

    assert.deepEqual(seen, [
      'nodes.path',
      'nodes.path',
      'points.positions',
      'points.positions',
      'nodes.elementReadOnly',
      'nodes.elementReadOnly',
      'nodes.shouldMergeNodesRemovePrevNode',
      'nodes.shouldMergeNodesRemovePrevNode',
    ]);
  });

  it('rejects calling query middleware next twice', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children,
      selection: null,
      marks: null,
    });

    editor.extend(
      defineEditorExtension({
        name: 'double-next-query',
        queries: {
          text: {
            string({ next }) {
              next();
              assert.throws(
                () => next(),
                /Query middleware next\(\) cannot be called more than once\./
              );

              return 'handled';
            },
          },
        },
      })
    );

    assert.equal(editorString(editor, [0]), 'handled');
  });

  it('does not allow query middleware to mutate editor state', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children,
      selection: {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      },
      marks: null,
    });

    editor.extend(
      defineEditorExtension({
        name: 'read-only-query',
        queries: {
          text: {
            string({ editor, next }) {
              assert.throws(
                () =>
                  editor.update((tx) => {
                    tx.text.insert('!');
                  }),
                /editor\.update cannot be started inside query middleware/
              );

              return next();
            },
          },
        },
      })
    );

    const operationsBefore = editorGetOperations(editor).length;

    assert.equal(editorString(editor, [0]), 'one');
    assert.equal(editorGetOperations(editor).length, operationsBefore);
  });

  it('does not allow generator cleanup to mutate editor state after iteration stops early', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children,
      selection: {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      },
      marks: null,
    });

    editor.extend(
      defineEditorExtension({
        name: 'read-only-query-generator-cleanup',
        queries: {
          points: {
            positions({ editor, next, options }) {
              return (function* () {
                try {
                  yield* next({ options });
                } finally {
                  editor.update((tx) => {
                    tx.text.insert('!');
                  });
                }
              })();
            },
          },
        },
      })
    );

    assert.throws(() => {
      for (const _point of editorPositions(editor, { at: [0] })) {
        break;
      }
    }, /editor\.update cannot be started inside query middleware/);
    assert.equal(editorString(editor, [0]), 'one');
  });
});
