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

  describe('drop guards', () => {
    it('returns early when canDropNode rejects the drop', () => {
      getHoverDirectionMock.mockReturnValue('bottom');
      (editor.api.findPath as ReturnType<typeof mock>)
        .mockReturnValueOnce([0])
        .mockReturnValueOnce([1]);

      onDropNode(editor, {
        canDropNode: () => false,
        dragItem: dragItem as any,
        element: hoverElement,
        monitor,
        nodeRef,
      });

      expect(editor.tf.moveNodes).not.toHaveBeenCalled();
      expect(editor.tf.insertNodes).not.toHaveBeenCalled();
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

    it('removes cross-editor multi-node paths from bottom to top', () => {
      getHoverDirectionMock.mockReturnValue('bottom');

      const sourceEditor = createSlateEditor();
      const removeNodes = mock();

      sourceEditor.tf.removeNodes = removeNodes as any;
      sourceEditor.api.node = mock(({ id }) => {
        if (id === 'drag-1') return [{ id: 'drag-1' } as any, [0]];
        if (id === 'drag-2') return [{ id: 'drag-2' } as any, [2]];
      }) as any;

      (editor.api.findPath as ReturnType<typeof mock>)
        .mockReturnValueOnce([0])
        .mockReturnValueOnce([1]);

      onDropNode(editor, {
        dragItem: {
          ...dragItem,
          editor: sourceEditor,
          editorId: sourceEditor.id,
          id: ['drag-1', 'drag-2'],
        } as any,
        element: hoverElement,
        monitor,
        nodeRef,
      });

      expect(removeNodes.mock.calls).toEqual([[{ at: [2] }], [{ at: [0] }]]);
    });
  });

  describe('same editor multi-node drop', () => {
    it('moves all dragged ids with a match predicate', () => {
      getHoverDirectionMock.mockReturnValue('bottom');
      (editor.api.findPath as ReturnType<typeof mock>)
        .mockReturnValueOnce([0])
        .mockReturnValueOnce([2]);
      editor.api.node = mock(({ id }) => [{ id } as any, [0]]) as any;

      onDropNode(editor, {
        dragItem: {
          ...dragItem,
          id: ['drag-1', 'drag-2'],
        } as any,
        element: hoverElement,
        monitor,
        nodeRef,
      });

      const options = (editor.tf.moveNodes as ReturnType<typeof mock>).mock
        .calls[0]?.[0];

      expect(options.at).toEqual([]);
      expect(options.to).toEqual([2]);
      expect(options.match({ id: 'drag-1' })).toBe(true);
      expect(options.match({ id: 'drag-2' })).toBe(true);
      expect(options.match({ id: 'other' })).toBe(false);
    });
  });
});
