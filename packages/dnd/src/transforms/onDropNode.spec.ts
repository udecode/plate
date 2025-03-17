import type { TElement } from '@udecode/plate';
import type { DropTargetMonitor } from 'react-dnd';

import { createPlateEditor } from '@udecode/plate/react';

import type { DragItemNode } from '../types';

import { onDropNode } from './onDropNode';

jest.mock('../utils', () => ({
  getHoverDirection: jest.fn(),
}));

describe('onDropNode', () => {
  const editor = createPlateEditor();
  editor.tf.moveNodes = jest.fn();
  editor.tf.focus = jest.fn();
  editor.api.findPath = jest.fn();
  const monitor = {} as DropTargetMonitor;
  const nodeRef = {};
  const dragElement = { id: 'drag' } as unknown as TElement;
  const dragItem: DragItemNode = { id: 'drag', element: dragElement };

  const hoverElement = { id: 'hover' } as unknown as TElement;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when direction is undefined', () => {
    it('should do nothing', () => {
      const { getHoverDirection } = require('../utils');
      getHoverDirection.mockReturnValueOnce();

      onDropNode(editor, { dragItem, element: hoverElement, monitor, nodeRef });

      expect(editor.tf.moveNodes).not.toHaveBeenCalled();
    });
  });

  describe('when nodes are not found', () => {
    it('should do nothing if drag node is not found', () => {
      const { getHoverDirection } = require('../utils');
      getHoverDirection.mockReturnValueOnce('bottom');
      (editor.api.findPath as jest.Mock).mockReturnValueOnce(undefined);

      onDropNode(editor, { dragItem, element: hoverElement, monitor, nodeRef });

      expect(editor.tf.moveNodes).not.toHaveBeenCalled();
    });

    it('should do nothing if hover node is not found', () => {
      const { getHoverDirection } = require('../utils');
      getHoverDirection.mockReturnValueOnce('bottom');
      (editor.api.findPath as jest.Mock)
        .mockReturnValueOnce([0])
        .mockReturnValueOnce(undefined);

      onDropNode(editor, { dragItem, element: hoverElement, monitor, nodeRef });

      expect(editor.tf.moveNodes).not.toHaveBeenCalled();
    });
  });

  describe('vertical orientation', () => {
    it('should move node below when direction is bottom', () => {
      const { getHoverDirection } = require('../utils');
      getHoverDirection.mockReturnValue('bottom');
      (editor.api.findPath as jest.Mock)
        .mockReturnValueOnce([0])
        .mockReturnValueOnce([1]);

      onDropNode(editor, { dragItem, element: hoverElement, monitor, nodeRef });

      expect(editor.tf.moveNodes).toHaveBeenCalledWith({
        at: [0],
        to: [1],
      });
    });

    it('should move node above when direction is top', () => {
      const { getHoverDirection } = require('../utils');
      getHoverDirection.mockReturnValue('top');
      (editor.api.findPath as jest.Mock)
        .mockReturnValueOnce([2])
        .mockReturnValueOnce([1]);

      onDropNode(editor, { dragItem, element: hoverElement, monitor, nodeRef });

      expect(editor.tf.moveNodes).toHaveBeenCalledWith({
        at: [2],
        to: [1],
      });
    });

    it('should not move if already in position for bottom', () => {
      const { getHoverDirection } = require('../utils');
      getHoverDirection.mockReturnValue('bottom');
      (editor.api.findPath as jest.Mock)
        .mockReturnValueOnce([1])
        .mockReturnValueOnce([0]);

      onDropNode(editor, { dragItem, element: hoverElement, monitor, nodeRef });

      expect(editor.tf.moveNodes).not.toHaveBeenCalled();
    });

    it('should not move if already in position for top', () => {
      const { getHoverDirection } = require('../utils');
      getHoverDirection.mockReturnValue('top');
      (editor.api.findPath as jest.Mock)
        .mockReturnValueOnce([0])
        .mockReturnValueOnce([1]);

      onDropNode(editor, { dragItem, element: hoverElement, monitor, nodeRef });

      expect(editor.tf.moveNodes).not.toHaveBeenCalled();
    });
  });

  describe('horizontal orientation', () => {
    it('should move node right when direction is right', () => {
      const { getHoverDirection } = require('../utils');
      getHoverDirection.mockReturnValue('right');
      (editor.api.findPath as jest.Mock)
        .mockReturnValueOnce([2, 0])
        .mockReturnValueOnce([2, 1]);

      onDropNode(editor, {
        dragItem,
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
      const { getHoverDirection } = require('../utils');
      getHoverDirection.mockReturnValue('left');
      (editor.api.findPath as jest.Mock)
        .mockReturnValueOnce([2, 2])
        .mockReturnValueOnce([2, 1]);

      onDropNode(editor, {
        dragItem,
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
      const { getHoverDirection } = require('../utils');
      getHoverDirection.mockReturnValue('right');
      (editor.api.findPath as jest.Mock)
        .mockReturnValueOnce([2, 1])
        .mockReturnValueOnce([2, 0]);

      onDropNode(editor, {
        dragItem,
        element: hoverElement,
        monitor,
        nodeRef,
        orientation: 'horizontal',
      });

      expect(editor.tf.moveNodes).not.toHaveBeenCalled();
    });

    it('should not move if already in position for left', () => {
      const { getHoverDirection } = require('../utils');
      getHoverDirection.mockReturnValue('left');
      (editor.api.findPath as jest.Mock)
        .mockReturnValueOnce([2, 0])
        .mockReturnValueOnce([2, 1]);

      onDropNode(editor, {
        dragItem,
        element: hoverElement,
        monitor,
        nodeRef,
        orientation: 'horizontal',
      });

      expect(editor.tf.moveNodes).not.toHaveBeenCalled();
    });
  });
});
