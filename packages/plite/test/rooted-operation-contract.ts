import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  createEditorRuntime,
  createEditorView,
  type Descendant,
  defineEditorExtension,
  OperationApi,
  PointApi,
  RangeApi,
} from '../src';

const paragraph = (text: string) =>
  ({
    type: 'paragraph',
    children: [{ text }],
  }) satisfies Descendant;

const voidBlock = defineEditorExtension({
  name: 'test-void-block',
  elements: [{ type: 'void-block', void: 'block' }],
});

describe('rooted operation contract', () => {
  it('publishes primary content operations without a public root key', () => {
    const header = [paragraph('header')];
    const main = [paragraph('body')];
    const editor = createEditor({
      initialValue: { children: main, roots: { header } },
    });

    editor.update((tx) => {
      tx.text.insert('!', {
        at: { path: [0, 0], offset: 4 },
      });
    });

    const commit = editorGetLastCommit(editor);
    assert(commit);
    assert.equal(Object.hasOwn(commit.operations[0]!, 'root'), false);
    assert.deepEqual(commit.operations, [
      {
        offset: 4,
        path: [0, 0],
        text: '!',
        type: 'insert_text',
      },
    ]);
    assert.deepEqual(
      editor.read((state) => state.value.get()),
      {
        children: [paragraph('body!')],
        roots: { header },
      }
    );
  });

  it('keeps Point and Range transforms root-local', () => {
    const operation = {
      offset: 0,
      path: [0, 0],
      root: 'main',
      text: '!',
      type: 'insert_text',
    } as const;
    const headerPoint = { path: [0, 0], offset: 3, root: 'header' } as const;
    const headerRange = { anchor: headerPoint, focus: headerPoint };

    assert.deepEqual(PointApi.transform(headerPoint, operation), headerPoint);
    assert.deepEqual(RangeApi.transform(headerRange, operation), headerRange);
    assert.equal(PointApi.isPoint(headerPoint), true);
    assert.equal(RangeApi.isRange(headerRange), true);
  });

  it('keeps PathRef root metadata internal and root-local', () => {
    const runtime = createEditorRuntime({
      initialValue: {
        children: [paragraph('body')],
        roots: {
          header: [paragraph('header')],
        },
      },
    });
    const mainEditor = createEditorView(runtime);
    const headerEditor = createEditorView(runtime, { root: 'header' });
    const ref = editorPathRef(headerEditor, [0]);

    assert.equal('root' in ref, false);

    mainEditor.update((tx) => {
      tx.nodes.insert(paragraph('main-before'), { at: [0] });
    });

    assert.deepEqual(ref.current, [0]);

    headerEditor.update((tx) => {
      tx.nodes.insert(paragraph('header-before'), { at: [0] });
    });

    assert.deepEqual(ref.current, [1]);
    assert.deepEqual(ref.unref(), [1]);
  });

  it('keeps sibling-root merge and split operations from retagging selection', () => {
    const mainSelection = {
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 4 },
    };
    const mergeEditor = createEditor({
      initialValue: {
        children: [paragraph('main')],
        roots: {
          header: [paragraph('a'), paragraph('b')],
        },
      },
    });

    mergeEditor.update((tx) => {
      tx.selection.set(mainSelection);
    });
    mergeEditor.update((tx) => {
      tx.operations.replay([
        {
          path: [1],
          position: 1,
          properties: {},
          root: 'header',
          type: 'merge_node',
        },
      ]);
    });

    assert.deepEqual(
      mergeEditor.read((state) => state.selection.get()),
      mainSelection
    );

    const splitEditor = createEditor({
      initialValue: {
        children: [paragraph('main')],
        roots: {
          header: [paragraph('ab')],
        },
      },
    });

    splitEditor.update((tx) => {
      tx.selection.set(mainSelection);
    });
    splitEditor.update((tx) => {
      tx.operations.replay([
        {
          path: [0, 0],
          position: 1,
          properties: {},
          root: 'header',
          type: 'split_node',
        },
      ]);
    });

    assert.deepEqual(
      splitEditor.read((state) => state.selection.get()),
      mainSelection
    );
  });

  it('deletes explicit non-main ranges in their own root', () => {
    const editor = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: {
          header: [paragraph('header')],
        },
      },
    });

    editor.update((tx) => {
      tx.text.delete({
        at: {
          anchor: { path: [0, 0], offset: 1, root: 'header' },
          focus: { path: [0, 0], offset: 3, root: 'header' },
        },
      });
    });

    assert.deepEqual(
      editor.read((state) => state.value.get()),
      {
        children: [paragraph('body')],
        roots: { header: [paragraph('hder')] },
      }
    );
    assert.equal(
      editorGetLastCommit(editor)?.operations.every(
        (operation) => operation.root === 'header'
      ),
      true
    );
  });

  it('replaces explicit non-main ranges in their own root', () => {
    const editor = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: {
          header: [paragraph('header')],
        },
      },
    });

    editor.update((tx) => {
      tx.text.insert('X', {
        at: {
          anchor: { path: [0, 0], offset: 1, root: 'header' },
          focus: { path: [0, 0], offset: 3, root: 'header' },
        },
      });
    });

    assert.deepEqual(
      editor.read((state) => state.value.get()),
      {
        children: [paragraph('body')],
        roots: { header: [paragraph('hXder')] },
      }
    );
    assert.equal(
      editorGetLastCommit(editor)?.operations.every(
        (operation) => operation.root === 'header'
      ),
      true
    );
  });

  it('routes explicit full-root text replacements through their own root', () => {
    const editor = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: {
          header: [paragraph('head')],
        },
      },
    });

    editor.update((tx) => {
      tx.text.insert('X', {
        at: {
          anchor: { path: [0, 0], offset: 0, root: 'header' },
          focus: { path: [0, 0], offset: 4, root: 'header' },
        },
      });
    });

    assert.deepEqual(
      editor.read((state) => state.value.get()),
      {
        children: [paragraph('body')],
        roots: { header: [paragraph('X')] },
      }
    );
    assert.equal(editorGetLastCommit(editor)?.operations[0]?.root, 'header');
  });

  it('checks explicit point inserts against the target root', () => {
    const editor = createEditor({
      extensions: [voidBlock],
      initialValue: {
        children: [{ type: 'void-block', children: [{ text: '' }] }],
        roots: {
          header: [paragraph('head')],
        },
      },
    });

    editor.update((tx) => {
      tx.text.insert('X', {
        at: { path: [0, 0], offset: 2, root: 'header' },
      });
    });

    assert.deepEqual(
      editor.read((state) => state.value.get()),
      {
        children: [{ type: 'void-block', children: [{ text: '' }] }],
        roots: { header: [paragraph('heXad')] },
      }
    );
    assert.equal(editorGetLastCommit(editor)?.operations[0]?.root, 'header');
  });

  it('normalizes repairs inside the operation root', () => {
    const editor = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: {
          header: [paragraph('head')],
        },
      },
    });

    editor.update((tx) => {
      tx.operations.replay([
        {
          node: { type: 'block', children: [] },
          path: [1],
          root: 'header',
          type: 'insert_node',
        },
      ]);
    });

    assert.deepEqual(
      editor.read((state) => state.value.get()),
      {
        children: [paragraph('body')],
        roots: {
          header: [
            paragraph('head'),
            { type: 'block', children: [{ text: '' }] },
          ],
        },
      }
    );
    assert.equal(
      editorGetLastCommit(editor)?.operations.every(
        (operation) => operation.root === 'header'
      ),
      true
    );
  });

  it('normalizes every root touched by a transaction', () => {
    const editor = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: {
          header: [paragraph('head')],
        },
      },
    });

    editor.update((tx) => {
      tx.operations.replay([
        {
          node: { type: 'block', children: [] },
          path: [1],
          root: 'header',
          type: 'insert_node',
        },
        {
          offset: 4,
          path: [0, 0],
          root: 'main',
          text: '!',
          type: 'insert_text',
        },
      ]);
    });

    assert.deepEqual(
      editor.read((state) => state.value.get()),
      {
        children: [paragraph('body!')],
        roots: {
          header: [
            paragraph('head'),
            { type: 'block', children: [{ text: '' }] },
          ],
        },
      }
    );
    assert.deepEqual(
      editorGetLastCommit(editor)?.operations.map(
        (operation) => operation.root
      ),
      ['header', undefined, 'header']
    );
  });

  it('records root presence when creating an explicit child root', () => {
    const childRoot = 'island:body';
    const editor = createEditor({
      initialValue: {
        children: [paragraph('body')],
      },
    });

    editor.update((tx) => {
      tx.operations.replay([
        {
          children: [],
          index: 0,
          newChildren: [paragraph('child')],
          newSelection: null,
          path: [],
          root: childRoot,
          selection: null,
          type: 'replace_children',
        },
      ]);
    });

    assert.deepEqual(
      editor.read((state) => state.value.get()),
      {
        children: [paragraph('body')],
        roots: {
          [childRoot]: [paragraph('child')],
        },
      }
    );
    assert.deepEqual(editorGetLastCommit(editor)?.operations, [
      {
        children: [],
        index: 0,
        newChildren: [paragraph('child')],
        newSelection: null,
        path: [],
        root: childRoot,
        rootIsPresent: true,
        rootWasPresent: false,
        selection: null,
        type: 'replace_children',
      },
    ]);
  });

  it('creates, replaces, and deletes roots through tx.roots', () => {
    const childRoot = 'island:body';
    const editor = createEditor({
      initialValue: {
        children: [paragraph('body')],
      },
    });

    editor.update((tx) => {
      tx.roots.create(childRoot, [paragraph('child')]);
    });

    assert.deepEqual(
      editor.read((state) => state.value.get()),
      {
        children: [paragraph('body')],
        roots: {
          [childRoot]: [paragraph('child')],
        },
      }
    );
    assert.deepEqual(editorGetLastCommit(editor)?.operations, [
      {
        children: [],
        index: 0,
        newChildren: [paragraph('child')],
        newSelection: null,
        path: [],
        root: childRoot,
        rootIsPresent: true,
        rootWasPresent: false,
        selection: null,
        type: 'replace_children',
      },
    ]);

    editor.update((tx) => {
      tx.roots.replace(childRoot, [paragraph('updated')]);
    });

    assert.deepEqual(
      editor.read((state) => state.value.get()),
      {
        children: [paragraph('body')],
        roots: {
          [childRoot]: [paragraph('updated')],
        },
      }
    );
    assert.deepEqual(editorGetLastCommit(editor)?.operations, [
      {
        children: [paragraph('child')],
        index: 0,
        newChildren: [paragraph('updated')],
        newSelection: null,
        path: [],
        root: childRoot,
        rootIsPresent: true,
        rootWasPresent: true,
        selection: null,
        type: 'replace_children',
      },
    ]);

    editor.update((tx) => {
      tx.roots.delete(childRoot);
    });

    assert.deepEqual(
      editor.read((state) => state.value.get()),
      {
        children: [paragraph('body')],
      }
    );
    assert.deepEqual(editorGetLastCommit(editor)?.operations, [
      {
        children: [paragraph('updated')],
        index: 0,
        newChildren: [],
        newSelection: null,
        path: [],
        root: childRoot,
        rootIsPresent: false,
        rootWasPresent: true,
        selection: null,
        type: 'replace_children',
      },
    ]);
  });

  it('fails loudly for invalid tx.roots lifecycle calls', () => {
    const childRoot = 'island:body';
    const editor = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: {
          [childRoot]: [paragraph('child')],
        },
      },
    });

    assert.throws(
      () =>
        editor.update((tx) => {
          tx.roots.create(childRoot, [paragraph('duplicate')]);
        }),
      /Cannot create existing editor root/
    );
    assert.throws(
      () =>
        editor.update((tx) => {
          tx.roots.replace('missing', [paragraph('missing')]);
        }),
      /Cannot replace missing editor root/
    );
    assert.throws(
      () =>
        editor.update((tx) => {
          tx.roots.delete('main');
        }),
      /Cannot mutate the primary editor root/
    );
  });

  it('routes explicit point node inserts through their own root', () => {
    const editor = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: {
          header: [paragraph('head')],
        },
      },
    });

    editor.update((tx) => {
      tx.nodes.insert(paragraph('new'), {
        at: { path: [0, 0], offset: 2, root: 'header' },
      });
    });

    assert.deepEqual(
      editor.read((state) => state.value.get()),
      {
        children: [paragraph('body')],
        roots: { header: [paragraph('he'), paragraph('new'), paragraph('ad')] },
      }
    );
    assert.equal(
      editorGetLastCommit(editor)?.operations.every(
        (operation) => operation.root === 'header'
      ),
      true
    );
  });

  it('routes implicit node inserts through the current transaction selection root', () => {
    const editor = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: {
          header: [paragraph('head')],
        },
      },
    });

    editor.update((tx) => {
      tx.selection.set({ path: [0, 0], offset: 2, root: 'header' });
      tx.nodes.insert(paragraph('new'));
    });

    assert.deepEqual(
      editor.read((state) => state.value.get()),
      {
        children: [paragraph('body')],
        roots: { header: [paragraph('he'), paragraph('new'), paragraph('ad')] },
      }
    );
    assert.equal(
      editorGetLastCommit(editor)?.operations.every(
        (operation) => operation.root === 'header'
      ),
      true
    );
  });

  it('routes static point node inserts through their explicit root', () => {
    const editor = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: {
          header: [paragraph('head')],
        },
      },
    });

    editorInsertNodes(editor, paragraph('new'), {
      at: { path: [0, 0], offset: 2, root: 'header' },
    });

    assert.deepEqual(
      editor.read((state) => state.value.get()),
      {
        children: [paragraph('body')],
        roots: { header: [paragraph('he'), paragraph('new'), paragraph('ad')] },
      }
    );
    assert.equal(
      editorGetLastCommit(editor)?.operations.every(
        (operation) => operation.root === 'header'
      ),
      true
    );
  });

  it('rejects operations with non-string roots', () => {
    assert.equal(
      OperationApi.isOperation({
        offset: 0,
        path: [0, 0],
        root: null,
        text: 'x',
        type: 'insert_text',
      }),
      false
    );
    assert.equal(
      OperationApi.isOperation({
        offset: 0,
        path: [0, 0],
        root: 1,
        text: 'x',
        type: 'insert_text',
      }),
      false
    );
  });

  it('rejects replayed operations with non-string roots', () => {
    const editor = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: {
          header: [paragraph('head')],
        },
      },
    });

    assert.throws(() => {
      editor.update((tx) => {
        tx.operations.replay([
          {
            offset: 0,
            path: [0, 0],
            root: null,
            text: 'x',
            type: 'insert_text',
          },
        ] as never);
      });
    }, /Cannot replay an invalid Plite operation/);

    assert.deepEqual(
      editor.read((state) => state.value.get()),
      {
        children: [paragraph('body')],
        roots: { header: [paragraph('head')] },
      }
    );
  });

  it('infers set_selection roots from explicit range points', () => {
    const editor = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: {
          header: [paragraph('header')],
        },
      },
    });
    const headerSelection = {
      anchor: { path: [0, 0], offset: 1, root: 'header' },
      focus: { path: [0, 0], offset: 1, root: 'header' },
    };

    editor.update((tx) => {
      tx.selection.set(headerSelection);
    });

    assert.deepEqual(
      editor.read((state) => state.selection.get()),
      headerSelection
    );
    assert.equal(editorGetLastCommit(editor)?.operations[0]?.root, 'header');
  });

  it('replays inverted selection operations through the restored root', () => {
    const editor = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: {
          header: [paragraph('header')],
        },
      },
    });
    const mainSelection = {
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 4 },
    };
    const headerSelection = {
      anchor: { path: [0, 0], offset: 1, root: 'header' },
      focus: { path: [0, 0], offset: 1, root: 'header' },
    };

    editor.update((tx) => {
      tx.selection.set(mainSelection);
    });
    editor.update((tx) => {
      tx.selection.set(headerSelection);
    });

    const selectionOperation = editorGetLastCommit(editor)?.operations.find(
      (operation) => operation.type === 'set_selection'
    );

    assert(selectionOperation);
    const inverse = OperationApi.inverse(selectionOperation);

    assert.equal(inverse.root, 'main');

    editor.update((tx) => {
      tx.operations.replay([inverse]);
    });

    assert.deepEqual(
      editor.read((state) => state.selection.get()),
      mainSelection
    );
  });

  it('inverts selection removal through the removed selection root', () => {
    const headerSelection = {
      anchor: { path: [0, 0], offset: 1, root: 'header' },
      focus: { path: [0, 0], offset: 1, root: 'header' },
    };

    assert.deepEqual(
      OperationApi.inverse({
        type: 'set_selection',
        properties: headerSelection,
        newProperties: null,
        root: 'header',
      }),
      {
        type: 'set_selection',
        properties: null,
        newProperties: headerSelection,
        root: 'header',
      }
    );
  });

  it('preserves operation root when inverting rootless selection removal', () => {
    const headerSelection = {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    };

    assert.deepEqual(
      OperationApi.inverse({
        type: 'set_selection',
        properties: headerSelection,
        newProperties: null,
        root: 'header',
      }),
      {
        type: 'set_selection',
        properties: null,
        newProperties: headerSelection,
        root: 'header',
      }
    );
  });

  it('preserves operation root when inverting rootless selection replacement', () => {
    const previousSelection = {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    };
    const nextSelection = {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    };

    assert.deepEqual(
      OperationApi.inverse({
        type: 'set_selection',
        properties: previousSelection,
        newProperties: nextSelection,
        root: 'header',
      }),
      {
        type: 'set_selection',
        properties: nextSelection,
        newProperties: previousSelection,
        root: 'header',
      }
    );
  });

  it('inverts selection creation through the created selection root', () => {
    const headerSelection = {
      anchor: { path: [0, 0], offset: 1, root: 'header' },
      focus: { path: [0, 0], offset: 1, root: 'header' },
    };

    assert.deepEqual(
      OperationApi.inverse({
        type: 'set_selection',
        properties: null,
        newProperties: headerSelection,
        root: 'header',
      }),
      {
        type: 'set_selection',
        properties: headerSelection,
        newProperties: null,
        root: 'header',
      }
    );
  });
});
