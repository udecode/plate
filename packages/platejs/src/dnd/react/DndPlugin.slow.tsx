import { act, render } from '@testing-library/react';
import React from 'react';

import type { NodeEntry, Element, NodeKey } from '../../core';
import {
  EditorRoot,
  EditorContent,
  EditorElement,
  createEditor,
  definePlugin,
} from '../../react/core';
import { SuggestionPlugin } from '../../react/features/suggestion/SuggestionPlugin';
import { pipeHandler } from '../../react/utils/pipeHandler.internal';
import { DndPlugin } from './DndPlugin';
import { useDndPlugin } from './useDndPlugin';

function DndEditable() {
  const [element, setElement] = React.useState<HTMLDivElement | null>(null);
  useDndPlugin(element);
  return <EditorContent ref={setElement} data-testid="editor" />;
}

const blockNodeKey = 'runtime-block-1' as NodeKey;

describe('DndPlugin', () => {
  it('reads a retained block drag payload from its own view through deletion history and rejection', async () => {
    let readDragEntries = (): ReadonlyArray<NodeEntry<Element>> => [];
    const ImagePlugin = definePlugin('image', {
      schema: { element: { void: 'block' } },
    }).configure({
      component: (props) => {
        readDragEntries = () =>
          props.editor.plugin(DndPlugin).read.dragEntries(props.element);

        return <EditorElement {...props}>{props.children}</EditorElement>;
      },
    });
    const editor = createEditor({
      initialValue: [
        { type: 'paragraph', children: [{ text: 'Before' }] },
        { type: 'image', children: [{ text: '' }] },
        { type: 'paragraph', children: [{ text: 'After' }] },
      ],
      plugins: [DndPlugin, SuggestionPlugin, ImagePlugin],
      userId: 'alice',
    });
    const mounted = render(
      <EditorRoot
        editor={editor}
        authored={{ intent: 'propose', projection: 'markup' }}
      >
        <EditorContent />
      </EditorRoot>
    );
    try {
      await act(async () => {
        editor.update((tx) => {
          tx.authored.propose();
          tx.nodes.remove({ at: [1] });
        });
      });
      expect(readDragEntries().map(([node]) => node.type)).toEqual(['image']);

      await act(async () => editor.api.history.undo());
      expect(readDragEntries().map(([node]) => node.type)).toEqual(['image']);
      await act(async () => editor.api.history.redo());
      expect(readDragEntries().map(([node]) => node.type)).toEqual(['image']);

      await act(async () => {
        editor.update.authored.decide({
          action: 'reject',
          selection: editor.read.authored.select({ status: 'pending' }),
        });
      });
      expect(readDragEntries().map(([node]) => node.type)).toEqual(['image']);
    } finally {
      mounted.unmount();
    }
  });

  it('does not claim native drags from arbitrary Plite nodes', () => {
    const editor = createEditor({
      plugins: [DndPlugin],
    });
    const context = editor.plugin(DndPlugin);
    const target = document.createElement('div');
    const dataTransfer = {
      dropEffect: 'none',
      effectAllowed: 'none',
    } as DataTransfer;
    const event = { dataTransfer, target } as unknown as React.DragEvent;

    target.dataset.editorNodeKey = blockNodeKey;

    pipeHandler(editor, { handlerKey: 'onDragStart' })?.(event);
    pipeHandler(editor, { handlerKey: 'onDragEnter' })?.(event);
    const dragOverResult: unknown = pipeHandler(editor, {
      handlerKey: 'onDragOver',
    })?.(event);

    expect(dataTransfer.effectAllowed).toBe('none');
    expect(dataTransfer.dropEffect).toBe('none');
    expect(context.store.get('draggingKey')).toBeNull();
    expect(context.store.get('isDragging')).toBe(false);
    expect(context.store.get('_isOver')).toBe(true);
    expect(dragOverResult).toBe(false);
    const dropResult: unknown = pipeHandler(editor, {
      handlerKey: 'onDrop',
    })?.(event);
    expect(dropResult).toBe(false);
  });

  it('consumes drops only while the React DnD adapter owns the drag', () => {
    const editor = createEditor({
      plugins: [DndPlugin],
    });
    const context = editor.plugin(DndPlugin);
    const event = {} as React.DragEvent;

    context.store.set({
      _isOver: true,
      draggingKey: blockNodeKey,
      isDragging: true,
    });

    const dragOverResult: unknown = pipeHandler(editor, {
      handlerKey: 'onDragOver',
    })?.(event);
    const dropResult: unknown = pipeHandler(editor, {
      handlerKey: 'onDrop',
    })?.(event);

    expect(dragOverResult).toBe(true);
    expect(dropResult).toBe(true);

    pipeHandler(editor, { handlerKey: 'onDragEnd' })?.(event);

    expect(context.store.get('isDragging')).toBe(false);
    expect(context.store.get('dropTarget')).toEqual({ key: null, line: '' });
  });

  it('clears preview content on focus', () => {
    const preview = document.createElement('div');
    const editor = createEditor({
      plugins: [
        DndPlugin.configure({
          initialState: { multiplePreviewRef: { current: preview } },
        }),
      ],
    });
    const context = editor.plugin(DndPlugin);
    const focusEvent = {} as React.FocusEvent;

    preview.append(document.createElement('span'));
    pipeHandler(editor, { handlerKey: 'onFocus' })?.(focusEvent);

    expect(context.store.get('draggingKey')).toBeNull();
    expect(context.store.get('isDragging')).toBe(false);
    expect(context.store.get('_isOver')).toBe(false);
    expect(context.store.get('dropTarget')).toEqual({ key: null, line: '' });
    expect(preview.childElementCount).toBe(0);
  });

  it('clears drop targets on document drop and on dragleave outside the editor', () => {
    const editor = createEditor({
      plugins: [DndPlugin],
    });
    const context = editor.plugin(DndPlugin);
    const inside = document.createElement('div');
    const block = document.createElement('div');
    const blockText = document.createElement('span');
    const outside = document.createElement('div');

    const view = render(
      <EditorRoot editor={editor}>
        <DndEditable />
      </EditorRoot>
    );
    const editorNode = view.getByTestId('editor');

    block.dataset.editorNodeKey = blockNodeKey;
    block.append(blockText);
    editorNode.append(inside, block);
    document.body.append(outside);
    const dragLeaveEvent = (relatedTarget: EventTarget | null) => {
      const event = new Event('dragleave', { bubbles: true });

      Object.defineProperty(event, 'relatedTarget', { value: relatedTarget });

      return event;
    };

    act(() => {
      context.store.set({ dropTarget: { key: blockNodeKey, line: 'top' } });
      outside.dispatchEvent(new Event('dragleave', { bubbles: true }));
    });
    expect(context.store.get('dropTarget')).toBeNull();

    act(() => {
      context.store.set({ dropTarget: { key: blockNodeKey, line: 'top' } });
      inside.dispatchEvent(new Event('dragleave', { bubbles: true }));
    });
    expect(context.store.get('dropTarget')).toEqual({
      key: blockNodeKey,
      line: 'top',
    });

    act(() => {
      block.dispatchEvent(dragLeaveEvent(editorNode));
    });
    expect(context.store.get('dropTarget')).toBeNull();

    act(() => {
      context.store.set({ dropTarget: { key: blockNodeKey, line: 'top' } });
      blockText.dispatchEvent(dragLeaveEvent(inside));
    });
    expect(context.store.get('dropTarget')).toBeNull();

    const nextBlock = document.createElement('div');
    nextBlock.dataset.editorNodeKey = 'runtime-block-2';
    editorNode.append(nextBlock);
    act(() => {
      context.store.set({ dropTarget: { key: blockNodeKey, line: 'top' } });
      block.dispatchEvent(dragLeaveEvent(nextBlock));
    });
    expect(context.store.get('dropTarget')).toEqual({
      key: blockNodeKey,
      line: 'top',
    });

    act(() => {
      document.dispatchEvent(new Event('drop'));
    });
    expect(context.store.get('_isOver')).toBe(false);
    expect(context.store.get('dropTarget')).toBeNull();

    view.unmount();
    editorNode.remove();
    outside.remove();
  });

  it('renders the scroller when enabled and responds to live state', async () => {
    const editor = createEditor({
      plugins: [
        DndPlugin.configure({
          initialState: {
            enableScroller: true,
            scrollerProps: {
              height: 40,
              scrollAreaProps: { className: 'dnd-scroll-area' },
            },
          },
        }),
      ],
    });
    const context = editor.plugin(DndPlugin);
    const view = render(
      <EditorRoot editor={editor}>
        <EditorContent />
      </EditorRoot>
    );

    try {
      expect(view.container.querySelectorAll('.dnd-scroll-area')).toHaveLength(
        0
      );

      act(() => context.store.set({ isDragging: true }));
      await act(async () => {
        await new Promise((resolve) => {
          setTimeout(resolve, 110);
        });
      });

      const areas = view.container.querySelectorAll('.dnd-scroll-area');

      expect(areas).toHaveLength(2);
      expect(
        Array.from(areas).map((area) => (area as HTMLElement).style.height)
      ).toEqual(['40px', '40px']);

      act(() => context.store.set({ enableScroller: false }));
      expect(view.container.querySelectorAll('.dnd-scroll-area')).toHaveLength(
        0
      );

      act(() => context.store.set({ enableScroller: true }));
      await act(async () => {
        await new Promise((resolve) => {
          setTimeout(resolve, 110);
        });
      });
      expect(view.container.querySelectorAll('.dnd-scroll-area')).toHaveLength(
        2
      );

      act(() =>
        context.store.set({
          scrollerProps: {
            height: 60,
            scrollAreaProps: { className: 'dnd-scroll-area' },
          },
        })
      );
      expect(
        Array.from(view.container.querySelectorAll('.dnd-scroll-area')).map(
          (area) => (area as HTMLElement).style.height
        )
      ).toEqual(['60px', '60px']);
    } finally {
      view.unmount();
    }
  });
});
