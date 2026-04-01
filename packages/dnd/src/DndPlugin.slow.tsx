import React from 'react';

import { render } from '@testing-library/react';
import { createSlateEditor } from 'platejs';

import { DndScroller } from './components/Scroller';
import { DndPlugin } from './DndPlugin';

describe('DndPlugin', () => {
  const handlers = (DndPlugin as any).handlers;

  it('updates drag state from the drag handlers', () => {
    const editor = {
      setOption: mock(),
    } as any;
    const plugin = DndPlugin;
    const target = document.createElement('div');

    target.dataset.blockId = 'block-1';

    const event = {
      dataTransfer: {
        dropEffect: '',
        effectAllowed: '',
      },
      target,
    } as any;

    handlers.onDragStart({ editor, event, plugin });
    handlers.onDragEnter({ editor, plugin });
    handlers.onDragEnd({ editor, plugin });

    expect(event.dataTransfer.effectAllowed).toBe('move');
    expect(event.dataTransfer.dropEffect).toBe('move');
    expect(editor.setOption).toHaveBeenCalledWith(
      plugin,
      'draggingId',
      'block-1'
    );
    expect(editor.setOption).toHaveBeenCalledWith(plugin, 'isDragging', true);
    expect(editor.setOption).toHaveBeenCalledWith(plugin, '_isOver', true);
    expect(editor.setOption).toHaveBeenCalledWith(plugin, 'isDragging', false);
    expect(editor.setOption).toHaveBeenCalledWith(plugin, 'dropTarget', {
      id: null,
      line: '',
    });
    expect(handlers.onDrop({ getOptions: () => ({ isDragging: true }) })).toBe(
      true
    );
  });

  it('ignores drag starts without a block id and clears preview content on focus', () => {
    const replaceChildren = mock();
    const editor = {
      getOption: mock(() => ({
        current: { replaceChildren },
      })),
      setOption: mock(),
    } as any;

    handlers.onDragStart({
      editor,
      event: {
        dataTransfer: {
          dropEffect: '',
          effectAllowed: '',
        },
        target: document.createElement('div'),
      },
      plugin: DndPlugin,
    });
    handlers.onFocus({ editor, plugin: DndPlugin });

    expect(editor.setOption).not.toHaveBeenCalledWith(
      DndPlugin,
      'draggingId',
      expect.anything()
    );
    expect(editor.setOption).toHaveBeenCalledWith(
      DndPlugin,
      'isDragging',
      false
    );
    expect(editor.setOption).toHaveBeenCalledWith(DndPlugin, 'dropTarget', {
      id: null,
      line: '',
    });
    expect(editor.setOption).toHaveBeenCalledWith(DndPlugin, '_isOver', false);
    expect(replaceChildren).toHaveBeenCalled();
  });

  it('clears drop targets on document drop and on dragleave outside the editor', () => {
    const editor = createSlateEditor({ plugins: [DndPlugin] }) as any;
    const setOption = mock();
    const editorNode = document.createElement('div');
    const inside = document.createElement('div');
    const outside = document.createElement('div');

    editorNode.append(inside);
    document.body.append(editorNode, outside);
    editor.api.toDOMNode = mock(() => editorNode);

    const TestComponent = () => {
      (DndPlugin as any).useHooks({ editor, setOption });

      return null;
    };

    const view = render(<TestComponent />);

    outside.dispatchEvent(new Event('dragleave', { bubbles: true }));

    expect(setOption).toHaveBeenCalledWith('dropTarget', undefined);

    setOption.mockClear();
    inside.dispatchEvent(new Event('dragleave', { bubbles: true }));

    expect(setOption).not.toHaveBeenCalled();

    document.dispatchEvent(new Event('drop'));

    expect(setOption).toHaveBeenCalledWith('_isOver', false);
    expect(setOption).toHaveBeenCalledWith('dropTarget', undefined);

    view.unmount();
    editorNode.remove();
    outside.remove();
  });

  it('only exposes the scroller render hook when enabled', () => {
    const enabledEditor = createSlateEditor({
      plugins: [
        DndPlugin.configure({
          options: {
            enableScroller: true,
            scrollerProps: { height: 40 },
          },
        }),
      ],
    });
    const enabledPlugin = enabledEditor.getPlugin(DndPlugin);
    const disabledPlugin = createSlateEditor({
      plugins: [DndPlugin],
    }).getPlugin(DndPlugin);
    const scroller = enabledPlugin.render.afterEditable?.({} as any) as any;

    expect(scroller.type).toBe(DndScroller);
    expect(scroller.props.height).toBe(40);
    expect(disabledPlugin.render.afterEditable).toBeUndefined();
  });
});
