import React from 'react';

import { render } from '@testing-library/react';
import {
  Plate,
  PlateContent,
  createPlateEditor,
  getEditorPlugin,
} from '@platejs/core/react';

import { DndScroller } from './components/Scroller';
import { DndPlugin } from './DndPlugin';

describe('DndPlugin', () => {
  it('updates drag state from the drag handlers', () => {
    const editor = createPlateEditor({ plugins: [DndPlugin] });
    const context = getEditorPlugin(editor, DndPlugin);
    const target = document.createElement('div');
    const dataTransfer = {
      dropEffect: 'none',
      effectAllowed: 'none',
    } as DataTransfer;
    const event = { dataTransfer, target } as unknown as React.DragEvent;

    target.dataset.blockId = 'block-1';

    DndPlugin.handlers.onDragStart?.({ ...context, event });
    DndPlugin.handlers.onDragEnter?.({ ...context, event });

    expect(dataTransfer.effectAllowed).toBe('move');
    expect(dataTransfer.dropEffect).toBe('move');
    expect(context.getOption('draggingId')).toBe('block-1');
    expect(context.getOption('isDragging')).toBe(true);
    expect(context.getOption('_isOver')).toBe(true);
    expect(DndPlugin.handlers.onDrop?.({ ...context, event })).toBe(true);

    DndPlugin.handlers.onDragEnd?.({ ...context, event });

    expect(context.getOption('isDragging')).toBe(false);
    expect(context.getOption('dropTarget')).toEqual({ id: null, line: '' });
  });

  it('ignores drag starts without a block id and clears preview content on focus', () => {
    const preview = document.createElement('div');
    const editor = createPlateEditor({
      plugins: [
        DndPlugin.configure({
          options: { multiplePreviewRef: { current: preview } },
        }),
      ],
    });
    const context = getEditorPlugin(editor, DndPlugin);
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
    DndPlugin.handlers.onDragStart?.({ ...context, event: dragEvent });
    DndPlugin.handlers.onFocus?.({ ...context, event: focusEvent });

    expect(context.getOption('draggingId')).toBeNull();
    expect(context.getOption('isDragging')).toBe(false);
    expect(context.getOption('_isOver')).toBe(false);
    expect(context.getOption('dropTarget')).toEqual({ id: null, line: '' });
    expect(preview.childElementCount).toBe(0);
  });

  it('clears drop targets on document drop and on dragleave outside the editor', () => {
    const editor = createPlateEditor({ plugins: [DndPlugin] });
    const context = getEditorPlugin(editor, DndPlugin);
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

    context.setOption('dropTarget', { id: 'block-1', line: 'top' });
    outside.dispatchEvent(new Event('dragleave', { bubbles: true }));
    expect(context.getOption('dropTarget')).toBeUndefined();

    context.setOption('dropTarget', { id: 'block-1', line: 'top' });
    inside.dispatchEvent(new Event('dragleave', { bubbles: true }));
    expect(context.getOption('dropTarget')).toEqual({
      id: 'block-1',
      line: 'top',
    });

    block.dispatchEvent(dragLeaveEvent(editorNode));
    expect(context.getOption('dropTarget')).toBeUndefined();

    context.setOption('dropTarget', { id: 'block-1', line: 'top' });
    blockText.dispatchEvent(dragLeaveEvent(inside));
    expect(context.getOption('dropTarget')).toBeUndefined();

    const nextBlock = document.createElement('div');
    nextBlock.dataset.blockId = 'block-2';
    editorNode.append(nextBlock);
    context.setOption('dropTarget', { id: 'block-1', line: 'top' });
    block.dispatchEvent(dragLeaveEvent(nextBlock));
    expect(context.getOption('dropTarget')).toEqual({
      id: 'block-1',
      line: 'top',
    });

    document.dispatchEvent(new Event('drop'));
    expect(context.getOption('_isOver')).toBe(false);
    expect(context.getOption('dropTarget')).toBeUndefined();

    view.unmount();
    editorNode.remove();
    outside.remove();
  });

  it('only exposes the scroller render hook when enabled', () => {
    const enabledPlugin = createPlateEditor({
      plugins: [
        DndPlugin.configure({
          options: {
            enableScroller: true,
            scrollerProps: { height: 40 },
          },
        }),
      ],
    }).getPlugin(DndPlugin);
    const disabledPlugin = createPlateEditor({
      plugins: [DndPlugin],
    }).getPlugin(DndPlugin);
    const scroller = enabledPlugin.render?.afterEditable?.();

    expect(scroller?.type).toBe(DndScroller);
    expect(scroller?.props.height).toBe(40);
    expect(disabledPlugin.render?.afterEditable).toBeUndefined();
  });
});
