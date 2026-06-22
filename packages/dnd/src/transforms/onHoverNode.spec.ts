import type { DropTargetMonitor } from 'react-dnd';
import type { Element } from '@platejs/slate';

import { PathApi, RangeApi, createSlateEditor } from 'platejs';

import type { DragItemNode } from '../types';

import { DndPlugin } from '../DndPlugin';
import * as onDropNodeModule from './onDropNode';
import { onHoverNode } from './onHoverNode';

describe('onHoverNode', () => {
  let editor: ReturnType<typeof createSlateEditor>;
  let dragItem: DragItemNode;

  const monitor = {} as DropTargetMonitor;
  const nodeRef = {};
  const dragElement = { id: 'drag' } as unknown as Element;
  const hoverElement = { id: 'hover' } as unknown as Element;

  let isExpandedSpy: ReturnType<typeof spyOn>;
  let isExpandedMock: ReturnType<typeof mock>;
  let getDropPathSpy: ReturnType<typeof spyOn>;
  let getDropPathMock: ReturnType<typeof mock>;
  let previousPathSpy: ReturnType<typeof spyOn>;
  let previousPathMock: ReturnType<typeof mock>;
  let nodeMock: ReturnType<typeof mock>;

  beforeEach(() => {
    editor = createSlateEditor();
    editor.getOptions = mock() as any;
    editor.selection = null;
    editor.setOption = mock() as any;
    editor.tf.collapse = mock();
    editor.tf.focus = mock();
    editor.api.findPath = mock(() => [1]) as any;
    nodeMock = mock();
    editor.api.node = nodeMock as any;

    dragItem = {
      id: 'drag',
      editorId: editor.id,
      element: dragElement,
    };

    (editor.getOptions as unknown as ReturnType<typeof mock>).mockReturnValue({
      _isOver: true,
      dropTarget: { id: null, line: '' },
    });

    isExpandedMock = mock();
    isExpandedSpy = spyOn(RangeApi, 'isExpanded').mockImplementation(
      isExpandedMock as unknown as typeof RangeApi.isExpanded
    );

    getDropPathMock = mock();
    getDropPathSpy = spyOn(onDropNodeModule, 'getDropPath').mockImplementation(
      getDropPathMock as unknown as typeof onDropNodeModule.getDropPath
    );

    previousPathMock = mock();
    previousPathSpy = spyOn(PathApi, 'previous').mockImplementation(
      previousPathMock as unknown as typeof PathApi.previous
    );
  });

  afterEach(() => {
    isExpandedSpy?.mockRestore();
    getDropPathSpy?.mockRestore();
    previousPathSpy?.mockRestore();
  });

  it('update plugin options when direction changes', () => {
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

  it('collapse selection and focus editor if direction is returned and selection is expanded', () => {
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

  it('handle horizontal orientation', () => {
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

  it('clear dropTarget when no direction is returned', () => {
    getDropPathMock.mockReturnValueOnce(undefined);

    (editor.getOptions as unknown as ReturnType<typeof mock>).mockReturnValue({
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

  it('maps top drops to the previous node bottom edge when available', () => {
    getDropPathMock.mockReturnValueOnce({
      direction: 'top',
      dragPath: [2],
      to: [1],
    });
    previousPathMock.mockReturnValueOnce([0]);
    nodeMock.mockReturnValueOnce([{ id: 'previous' }, [0]]);

    onHoverNode(editor, {
      dragItem,
      element: hoverElement,
      monitor,
      nodeRef,
    });

    expect(editor.setOption).toHaveBeenCalledWith(DndPlugin, 'dropTarget', {
      id: 'previous',
      line: 'bottom',
    });
  });

  it('falls back to the hovered node when top placement has no previous sibling', () => {
    getDropPathMock.mockReturnValueOnce({
      direction: 'top',
      dragPath: [0],
      to: [0],
    });
    previousPathMock.mockReturnValueOnce(undefined);

    onHoverNode(editor, {
      dragItem,
      element: hoverElement,
      monitor,
      nodeRef,
    });

    expect(editor.setOption).toHaveBeenCalledWith(DndPlugin, 'dropTarget', {
      id: 'hover',
      line: 'top',
    });
  });

  it('does not update the drop target when the editor is not over the drop zone', () => {
    getDropPathMock.mockReturnValueOnce({
      direction: 'bottom',
      dragPath: [0],
      to: [1],
    });
    (editor.getOptions as unknown as ReturnType<typeof mock>).mockReturnValue({
      _isOver: false,
      dropTarget: { id: null, line: '' },
    });

    onHoverNode(editor, {
      dragItem,
      element: hoverElement,
      monitor,
      nodeRef,
    });

    expect(editor.setOption).not.toHaveBeenCalled();
  });
});
