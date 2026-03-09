import type { TElement } from 'platejs';
import type { DropTargetMonitor } from 'react-dnd';

import { createSlateEditor } from 'platejs';

import type { DragItemNode } from '../types';

import * as utils from '../utils';
import { onDropNode } from './onDropNode';

describe('onDropNode', () => {
  let editor: ReturnType<typeof createSlateEditor>;
  let dragItem: DragItemNode;

  const monitor = { canDrop: () => true } as DropTargetMonitor;
  const nodeRef = {};
  const dragElement = { id: 'drag' } as unknown as TElement;
  const hoverElement = { id: 'hover' } as unknown as TElement;

  let getHoverDirectionSpy: ReturnType<typeof spyOn>;
  let getHoverDirectionMock: ReturnType<typeof mock>;

  beforeEach(() => {
    editor = createSlateEditor();
    editor.tf.moveNodes = mock();
    editor.tf.insertNodes = mock();
    editor.tf.focus = mock();
    editor.api.findPath = mock();

    dragItem = {
      id: 'drag',
      editorId: editor.id,
      element: dragElement,
    };

    getHoverDirectionMock = mock();
    getHoverDirectionSpy = spyOn(utils, 'getHoverDirection').mockImplementation(
      getHoverDirectionMock as unknown as typeof utils.getHoverDirection
    );
  });

  afterEach(() => {
    getHoverDirectionSpy?.mockRestore();
  });

  describe('when direction is undefined', () => {
    it('returns early when no drop direction is available', () => {
      getHoverDirectionMock.mockReturnValueOnce(undefined);

      onDropNode(editor, {
        dragItem: dragItem as any,
        element: hoverElement,
        monitor,
        nodeRef,
      });

      expect(editor.tf.moveNodes).not.toHaveBeenCalled();
    });
  });

  describe('when nodes are not found', () => {
    it('returns early when the drag node is missing', () => {
      getHoverDirectionMock.mockReturnValueOnce('bottom');
      (editor.api.findPath as ReturnType<typeof mock>).mockReturnValueOnce(
        undefined
      );

      onDropNode(editor, {
        dragItem: dragItem as any,
        element: hoverElement,
        monitor,
        nodeRef,
      });

      expect(editor.tf.moveNodes).not.toHaveBeenCalled();
    });

    it('returns early when the hover node is missing', () => {
      getHoverDirectionMock.mockReturnValueOnce('bottom');
      (editor.api.findPath as ReturnType<typeof mock>)
        .mockReturnValueOnce([0])
        .mockReturnValueOnce(undefined);

      onDropNode(editor, {
        dragItem: dragItem as any,
        element: hoverElement,
        monitor,
        nodeRef,
      });

      expect(editor.tf.moveNodes).not.toHaveBeenCalled();
    });
  });

  describe('vertical orientation', () => {
    it('move node below when direction is bottom', () => {
      getHoverDirectionMock.mockReturnValue('bottom');
      (editor.api.findPath as ReturnType<typeof mock>)
        .mockReturnValueOnce([0])
        .mockReturnValueOnce([1]);

      onDropNode(editor, {
        dragItem: dragItem as any,
        element: hoverElement,
        monitor,
        nodeRef,
      });

      expect(editor.tf.moveNodes).toHaveBeenCalledWith({
        at: [0],
        to: [1],
      });
    });

    it('move node above when direction is top', () => {
      getHoverDirectionMock.mockReturnValue('top');
      (editor.api.findPath as ReturnType<typeof mock>)
        .mockReturnValueOnce([2])
        .mockReturnValueOnce([1]);

      onDropNode(editor, {
        dragItem: dragItem as any,
        element: hoverElement,
        monitor,
        nodeRef,
      });

      expect(editor.tf.moveNodes).toHaveBeenCalledWith({
        at: [2],
        to: [1],
      });
    });

    it('does not move if already in position for bottom', () => {
      getHoverDirectionMock.mockReturnValue('bottom');
      (editor.api.findPath as ReturnType<typeof mock>)
        .mockReturnValueOnce([1])
        .mockReturnValueOnce([0]);

      onDropNode(editor, {
        dragItem: dragItem as any,
        element: hoverElement,
        monitor,
        nodeRef,
      });

      expect(editor.tf.moveNodes).not.toHaveBeenCalled();
    });

    it('does not move if already in position for top', () => {
      getHoverDirectionMock.mockReturnValue('top');
      (editor.api.findPath as ReturnType<typeof mock>)
        .mockReturnValueOnce([0])
        .mockReturnValueOnce([1]);

      onDropNode(editor, {
        dragItem: dragItem as any,
        element: hoverElement,
        monitor,
        nodeRef,
      });

      expect(editor.tf.moveNodes).not.toHaveBeenCalled();
    });
  });

  describe('horizontal orientation', () => {
    it('move node right when direction is right', () => {
      getHoverDirectionMock.mockReturnValue('right');
      (editor.api.findPath as ReturnType<typeof mock>)
        .mockReturnValueOnce([2, 0])
        .mockReturnValueOnce([2, 1]);

      onDropNode(editor, {
        dragItem: dragItem as any,
        element: hoverElement,
        monitor,
        nodeRef,
        orientation: 'horizontal',
      });

      expect(editor.tf.moveNodes).toHaveBeenCalledWith({
        at: [2, 0],
        to: [2, 1],
      });
    });

    it('move node left when direction is left', () => {
      getHoverDirectionMock.mockReturnValue('left');
      (editor.api.findPath as ReturnType<typeof mock>)
        .mockReturnValueOnce([2, 2])
        .mockReturnValueOnce([2, 1]);

      onDropNode(editor, {
        dragItem: dragItem as any,
        element: hoverElement,
        monitor,
        nodeRef,
        orientation: 'horizontal',
      });

      expect(editor.tf.moveNodes).toHaveBeenCalledWith({
        at: [2, 2],
        to: [2, 1],
      });
    });

    it('does not move if already in position for right', () => {
      getHoverDirectionMock.mockReturnValue('right');
      (editor.api.findPath as ReturnType<typeof mock>)
        .mockReturnValueOnce([2, 1])
        .mockReturnValueOnce([2, 0]);

      onDropNode(editor, {
        dragItem: dragItem as any,
        element: hoverElement,
        monitor,
        nodeRef,
        orientation: 'horizontal',
      });

      expect(editor.tf.moveNodes).not.toHaveBeenCalled();
    });

    it('does not move if already in position for left', () => {
      getHoverDirectionMock.mockReturnValue('left');
      (editor.api.findPath as ReturnType<typeof mock>)
        .mockReturnValueOnce([2, 0])
        .mockReturnValueOnce([2, 1]);

      onDropNode(editor, {
        dragItem: dragItem as any,
        element: hoverElement,
        monitor,
        nodeRef,
        orientation: 'horizontal',
      });

      expect(editor.tf.moveNodes).not.toHaveBeenCalled();
    });
  });

  describe('cross editor drop', () => {
    it('remove nodes from the source editor after inserting into the target editor', () => {
      getHoverDirectionMock.mockReturnValue('bottom');

      const sourceEditor = createSlateEditor();
      sourceEditor.tf.removeNodes = mock() as any;
      sourceEditor.api.node = mock().mockReturnValue([dragElement, [0]]) as any;

      (editor.api.findPath as ReturnType<typeof mock>)
        .mockReturnValueOnce([1])
        .mockReturnValueOnce([2]);

      onDropNode(editor, {
        dragItem: {
          ...dragItem,
          editor: sourceEditor,
          editorId: sourceEditor.id,
        } as any,
        element: hoverElement,
        monitor,
        nodeRef,
      });

      expect(editor.tf.insertNodes).toHaveBeenCalledWith(dragElement, {
        at: [2],
      });
      expect(sourceEditor.api.node).toHaveBeenCalledWith({
        id: 'drag',
        at: [],
      });
      expect(sourceEditor.tf.removeNodes).toHaveBeenCalledWith({ at: [0] });
    });
  });
});
