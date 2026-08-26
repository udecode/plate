import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  createEditorView,
  defineEditorSchema,
  type Element,
  schema,
  SelectionApi,
} from '@platejs/plite';
import { insertNodes as editorInsertNodes } from '@platejs/plite/internal';

const paragraph = (text: string) =>
  ({
    type: 'paragraph',
    children: [{ text }],
  }) satisfies Element;

const voidBlock = defineEditorSchema('schema:test-void-block', {
  elements: {
    paragraph: { content: schema.content.text() } as const,
    'void-block': { void: 'block' } as const,
  },
  id: 'test-void-block',
  root: schema.content.types(['paragraph', 'void-block']),
  roots: {
    header: schema.content.types(['paragraph', 'void-block']),
  },
  unknown: 'preserve',
  version: 1,
});

describe('rooted transaction contract', () => {
  it('keeps path anchors root-local', () => {
    const runtime = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const mainEditor = createEditorView(runtime);
    const headerEditor = createEditorView(runtime, { root: 'header' });
    const anchor = headerEditor.anchor([0], {
      association: 'forward',
      deletion: 'drop',
    });

    mainEditor.update((tx) => {
      tx.nodes.insert(paragraph('main-before'), { at: [0] });
    });
    assert.deepEqual(anchor.resolve(), [0]);

    headerEditor.update((tx) => {
      tx.nodes.insert(paragraph('header-before'), { at: [0] });
    });
    assert.deepEqual(anchor.release(), [1]);
  });

  it('keeps sibling-root structural changes from retagging selection', () => {
    const selection = {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 4 },
    };
    const editor = createEditor({
      initialValue: {
        children: [paragraph('main')],
        roots: { header: [paragraph('a'), paragraph('b')] },
      },
    });

    editor.update((tx) => {
      tx.selection.set(selection);
      tx.nodes.merge({
        at: { path: [1, 0], offset: 0, root: 'header' },
      });
      tx.nodes.split({ at: { path: [0, 0], offset: 1, root: 'header' } });
    });

    assert.deepEqual(
      editor.read((state) => state.selection()),
      { anchor: selection.anchor, focus: selection.focus }
    );
  });

  it('deletes and replaces explicit ranges in their own root', () => {
    const editor = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });

    editor.update((tx) => {
      tx.text.delete({
        at: {
          kind: 'text',
          anchor: { path: [0, 0], offset: 1, root: 'header' },
          focus: { path: [0, 0], offset: 3, root: 'header' },
        },
      });
      tx.text.insert('X', {
        at: {
          kind: 'text',
          anchor: { path: [0, 0], offset: 1, root: 'header' },
          focus: { path: [0, 0], offset: 2, root: 'header' },
        },
      });
    });

    assert.deepEqual(
      editor.read((state) => state.value()),
      {
        children: [paragraph('body')],
        roots: { header: [paragraph('hXer')] },
      }
    );
  });

  it('routes explicit point inserts against the target root', () => {
    const editor = createEditor({
      extensions: [voidBlock] as const,
      initialValue: {
        children: [{ type: 'void-block', children: [{ text: '' }] }],
        roots: { header: [paragraph('head')] },
      },
    });

    editor.update((tx) => {
      tx.text.insert('X', {
        at: { path: [0, 0], offset: 2, root: 'header' },
      });
    });

    assert.deepEqual(
      editor.read((state) => state.value()),
      {
        children: [{ type: 'void-block', children: [{ text: '' }] }],
        roots: { header: [paragraph('heXad')] },
      }
    );
  });

  it('normalizes every root touched by one transaction', () => {
    const editor = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('head')] },
      },
    });

    editor.update((tx) => {
      tx.roots.replace('header', [
        paragraph('head'),
        { type: 'block', children: [] },
      ]);
      tx.text.insert('!', { at: { path: [0, 0], offset: 4 } });
    });

    assert.deepEqual(
      editor.read((state) => state.value()),
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
  });

  it('creates, replaces, and deletes roots atomically', () => {
    const root = 'island:body';
    const editor = createEditor({ initialValue: [paragraph('body')] });

    editor.update((tx) => {
      tx.roots.create(root, [paragraph('child')]);
    });
    editor.update((tx) => {
      tx.roots.replace(root, [paragraph('updated')]);
    });
    assert.deepEqual(
      editor.read((state) => state.value()),
      {
        children: [paragraph('body')],
        roots: { [root]: [paragraph('updated')] },
      }
    );

    editor.update((tx) => {
      tx.roots.delete(root);
    });
    assert.deepEqual(
      editor.read((state) => state.value()),
      {
        children: [paragraph('body')],
      }
    );
  });

  it('fails loudly for invalid root lifecycle calls', () => {
    const root = 'island:body';
    const editor = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: { [root]: [paragraph('child')] },
      },
    });

    assert.throws(
      () =>
        editor.update((tx) => {
          tx.roots.create(root, [paragraph('duplicate')]);
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
    const primaryRoot: string = 'main';

    assert.throws(
      () =>
        editor.update((tx) => {
          tx.roots.delete(primaryRoot);
        }),
      /Cannot mutate the primary editor root/
    );
  });

  it('routes explicit and implicit node inserts through the selected root', () => {
    const initialValue = {
      children: [paragraph('body')],
      roots: { header: [paragraph('head')] },
    };
    const explicitEditor = createEditor({ initialValue });
    const implicitEditor = createEditor({ initialValue });

    explicitEditor.update((tx) => {
      tx.nodes.insert(paragraph('new'), {
        at: { path: [0, 0], offset: 2, root: 'header' },
      });
    });
    implicitEditor.update((tx) => {
      tx.selection.set({ path: [0, 0], offset: 2, root: 'header' });
      tx.nodes.insert(paragraph('new'));
    });

    const expected = {
      children: [paragraph('body')],
      roots: { header: [paragraph('he'), paragraph('new'), paragraph('ad')] },
    };
    assert.deepEqual(
      explicitEditor.read((state) => state.value()),
      expected
    );
    assert.deepEqual(
      implicitEditor.read((state) => state.value()),
      expected
    );
  });

  it('routes static point node inserts through their explicit root', () => {
    const editor = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('head')] },
      },
    });

    editorInsertNodes(editor as never, paragraph('new'), {
      at: { path: [0, 0], offset: 2, root: 'header' },
    });

    assert.deepEqual(
      editor.read((state) => state.value()),
      {
        children: [paragraph('body')],
        roots: { header: [paragraph('he'), paragraph('new'), paragraph('ad')] },
      }
    );
  });

  it('keeps explicit selection root metadata', () => {
    const editor = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const selection = {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 1, root: 'header' },
      focus: { path: [0, 0], offset: 1, root: 'header' },
    };

    editor.update((tx) => {
      tx.selection.set(selection);
    });
    assert.deepEqual(
      editor.read((state) => state.selection()),
      { anchor: selection.anchor, focus: selection.focus }
    );
  });

  it('routes exact node removals through their named root', () => {
    const editor = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: {
          header: [paragraph('one'), paragraph('middle'), paragraph('three')],
        },
      },
    });

    editor.update((tx) => {
      tx.nodes.remove({
        at: SelectionApi.nodes([[0], [2]], { root: 'header' }),
      });
    });

    assert.deepEqual(editor.read.value(), {
      children: [paragraph('body')],
      roots: { header: [paragraph('middle')] },
    });
  });

  it('routes exact node merges through their named root', () => {
    const editor = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('one'), paragraph('two')] },
      },
    });

    editor.update((tx) => {
      tx.nodes.merge({ at: SelectionApi.nodes([[1]], { root: 'header' }) });
    });

    assert.deepEqual(editor.read.value(), {
      children: [paragraph('body')],
      roots: { header: [paragraph('onetwo')] },
    });
  });

  it('routes exact node moves through their named root', () => {
    const editor = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('one'), paragraph('two')] },
      },
    });

    editor.update((tx) => {
      tx.nodes.move({
        at: SelectionApi.nodes([[0]], { root: 'header' }),
        to: [2],
      });
    });

    assert.deepEqual(editor.read.value(), {
      children: [paragraph('body')],
      roots: { header: [paragraph('two'), paragraph('one')] },
    });
  });

  it('routes exact node wraps through their named root', () => {
    const editor = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });

    editor.update((tx) => {
      tx.nodes.wrap(
        { type: 'quote', children: [] },
        { at: SelectionApi.nodes([[0]], { root: 'header' }) }
      );
    });

    assert.deepEqual(editor.read.value(), {
      children: [paragraph('body')],
      roots: {
        header: [{ type: 'quote', children: [paragraph('header')] }],
      },
    });
  });

  it('routes exact node unwraps through their named root', () => {
    const editor = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: {
          header: [{ type: 'quote', children: [paragraph('header')] }],
        },
      },
    });

    editor.update((tx) => {
      tx.nodes.unwrap({ at: SelectionApi.nodes([[0]], { root: 'header' }) });
    });

    assert.deepEqual(editor.read.value(), {
      children: [paragraph('body')],
      roots: { header: [paragraph('header')] },
    });
  });

  it('routes exact node lifts through their named root', () => {
    const editor = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: {
          header: [{ type: 'quote', children: [paragraph('header')] }],
        },
      },
    });

    editor.update((tx) => {
      tx.nodes.lift({ at: SelectionApi.nodes([[0, 0]], { root: 'header' }) });
    });

    assert.deepEqual(editor.read.value(), {
      children: [paragraph('body')],
      roots: { header: [paragraph('header')] },
    });
  });
});
