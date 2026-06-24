import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  getChildren as editorGetChildren,
  getSelection as editorGetSelection,
  replace as editorReplace,
} from '@platejs/plite/internal';

import { createEditor, type Descendant, NodeApi } from '../src';

import { setEditorTargetRuntime } from '../src/internal';

const paragraph = (text: string, props: Record<string, unknown> = {}) =>
  ({
    type: 'paragraph',
    ...props,
    children: [{ text }],
  }) as Descendant;

const setupEditor = () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [paragraph('one'), paragraph('two')],
    selection: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
  });

  return editor;
};

const getElementType = (node: Descendant) => {
  assert(NodeApi.isElement(node));

  return node.type;
};

describe('transaction target runtime', () => {
  it('resolves implicit targets through the installed runtime', () => {
    const editor = setupEditor();
    let calls = 0;

    setEditorTargetRuntime(editor, {
      resolveImplicitTarget(_editor, request) {
        calls += 1;
        assert.deepEqual(request.fallback, {
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 0 },
        });

        return {
          anchor: { path: [1, 0], offset: 0 },
          focus: { path: [1, 0], offset: 0 },
        };
      },
    });

    editor.update((tx) => {
      tx.nodes.set({ type: 'heading-one' } as never);
    });

    assert.equal(calls, 1);
    assert.equal(getElementType(editorGetChildren(editor)[0]!), 'paragraph');
    assert.equal(getElementType(editorGetChildren(editor)[1]!), 'heading-one');
    assert.deepEqual(editorGetSelection(editor), {
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: 0 },
    });
  });

  it('does not invoke target runtime for explicit targets', () => {
    const editor = setupEditor();
    let calls = 0;

    setEditorTargetRuntime(editor, {
      resolveImplicitTarget() {
        calls += 1;
        return null;
      },
    });

    editor.update((tx) => {
      tx.nodes.set({ type: 'heading-one' } as never, { at: [1] });
    });

    assert.equal(calls, 0);
    assert.equal(getElementType(editorGetChildren(editor)[0]!), 'paragraph');
    assert.equal(getElementType(editorGetChildren(editor)[1]!), 'heading-one');
  });

  it('does not invoke target runtime for explicit primitive targets', () => {
    const cases: Array<{
      run: Parameters<ReturnType<typeof setupEditor>['update']>[0];
      name: string;
    }> = [
      {
        name: 'select',
        run: (tx) =>
          tx.selection.set({
            anchor: { path: [1, 0], offset: 0 },
            focus: { path: [1, 0], offset: 0 },
          }),
      },
      {
        name: 'setNodes',
        run: (tx) =>
          tx.nodes.set({ type: 'heading-one' } as never, { at: [1] }),
      },
      {
        name: 'insertText',
        run: (tx) => tx.text.insert('!', { at: { path: [1, 0], offset: 3 } }),
      },
      {
        name: 'delete',
        run: (tx) =>
          tx.text.delete({
            at: {
              anchor: { path: [1, 0], offset: 0 },
              focus: { path: [1, 0], offset: 1 },
            },
          }),
      },
      {
        name: 'insertFragment',
        run: (tx) =>
          tx.fragment.insert([{ text: '!' }], {
            at: { path: [1, 0], offset: 3 },
          }),
      },
      {
        name: 'insertNodes',
        run: (tx) =>
          tx.nodes.insert({ text: '!' }, { at: { path: [1, 0], offset: 3 } }),
      },
      {
        name: 'removeNodes',
        run: (tx) => tx.nodes.remove({ at: [1] }),
      },
      {
        name: 'wrapNodes',
        run: (tx) =>
          tx.nodes.wrap({ type: 'quote', children: [] } as never, {
            at: [1],
          }),
      },
      {
        name: 'unwrapNodes',
        run: (tx) => {
          tx.nodes.wrap({ type: 'quote', children: [] } as never, {
            at: [1],
          });
          tx.nodes.unwrap({
            at: [1, 0],
            match: (node) => NodeApi.isElement(node) && node.type === 'quote',
          });
        },
      },
    ];

    for (const { name, run } of cases) {
      const editor = setupEditor();
      let calls = 0;

      setEditorTargetRuntime(editor, {
        resolveImplicitTarget() {
          calls += 1;
          return null;
        },
      });

      editor.update((tx) => {
        run(tx);
      });

      assert.equal(calls, 0, name);
    }
  });

  it('exposes model selection reads without target freshness', () => {
    const editor = setupEditor();
    let calls = 0;
    let selection = null as ReturnType<typeof editorGetSelection>;

    setEditorTargetRuntime(editor, {
      resolveImplicitTarget() {
        calls += 1;
        return {
          anchor: { path: [1, 0], offset: 0 },
          focus: { path: [1, 0], offset: 0 },
        };
      },
    });

    editor.update((tx) => {
      selection = tx.selection.get();
    });

    assert.equal(calls, 0);
    assert.deepEqual(selection, {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
  });
});
