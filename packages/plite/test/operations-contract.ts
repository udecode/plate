import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  getOperations as editorGetOperations,
  getSnapshot as editorGetSnapshot,
  pathRef as editorPathRef,
  pointRef as editorPointRef,
  replace as editorReplace,
} from '@platejs/plite/internal';
import {
  createEditor,
  type Descendant,
  OperationApi,
  type Operation as PliteOperation,
} from '../src';
import { extendTestSchema } from './support/schema';

const moveChildren = (): Descendant[] => [
  {
    type: 'element',
    children: [{ text: '1' }],
  },
  {
    type: 'element',
    children: [{ text: '2' }],
  },
];

const collapsedSelection = (path: number[], offset: number) => ({
  anchor: { path, offset },
  focus: { path, offset },
});

const applyOperation = (
  editor: ReturnType<typeof createEditor>,
  operation: PliteOperation
) => {
  editor.update((tx) => {
    tx.operations.replay([operation]);
  });
};

describe('plite operations contract', () => {
  it('applies and inverts replace_fragment as one root replacement', () => {
    const editor = createEditor();
    const children = moveChildren();
    const newChildren: Descendant[] = [
      {
        type: 'element',
        children: [{ text: 'one' }],
      },
      {
        type: 'element',
        children: [{ text: 'two' }],
      },
      {
        type: 'element',
        children: [{ text: 'three' }],
      },
    ];
    const selection = collapsedSelection([0, 0], 0);
    const newSelection = collapsedSelection([2, 0], 'three'.length);
    const operation: PliteOperation = {
      children,
      newChildren,
      newSelection,
      path: [],
      selection,
      type: 'replace_fragment',
    };

    assert.equal(OperationApi.isOperation(operation), true);

    editorReplace(editor, {
      children,
      selection,
      marks: null,
    });

    applyOperation(editor, operation);

    assert.deepEqual(editorGetSnapshot(editor).children, newChildren);
    assert.deepEqual(editorGetSnapshot(editor).selection, newSelection);

    applyOperation(editor, OperationApi.inverse(operation));

    assert.deepEqual(editorGetSnapshot(editor).children, children);
    assert.deepEqual(editorGetSnapshot(editor).selection, selection);
  });

  it('applies and inverts replace_children as one parent child-range replacement', () => {
    const editor = createEditor();
    const children: Descendant[] = [
      {
        type: 'element',
        children: [{ text: '0' }],
      },
      ...moveChildren(),
      {
        type: 'element',
        children: [{ text: '3' }],
      },
    ];
    const newChildren = [
      {
        type: 'element',
        children: [{ text: 'one-two' }],
      },
    ];
    const selection = collapsedSelection([1, 0], 0);
    const newSelection = collapsedSelection([1, 0], 'one-two'.length);
    const operation: PliteOperation = {
      children: children.slice(1, 3),
      index: 1,
      newChildren,
      newSelection,
      path: [],
      selection,
      type: 'replace_children',
    };

    assert.equal(OperationApi.isOperation(operation), true);

    editorReplace(editor, {
      children,
      selection,
      marks: null,
    });

    applyOperation(editor, operation);

    assert.deepEqual(editorGetSnapshot(editor).children, [
      children[0],
      newChildren[0],
      children[3],
    ]);
    assert.deepEqual(editorGetSnapshot(editor).selection, newSelection);

    applyOperation(editor, OperationApi.inverse(operation));

    assert.deepEqual(editorGetSnapshot(editor).children, children);
    assert.deepEqual(editorGetSnapshot(editor).selection, selection);
  });

  it('applies and inverts huge replace_children ranges without argument spreading', () => {
    const editor = createEditor();
    const childCount = 200_000;
    const children: Descendant[] = Array.from(
      { length: childCount },
      (_, index) => ({
        type: 'element',
        children: [{ text: String(index) }],
      })
    );
    const newChildren: Descendant[] = [
      {
        type: 'element',
        children: [{ text: 'replacement' }],
      },
    ];
    const operation: PliteOperation = {
      children,
      index: 0,
      newChildren,
      newSelection: null,
      path: [],
      selection: null,
      type: 'replace_children',
    };

    editorReplace(editor, {
      children,
      selection: null,
      marks: null,
    });

    applyOperation(editor, operation);

    assert.equal(editorGetSnapshot(editor).children.length, 1);
    assert.deepEqual(editorGetSnapshot(editor).children[0], newChildren[0]);

    applyOperation(editor, OperationApi.inverse(operation));

    const snapshotChildren = editorGetSnapshot(editor).children;

    assert.equal(snapshotChildren.length, childCount);
    assert.deepEqual(snapshotChildren[0], children[0]);
    assert.deepEqual(snapshotChildren.at(-1), children.at(-1));
  });

  it('rejects unknown operation-like records during replay', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: moveChildren(),
      selection: collapsedSelection([0, 0], 0),
      marks: null,
    });

    assert.throws(() => {
      editor.update((tx) => {
        tx.operations.replay([
          {
            type: 'custom_operation',
            path: [0],
            payload: true,
          },
        ] as never);
      });
    }, /Cannot replay an unknown Plite operation/);

    assert.deepEqual(
      editorGetOperations(editor).map((operation) => operation.type),
      []
    );
  });

  it('rejects nullish set_node removals and removes by omission', () => {
    const editor = createEditor();
    const children: Descendant[] = [
      {
        type: 'element',
        children: [{ text: '', someKey: true }],
      },
    ];

    editorReplace(editor, {
      children,
      selection: collapsedSelection([0, 0], 0),
      marks: null,
    });

    for (const value of [null, undefined]) {
      assert.throws(() => {
        applyOperation(editor, {
          type: 'set_node',
          path: [0, 0],
          properties: { someKey: true },
          newProperties: { someKey: value },
        } as PliteOperation);
      }, /set_node newProperties cannot remove properties with nullish values/);
    }

    assert.deepEqual(editorGetSnapshot(editor).children, children);

    applyOperation(editor, {
      type: 'set_node',
      path: [0, 0],
      properties: { someKey: true },
      newProperties: {},
    } as PliteOperation);

    assert.deepEqual(editorGetSnapshot(editor).children, [
      {
        type: 'element',
        children: [{ text: '' }],
      },
    ]);
  });

  it('rebases refs after replace_children and nulls refs inside the replaced window', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'element',
          children: [{ text: '0' }],
        },
        ...moveChildren(),
        {
          type: 'element',
          children: [{ text: '3' }],
        },
      ],
      selection: collapsedSelection([3, 0], 0),
      marks: null,
    });

    const beforeRef = editorPathRef(editor, [0]);
    const insidePathRef = editorPathRef(editor, [1]);
    const insidePointRef = editorPointRef(editor, { path: [2, 0], offset: 0 });
    const afterRef = editorPathRef(editor, [3, 0]);

    applyOperation(editor, {
      type: 'replace_children',
      path: [],
      index: 1,
      children: moveChildren(),
      newChildren: [
        {
          type: 'element',
          children: [{ text: 'one-two' }],
        },
      ],
      selection: collapsedSelection([3, 0], 0),
      newSelection: collapsedSelection([2, 0], 0),
    });

    assert.deepEqual(beforeRef.unref(), [0]);
    assert.equal(insidePathRef.unref(), null);
    assert.equal(insidePointRef.unref(), null);
    assert.deepEqual(afterRef.unref(), [2, 0]);
  });

  it('keeps a ref to the non-root replace_fragment parent', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'element',
          children: [{ text: 'old' }],
        },
        {
          type: 'element',
          children: [{ text: 'sibling' }],
        },
      ],
      selection: collapsedSelection([0, 0], 0),
      marks: null,
    });

    const parentRef = editorPathRef(editor, [0]);
    const childPathRef = editorPathRef(editor, [0, 0]);
    const childPointRef = editorPointRef(editor, { path: [0, 0], offset: 0 });
    const siblingRef = editorPathRef(editor, [1, 0]);

    applyOperation(editor, {
      type: 'replace_fragment',
      path: [0],
      children: [{ text: 'old' }],
      newChildren: [{ text: 'new' }],
      selection: collapsedSelection([0, 0], 0),
      newSelection: collapsedSelection([0, 0], 'new'.length),
    });

    assert.deepEqual(parentRef.unref(), [0]);
    assert.equal(childPathRef.unref(), null);
    assert.equal(childPointRef.unref(), null);
    assert.deepEqual(siblingRef.unref(), [1, 0]);
  });

  it('treats move_node as a no-op when path equals newPath', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: moveChildren(),
      selection: null,
      marks: null,
    });

    applyOperation(editor, {
      type: 'move_node',
      path: [0],
      newPath: [0],
    });

    assert.deepEqual(editorGetSnapshot(editor).children, moveChildren());
  });

  it('moves a node when move_node targets the post-removal destination path', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: moveChildren(),
      selection: null,
      marks: null,
    });

    applyOperation(editor, {
      type: 'move_node',
      path: [0],
      newPath: [2],
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      {
        type: 'element',
        children: [{ text: '2' }],
      },
      {
        type: 'element',
        children: [{ text: '1' }],
      },
    ]);
  });

  it('rebases selection with the effective move_node target when moving to a later sibling slot', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: moveChildren(),
      selection: collapsedSelection([0, 0], 0),
      marks: null,
    });

    applyOperation(editor, {
      type: 'move_node',
      path: [0],
      newPath: [2],
    });

    const after = editorGetSnapshot(editor);

    assert.deepEqual(after.children, [
      {
        type: 'element',
        children: [{ text: '2' }],
      },
      {
        type: 'element',
        children: [{ text: '1' }],
      },
    ]);
    assert.deepEqual(after.selection, collapsedSelection([1, 0], 0));
  });

  it('rebases selection when insert_node inserts before the selected node', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: moveChildren(),
      selection: collapsedSelection([0, 0], 0),
      marks: null,
    });

    applyOperation(editor, {
      type: 'insert_node',
      path: [0],
      node: {
        type: 'element',
        children: [{ text: '0' }],
      },
    });

    const after = editorGetSnapshot(editor);

    assert.deepEqual(after.children, [
      {
        type: 'element',
        children: [{ text: '0' }],
      },
      {
        type: 'element',
        children: [{ text: '1' }],
      },
      {
        type: 'element',
        children: [{ text: '2' }],
      },
    ]);
    assert.deepEqual(after.selection, collapsedSelection([1, 0], 0));
  });

  it('rejects replay operations with negative positions without changing the snapshot', () => {
    const children: Descendant[] = [
      {
        type: 'element',
        children: [{ text: 'one' }, { text: 'two' }],
      },
      {
        type: 'element',
        children: [{ text: 'three' }],
      },
    ];
    const operations: PliteOperation[] = [
      {
        type: 'insert_node',
        path: [0, -1],
        node: { text: 'bad' },
      },
      {
        type: 'remove_node',
        path: [0, -1],
        node: { text: 'two' },
      },
      {
        type: 'replace_children',
        path: [0],
        index: -1,
        children: [{ text: 'two' }],
        newChildren: [{ text: 'bad' }],
        selection: null,
        newSelection: null,
      },
      {
        type: 'insert_text',
        path: [0, 0],
        offset: -1,
        text: 'bad',
      },
      {
        type: 'remove_text',
        path: [0, 0],
        offset: -1,
        text: 'e',
      },
      {
        type: 'split_node',
        path: [0, 0],
        position: -1,
        properties: {},
      },
      {
        type: 'split_node',
        path: [0],
        position: -1,
        properties: {},
      },
      {
        type: 'move_node',
        path: [0, -1],
        newPath: [0, 1],
      },
      {
        type: 'move_node',
        path: [0, 1],
        newPath: [0, -1],
      },
    ];

    for (const operation of operations) {
      const editor = createEditor();

      editorReplace(editor, {
        children,
        selection: null,
        marks: null,
      });

      const before = editorGetSnapshot(editor);

      assert.throws(() => applyOperation(editor, operation), /Cannot apply/);
      assert.deepEqual(editorGetSnapshot(editor), before);
    }
  });

  it('rejects remove_text replay when operation text does not match the current text', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'element',
          children: [{ text: 'one' }],
        },
      ],
      selection: null,
      marks: null,
    });

    const before = editorGetSnapshot(editor);

    assert.throws(
      () =>
        applyOperation(editor, {
          type: 'remove_text',
          path: [0, 0],
          offset: 1,
          text: 'x',
        }),
      /does not match/
    );
    assert.deepEqual(editorGetSnapshot(editor), before);
  });

  it('applies partial set_selection patches against the current selection', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: moveChildren(),
      selection: {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [1, 0], offset: 1 },
      },
      marks: null,
    });

    applyOperation(editor, {
      type: 'set_selection',
      properties: {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [1, 0], offset: 1 },
      },
      newProperties: {
        focus: { path: [1, 0], offset: 0 },
      },
    });

    assert.deepEqual(editorGetSnapshot(editor).selection, {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [1, 0], offset: 0 },
    });
  });

  it('rejects partial set_selection patches when the editor has no live selection', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: moveChildren(),
      selection: null,
      marks: null,
    });

    assert.throws(
      () =>
        applyOperation(editor, {
          type: 'set_selection',
          properties: null,
          newProperties: {
            anchor: { path: [0, 0], offset: 0 },
          },
        }),
      /set_selection patch requires an existing selection or a full range/
    );
  });

  it('splits a text node with split_node then splits its parent element', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'element',
          children: [{ text: 'some text', bold: true }],
        },
      ],
      selection: null,
      marks: null,
    });

    applyOperation(editor, {
      type: 'split_node',
      path: [0, 0],
      position: 5,
      properties: {
        bold: true,
      },
    });

    applyOperation(editor, {
      type: 'split_node',
      path: [0],
      position: 1,
      properties: {},
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      {
        type: 'element',
        children: [{ text: 'some ', bold: true }],
      },
      {
        type: 'element',
        children: [{ text: 'text', bold: true }],
      },
    ]);
  });

  it('rebases expanded selections across split_node text branches', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'element',
          children: [{ text: 'Hello World', bold: true }],
        },
      ],
      selection: {
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [0, 0], offset: 7 },
      },
      marks: null,
    });

    applyOperation(editor, {
      type: 'split_node',
      path: [0, 0],
      position: 4,
      properties: {},
    });

    const after = editorGetSnapshot(editor);

    assert.deepEqual(after.children, [
      {
        type: 'element',
        children: [{ text: 'Hell', bold: true }, { text: 'o World' }],
      },
    ]);
    assert.deepEqual(after.selection, {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 1], offset: 3 },
    });
  });

  it('replays and inverts composed split_node and insert_text operations', () => {
    const editor = createEditor();
    const children: Descendant[] = [
      {
        type: 'element',
        children: [{ bold: true, text: 'Hello World' }],
      },
    ];
    const selection = {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 7 },
    };
    const operations: PliteOperation[] = [
      {
        type: 'split_node',
        path: [0, 0],
        position: 5,
        properties: { bold: true },
      },
      {
        type: 'insert_text',
        path: [0, 1],
        offset: 0,
        text: '-',
      },
    ];

    editorReplace(editor, {
      children,
      selection,
      marks: null,
    });

    editor.update((tx) => {
      tx.operations.replay(operations);
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      {
        type: 'element',
        children: [
          { bold: true, text: 'Hello' },
          { bold: true, text: '- World' },
        ],
      },
    ]);
    assert.deepEqual(editorGetSnapshot(editor).selection, {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 1], offset: 3 },
    });

    editor.update((tx) => {
      tx.operations.replay(operations.map(OperationApi.inverse).reverse());
    });

    assert.deepEqual(editorGetSnapshot(editor).children, children);
    assert.deepEqual(editorGetSnapshot(editor).selection, selection);
  });

  it('rebases selection inside merged text to the surviving branch', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'element',
          children: [
            { text: '1' },
            { text: '2', bold: true },
            { text: '3', italic: true },
          ],
        },
      ],
      selection: collapsedSelection([0, 1], 0),
      marks: null,
    });

    applyOperation(editor, {
      type: 'merge_node',
      path: [0, 1],
      position: 1,
      properties: { bold: true },
    });

    const after = editorGetSnapshot(editor);

    assert.deepEqual(after.children, [
      {
        type: 'element',
        children: [{ text: '12' }, { text: '3', italic: true }],
      },
    ]);
    assert.deepEqual(after.selection, collapsedSelection([0, 0], 1));
  });

  it('splits an element node with element-level split_node properties', () => {
    const editor = createEditor();
    extendTestSchema(editor, { type: 'inline', inline: true });

    editorReplace(editor, {
      children: [
        {
          type: 'element',
          data: true,
          children: [
            { text: 'before text' },
            {
              type: 'inline',
              children: [{ text: 'hyperlink' }],
            },
            { text: 'after text' },
          ],
        },
      ],
      selection: null,
      marks: null,
    });

    applyOperation(editor, {
      type: 'split_node',
      path: [0],
      position: 1,
      properties: {
        data: true,
      },
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      {
        type: 'element',
        data: true,
        children: [{ text: 'before text' }],
      },
      {
        type: 'element',
        data: true,
        children: [
          { text: '' },
          {
            type: 'inline',
            children: [{ text: 'hyperlink' }],
          },
          { text: 'after text' },
        ],
      },
    ]);
  });

  it('rebases selection to the next text when remove_node deletes the selected leading empty text', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'element',
          children: [{ text: '' }, { text: 'b' }],
        },
      ],
      selection: collapsedSelection([0, 0], 0),
      marks: null,
    });

    applyOperation(editor, {
      type: 'remove_node',
      path: [0, 0],
      node: { text: '' },
    });

    const after = editorGetSnapshot(editor);

    assert.deepEqual(after.children, [
      {
        type: 'element',
        children: [{ text: 'b' }],
      },
    ]);
    assert.deepEqual(after.selection, collapsedSelection([0, 0], 0));
  });

  it('rebases selection to the previous text end when remove_node deletes the selected trailing empty text', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'element',
          children: [{ text: 'a' }, { text: '' }],
        },
      ],
      selection: collapsedSelection([0, 1], 0),
      marks: null,
    });

    applyOperation(editor, {
      type: 'remove_node',
      path: [0, 1],
      node: { text: '' },
    });

    const after = editorGetSnapshot(editor);

    assert.deepEqual(after.children, [
      {
        type: 'element',
        children: [{ text: 'a' }],
      },
    ]);
    assert.deepEqual(after.selection, collapsedSelection([0, 0], 1));
  });

  it('rebases selection into the adjacent inline when remove_node deletes the selected trailing spacer text', () => {
    const editor = createEditor();
    extendTestSchema(editor, { type: 'inline', inline: true });

    editorReplace(editor, {
      children: [
        {
          type: 'element',
          children: [
            { text: '' },
            {
              type: 'inline',
              children: [{ text: 'a' }],
            },
            { text: '' },
          ],
        },
      ],
      selection: collapsedSelection([0, 2], 0),
      marks: null,
    });

    applyOperation(editor, {
      type: 'remove_node',
      path: [0, 2],
      node: { text: '' },
    });

    const after = editorGetSnapshot(editor);

    assert.deepEqual(after.children, [
      {
        type: 'element',
        children: [
          { text: '' },
          {
            type: 'inline',
            children: [{ text: 'a' }],
          },
          { text: '' },
        ],
      },
    ]);
    assert.deepEqual(after.selection, collapsedSelection([0, 1, 0], 1));
  });

  it('rebases expanded selections inward when remove_text deletes text inside the range', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'element',
          children: [{ text: 'word' }],
        },
      ],
      selection: {
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 4 },
      },
      marks: null,
    });

    applyOperation(editor, {
      type: 'remove_text',
      path: [0, 0],
      offset: 1,
      text: 'or',
    });

    const after = editorGetSnapshot(editor);

    assert.equal(after.children[0]?.children[0]?.text, 'wd');
    assert.deepEqual(after.selection, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 2 },
    });
  });

  it('removes omitted text props through raw set_node', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'element',
          children: [{ text: 'a', someKey: true }],
        },
      ],
      selection: null,
      marks: null,
    });

    applyOperation(editor, {
      type: 'set_node',
      path: [0, 0],
      properties: { someKey: true },
      newProperties: {},
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      {
        type: 'element',
        children: [{ text: 'a' }],
      },
    ]);
  });

  it('rejects raw set_node patches that omit protected node properties', () => {
    const textEditor = createEditor();

    editorReplace(textEditor, {
      children: [
        {
          type: 'element',
          children: [{ text: 'a' }],
        },
      ],
      selection: null,
      marks: null,
    });

    const beforeText = editorGetSnapshot(textEditor);

    assert.throws(
      () =>
        applyOperation(textEditor, {
          type: 'set_node',
          path: [0, 0],
          properties: { text: 'a' },
          newProperties: {},
        }),
      /Cannot set the "text" property of nodes!/
    );
    assert.deepEqual(editorGetSnapshot(textEditor), beforeText);

    const childrenEditor = createEditor();

    editorReplace(childrenEditor, {
      children: [
        {
          type: 'element',
          children: [{ text: 'a' }],
        },
      ],
      selection: null,
      marks: null,
    });

    const beforeChildren = editorGetSnapshot(childrenEditor);

    assert.throws(
      () =>
        applyOperation(childrenEditor, {
          type: 'set_node',
          path: [0],
          properties: { children: [{ text: 'a' }] },
          newProperties: {},
        }),
      /set_node does not update child content/
    );
    assert.deepEqual(editorGetSnapshot(childrenEditor), beforeChildren);
  });

  it('splits a text node with empty split_node properties and clears the right branch props', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'element',
          children: [{ text: 'some text', bold: true }],
        },
      ],
      selection: null,
      marks: null,
    });

    applyOperation(editor, {
      type: 'split_node',
      path: [0, 0],
      position: 5,
      properties: {},
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      {
        type: 'element',
        children: [{ text: 'some ', bold: true }, { text: 'text' }],
      },
    ]);
  });

  it('splits an element node with empty split_node properties and clears the right branch props', () => {
    const editor = createEditor();
    extendTestSchema(editor, { type: 'inline', inline: true });

    editorReplace(editor, {
      children: [
        {
          type: 'element',
          data: true,
          children: [
            { text: 'before text' },
            {
              type: 'inline',
              children: [{ text: 'hyperlink' }],
            },
            { text: 'after text' },
          ],
        },
      ],
      selection: null,
      marks: null,
    });

    applyOperation(editor, {
      type: 'split_node',
      path: [0],
      position: 1,
      properties: {},
    });

    assert.deepEqual(editorGetSnapshot(editor).children, [
      {
        type: 'element',
        data: true,
        children: [{ text: 'before text' }],
      },
      {
        type: 'element',
        children: [
          { text: '' },
          {
            type: 'inline',
            children: [{ text: 'hyperlink' }],
          },
          { text: 'after text' },
        ],
      },
    ]);
  });
});
