import type { DropTargetMonitor } from 'react-dnd';

import { type TElement, RangeApi } from 'platejs';
import { createPlateEditor } from 'platejs/react';

import type { DragItemNode } from '../types';

import { DndPlugin } from '../DndPlugin';
import * as onDropNodeModule from './onDropNode';
import { onHoverNode } from './onHoverNode';

describe('onHoverNode', () => {
  let editor: ReturnType<typeof createPlateEditor>;
  let dragItem: DragItemNode;

  const monitor = {} as DropTargetMonitor;
  const nodeRef = {};
  const dragElement = { id: 'drag' } as unknown as TElement;
  const hoverElement = { id: 'hover' } as unknown as TElement;

  let isExpandedSpy: ReturnType<typeof spyOn>;
  let isExpandedMock: ReturnType<typeof mock>;
  let getDropPathSpy: ReturnType<typeof spyOn>;
  let getDropPathMock: ReturnType<typeof mock>;

  beforeEach(() => {
    editor = createPlateEditor();
    editor.getOptions = mock();
    editor.selection = null;
    editor.setOption = mock();
    editor.tf.collapse = mock();
    editor.tf.focus = mock();

    dragItem = {
      id: 'drag',
      editorId: editor.id,
      element: dragElement,
    };

    (editor.getOptions as ReturnType<typeof mock>).mockReturnValue({
      _isOver: true,
      dropTarget: { id: null, line: '' },
    });

    isExpandedMock = mock();
    isExpandedSpy = spyOn(RangeApi, 'isExpanded').mockImplementation(
      isExpandedMock
    );

    getDropPathMock = mock();
    getDropPathSpy = spyOn(onDropNodeModule, 'getDropPath').mockImplementation(
      getDropPathMock
    );
  });

  afterEach(() => {
    isExpandedSpy?.mockRestore();
    getDropPathSpy?.mockRestore();
  });

  it('should update plugin options when direction changes', () => {
    getDropPathMock.mockReturnValueOnce({
      direction: 'bottom',
      dragPath: [0],
      to: [1],
    });

    isExpandedMock.mockReturnValue(false);

    onHoverNode(editor, {
      dragItem,
      element: hoverElement,
      monitor,
      nodeRef,
    });

    expect(editor.setOption).toHaveBeenCalledWith(DndPlugin, 'dropTarget', {
      id: 'hover',
      line: 'bottom',
    });
  });

  it('should collapse selection and focus editor if direction is returned and selection is expanded', () => {
    getDropPathMock.mockReturnValueOnce({
      direction: 'bottom',
      dragPath: [0],
      to: [1],
    });

    isExpandedMock.mockReturnValue(true);

    editor.selection = {
      anchor: { offset: 0, path: [0] },
      focus: { offset: 0, path: [1] },
    };

    onHoverNode(editor, {
      dragItem,
      element: hoverElement,
      monitor,
      nodeRef,
    });

    expect(editor.tf.collapse).toHaveBeenCalled();
    expect(editor.tf.focus).toHaveBeenCalled();
  });

  it('should handle horizontal orientation', () => {
    getDropPathMock.mockReturnValueOnce({
      direction: 'left',
      dragPath: [0],
      to: [1],
    });

    isExpandedMock.mockReturnValue(false);

    onHoverNode(editor, {
      dragItem,
      element: hoverElement,
      monitor,
      nodeRef,
      orientation: 'horizontal',
    });

    expect(editor.setOption).toHaveBeenCalledWith(DndPlugin, 'dropTarget', {
      id: 'hover',
      line: 'left',
    });
  });

  it('should clear dropTarget when no direction is returned', () => {
    getDropPathMock.mockReturnValueOnce(undefined);

    (editor.getOptions as ReturnType<typeof mock>).mockReturnValue({
      dropTarget: { id: 'hover', line: 'bottom' },
    });

    onHoverNode(editor, {
      dragItem,
      element: hoverElement,
      monitor,
      nodeRef,
    });

    expect(editor.setOption).toHaveBeenCalledWith(DndPlugin, 'dropTarget', {
      id: null,
      line: '',
    });
  });
});
