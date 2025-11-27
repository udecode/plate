import type { TElement } from 'platejs';
import type { DropTargetMonitor } from 'react-dnd';

import { createPlateEditor } from 'platejs/react';

import type { DragItemNode } from '../types';

import * as utils from '../utils';
import { onDropNode } from './onDropNode';

describe('onDropNode', () => {
  let editor: ReturnType<typeof createPlateEditor>;
  let dragItem: DragItemNode;

  const monitor = { canDrop: () => true } as DropTargetMonitor;
  const nodeRef = {};
  const dragElement = { id: 'drag' } as unknown as TElement;
  const hoverElement = { id: 'hover' } as unknown as TElement;

  let getHoverDirectionSpy: ReturnType<typeof spyOn>;
  let getHoverDirectionMock: ReturnType<typeof mock>;

  beforeEach(() => {
    editor = createPlateEditor();
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
      getHoverDirectionMock
    );
  });

  afterEach(() => {
    getHoverDirectionSpy?.mockRestore();
  });

  describe('when direction is undefined', () => {
    it('should do nothing', () => {
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
    it('should do nothing if drag node is not found', () => {
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

    it('should do nothing if hover node is not found', () => {
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
    it('should move node below when direction is bottom', () => {
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

    it('should move node above when direction is top', () => {
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

    it('should not move if already in position for bottom', () => {
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

    it('should not move if already in position for top', () => {
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
    it('should move node right when direction is right', () => {
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

    it('should move node left when direction is left', () => {
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

    it('should not move if already in position for right', () => {
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

    it('should not move if already in position for left', () => {
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
    it('should remove nodes from the source editor after inserting into the target editor', () => {
      getHoverDirectionMock.mockReturnValue('bottom');

      const sourceEditor = createPlateEditor();
      sourceEditor.tf.removeNodes = mock();
      sourceEditor.api.node = mock().mockReturnValue([dragElement, [0]]);

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
