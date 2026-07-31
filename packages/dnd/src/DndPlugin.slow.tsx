import React from 'react';

import { act, render } from '@testing-library/react';
import { Plate, PlateContent, createPlateEditor } from '@platejs/core/react';
import { pipeHandler } from '@platejs/core/react/internal';

import { DndPlugin } from './DndPlugin';

describe('DndPlugin', () => {
  it('updates drag state from the drag handlers', () => {
    const editor = createPlateEditor({
      plugins: [DndPlugin],
    });
    const context = editor.plugin(DndPlugin);
    const target = document.createElement('div');
    const dataTransfer = {
      dropEffect: 'none',
      effectAllowed: 'none',
    } as DataTransfer;
    const event = { dataTransfer, target } as unknown as React.DragEvent;

    target.dataset.blockId = 'block-1';

    pipeHandler(editor, { handlerKey: 'onDragStart' })?.(event);
    pipeHandler(editor, { handlerKey: 'onDragEnter' })?.(event);

    expect(dataTransfer.effectAllowed).toBe('move');
    expect(dataTransfer.dropEffect).toBe('move');
    expect(context.store.get('draggingId')).toBe('block-1');
    expect(context.store.get('isDragging')).toBe(true);
    expect(context.store.get('_isOver')).toBe(true);
    const dropResult: unknown = pipeHandler(editor, {
      handlerKey: 'onDrop',
    })?.(event);
    expect(dropResult).toBe(true);

    pipeHandler(editor, { handlerKey: 'onDragEnd' })?.(event);

    expect(context.store.get('isDragging')).toBe(false);
    expect(context.store.get('dropTarget')).toEqual({ id: null, line: '' });
  });

  it('ignores drag starts without a block id and clears preview content on focus', () => {
    const preview = document.createElement('div');
    const editor = createPlateEditor({
      plugins: [
        DndPlugin.configure({
          initialState: { multiplePreviewRef: { current: preview } },
        }),
      ],
    });
    const context = editor.plugin(DndPlugin);
    const dataTransfer = {
      dropEffect: 'none',
      effectAllowed: 'none',
    } as DataTransfer;
    const dragEvent = {
      dataTransfer,
      target: document.createElement('div'),
    } as unknown as React.DragEvent;
    const focusEvent = {} as React.FocusEvent;

    preview.append(document.createElement('span'));
    pipeHandler(editor, { handlerKey: 'onDragStart' })?.(dragEvent);
    pipeHandler(editor, { handlerKey: 'onFocus' })?.(focusEvent);

    expect(context.store.get('draggingId')).toBeNull();
    expect(context.store.get('isDragging')).toBe(false);
    expect(context.store.get('_isOver')).toBe(false);
    expect(context.store.get('dropTarget')).toEqual({ id: null, line: '' });
    expect(preview.childElementCount).toBe(0);
  });

  it('clears drop targets on document drop and on dragleave outside the editor', () => {
    const editor = createPlateEditor({
      plugins: [DndPlugin],
    });
    const context = editor.plugin(DndPlugin);
    const inside = document.createElement('div');
    const block = document.createElement('div');
    const blockText = document.createElement('span');
    const outside = document.createElement('div');

    const view = render(
      <Plate editor={editor}>
        <PlateContent data-testid="editor" />
      </Plate>
    );
    const editorNode = view.getByTestId('editor');

    block.dataset.blockId = 'block-1';
    block.append(blockText);
    editorNode.append(inside, block);
    document.body.append(outside);
    const dragLeaveEvent = (relatedTarget: EventTarget | null) => {
      const event = new Event('dragleave', { bubbles: true });

      Object.defineProperty(event, 'relatedTarget', { value: relatedTarget });

      return event;
    };

    act(() => {
      context.store.set({ dropTarget: { id: 'block-1', line: 'top' } });
      outside.dispatchEvent(new Event('dragleave', { bubbles: true }));
    });
    expect(context.store.get('dropTarget')).toBeUndefined();

    act(() => {
      context.store.set({ dropTarget: { id: 'block-1', line: 'top' } });
      inside.dispatchEvent(new Event('dragleave', { bubbles: true }));
    });
    expect(context.store.get('dropTarget')).toEqual({
      id: 'block-1',
      line: 'top',
    });

    act(() => {
      block.dispatchEvent(dragLeaveEvent(editorNode));
    });
    expect(context.store.get('dropTarget')).toBeUndefined();

    act(() => {
      context.store.set({ dropTarget: { id: 'block-1', line: 'top' } });
      blockText.dispatchEvent(dragLeaveEvent(inside));
    });
    expect(context.store.get('dropTarget')).toBeUndefined();

    const nextBlock = document.createElement('div');
    nextBlock.dataset.blockId = 'block-2';
    editorNode.append(nextBlock);
    act(() => {
      context.store.set({ dropTarget: { id: 'block-1', line: 'top' } });
      block.dispatchEvent(dragLeaveEvent(nextBlock));
    });
    expect(context.store.get('dropTarget')).toEqual({
      id: 'block-1',
      line: 'top',
    });

    act(() => {
      document.dispatchEvent(new Event('drop'));
    });
    expect(context.store.get('_isOver')).toBe(false);
    expect(context.store.get('dropTarget')).toBeUndefined();

    view.unmount();
    editorNode.remove();
    outside.remove();
  });

  it('renders the scroller when enabled and responds to live state', async () => {
    const editor = createPlateEditor({
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
      <Plate editor={editor}>
        <PlateContent />
      </Plate>
    );

    try {
      expect(view.container.querySelectorAll('.dnd-scroll-area')).toHaveLength(
        0
      );

      act(() => context.store.set({ isDragging: true }));
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 110));
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
        await new Promise((resolve) => setTimeout(resolve, 110));
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
