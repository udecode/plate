import { ElementApi, type Element } from '../../core';
import { BaseListPlugin } from '../../features/list/lib/BaseListPlugin';
import { createEditor } from '../../react/core';
import { DndPlugin } from './DndPlugin';

const createFixture = (readOnly = false) => {
  const editor = createEditor({
    plugins: [DndPlugin, BaseListPlugin],
    readOnly,
  });
  editor.update.value.replace({
    children: [
      { type: 'paragraph', children: [{ text: 'first' }] },
      { type: 'paragraph', children: [{ text: 'second' }] },
      { type: 'paragraph', children: [{ text: 'third' }] },
    ],
    selection: null,
  });
  const nodes = editor.read.children().filter(ElementApi.isElement);
  return { editor, nodes, dnd: editor.plugin(DndPlugin) };
};

describe('DnD preparation', () => {
  it('keeps drag payload state separate between editor instances', () => {
    const first = createFixture();
    first.dnd.api.prepareDrag(first.nodes[0]);
    const second = createFixture();
    expect(second.dnd.store.get('draggingKey')).toBeNull();
    expect(first.dnd.store.get('draggingKey')).toEqual([
      first.editor.key(first.nodes[0]),
    ]);
  });
  it('uses the clicked block when it is outside the selection without changing selection during a read', () => {
    const { editor, nodes, dnd } = createFixture();
    editor.update.selection.setNodes([nodes[0]]);
    const before = editor.read.selection();

    expect(
      dnd.read.dragEntries(nodes[2]).map(([node]) => editor.key(node))
    ).toEqual([editor.key(nodes[2])]);
    expect(editor.read.selection()).toEqual(before);
  });

  it('preserves selected block order and includes nested list items', () => {
    const { editor, dnd } = createFixture();
    editor.update.value.replace({
      children: [
        {
          type: 'paragraph',
          indent: 1,
          listType: 'bulleted',
          children: [{ text: 'parent' }],
        },
        {
          type: 'paragraph',
          indent: 2,
          listType: 'bulleted',
          children: [{ text: 'child' }],
        },
        {
          type: 'paragraph',
          indent: 1,
          listType: 'bulleted',
          children: [{ text: 'next' }],
        },
      ],
      selection: null,
    });
    const nodes = editor.read.children().filter(ElementApi.isElement);
    editor.update.selection.setNodes([nodes[0]]);

    expect(
      dnd.read.dragEntries(nodes[0]).map(([node]) => editor.key(node))
    ).toEqual(nodes.slice(0, 2).map((node) => editor.key(node)));
  });

  it('isolates previews and keeps unmounted selected blocks in the drag payload', () => {
    const { editor, nodes, dnd } = createFixture();
    editor.update.selection.setNodes(nodes.slice(0, 2));
    const source = document.createElement('div');
    source.setAttribute('data-plite-node-key', editor.key(nodes[0]));
    source.innerHTML =
      '<button data-plite-selectable="true"><span data-plite-string="true">source</span></button>';
    const resolve = spyOn(editor.api.dom, 'resolveDOMNode').mockImplementation(
      (node) =>
        editor.key(node as Element) === editor.key(nodes[0]) ? source : null
    );
    try {
      const previews = dnd.api.prepareDrag(nodes[0]);

      expect(previews.length).toBe(1);
      expect(previews[0]?.domNode).toBe(source);
      expect(previews[0]?.preview).not.toBe(source);
      expect(previews[0]?.preview.outerHTML.includes('data-plite')).toBe(false);
      expect(previews[0]?.preview.inert).toBe(true);
      expect(previews[0]?.preview.getAttribute('aria-hidden')).toBe('true');
      expect(previews[0]?.preview.contentEditable).toBe('false');
      expect(source.outerHTML.includes('data-plite')).toBe(true);
      expect(dnd.store.get('draggingKey')).toEqual(
        nodes.slice(0, 2).map((node) => editor.key(node))
      );
      expect(editor.read.selection.nodes().length).toBe(2);
    } finally {
      resolve.mockRestore();
    }
  });

  it('ignores a removed block and read-only preparation', () => {
    const { editor, nodes, dnd } = createFixture();
    editor.update.nodes.remove({ at: [0] });
    expect(dnd.read.dragEntries(nodes[0])).toEqual([]);
    expect(dnd.api.prepareDrag(nodes[0])).toEqual([]);
    expect(dnd.store.get('draggingKey')).toBeNull();
    const readOnly = createFixture(true);
    expect(readOnly.editor.read.view.isReadOnly()).toBe(true);
    expect(readOnly.dnd.api.prepareDrag(readOnly.nodes[0])).toEqual([]);
    expect(readOnly.dnd.store.get('draggingKey')).toBeNull();
  });
});
