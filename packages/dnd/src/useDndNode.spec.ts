import assert from 'node:assert/strict';

import { renderHook } from '@testing-library/react';
import type { Element } from '@platejs/plite';
import type { DropTargetHookSpec, DropTargetMonitor } from 'react-dnd';
import * as actualReactDnd from 'react-dnd';

import { createPlateEditor, type PlateEditor } from '@platejs/core/react';

import { DndPlugin } from './DndPlugin';
import type { DragItemNode, ElementDragItemNode } from './useDndNode';

let dropSpec:
  | DropTargetHookSpec<DragItemNode, unknown, { isOver: boolean }>
  | undefined;
const useDropMock = mock(
  (spec: DropTargetHookSpec<DragItemNode, unknown, { isOver: boolean }>) => {
    dropSpec = spec;

    return [{ isOver: false }, () => null];
  }
);

mock.module('react-dnd', () => ({
  ...actualReactDnd,
  useDrop: useDropMock,
}));

afterAll(() => {
  mock.restore();
});

const { DRAG_ITEM_BLOCK, getHoverDirection, useDropNode } = await import(
  `./useDndNode?behavior=${Math.random().toString(36).slice(2)}`
);

const getElement = (editor: PlateEditor, path: number[]) => {
  const entry = editor.read.nodes.get<Element>(path);

  assert(entry);

  return entry[0];
};

const callDrop = (dragItem: DragItemNode, monitor: DropTargetMonitor) => {
  if (typeof dropSpec?.drop !== 'function') {
    throw new Error('Expected the DnD drop callback.');
  }

  return dropSpec.drop(dragItem, monitor);
};

const callHover = (dragItem: DragItemNode, monitor: DropTargetMonitor) => {
  if (typeof dropSpec?.hover !== 'function') {
    throw new Error('Expected the DnD hover callback.');
  }

  return dropSpec.hover(dragItem, monitor);
};

describe('Dnd node behavior', () => {
  let clientOffset: null | { x: number; y: number };
  const monitor = {
    canDrop: () => true,
    getClientOffset: () => clientOffset,
  } as unknown as DropTargetMonitor;
  let node = document.createElement('div');
  let nodeRef = { current: node };

  beforeEach(() => {
    clientOffset = { x: 50, y: 75 };
    node = document.createElement('div');
    nodeRef = { current: node };
    spyOn(node, 'getBoundingClientRect').mockReturnValue(
      new DOMRect(0, 0, 100, 100)
    );
  });

  describe('drop', () => {
    let editor = createPlateEditor();
    let dragElement: Element;
    let hoverElement: Element;
    let dragItem: ElementDragItemNode;

    beforeEach(() => {
      editor = createPlateEditor();
      editor.update.nodes.insert(
        [
          { children: [{ text: 'drag' }], id: 'drag', type: 'p' },
          { children: [{ text: 'hover' }], id: 'hover', type: 'p' },
          { children: [{ text: 'other' }], id: 'other', type: 'p' },
        ],
        { at: [0] }
      );
      dragElement = getElement(editor, [0]);
      hoverElement = getElement(editor, [1]);
      dragItem = {
        id: 'drag',
        editorId: editor.id,
        element: dragElement,
      };
      renderHook(() =>
        useDropNode(editor, {
          accept: DRAG_ITEM_BLOCK,
          element: hoverElement,
          nodeRef,
        })
      );
    });

    it('does nothing without a drop direction', () => {
      renderHook(() =>
        useDropNode(editor, {
          accept: DRAG_ITEM_BLOCK,
          element: hoverElement,
          nodeRef: { current: null },
        })
      );
      callDrop(dragItem, monitor);

      expect(editor.read.children().map((child) => child.id)).toEqual([
        'drag',
        'hover',
        'other',
      ]);
    });

    it('moves a block below the hovered block', () => {
      callDrop(dragItem, monitor);

      expect(editor.read.children().map((child) => child.id)).toEqual([
        'hover',
        'drag',
        'other',
      ]);
    });

    it('moves a block before the hovered block', () => {
      clientOffset = { x: 50, y: 25 };

      callDrop(
        {
          id: 'other',
          editorId: editor.id,
          element: getElement(editor, [2]),
        },
        monitor
      );

      expect(editor.read.children().map((child) => child.id)).toEqual([
        'drag',
        'other',
        'hover',
      ]);
    });

    it('keeps a block in place when it is already adjacent', () => {
      const move = spyOn(editor.update.nodes, 'move');

      renderHook(() =>
        useDropNode(editor, {
          accept: DRAG_ITEM_BLOCK,
          element: dragElement,
          nodeRef,
        })
      );
      callDrop(
        {
          id: 'hover',
          editorId: editor.id,
          element: hoverElement,
        },
        monitor
      );

      expect(move).not.toHaveBeenCalled();
    });

    it('honors the package drop guard', () => {
      const move = spyOn(editor.update.nodes, 'move');

      renderHook(() =>
        useDropNode(editor, {
          accept: DRAG_ITEM_BLOCK,
          canDropNode: () => false,
          element: hoverElement,
          nodeRef,
        })
      );
      callDrop(dragItem, monitor);

      expect(move).not.toHaveBeenCalled();
    });

    it('moves every selected block in the same editor', () => {
      renderHook(() =>
        useDropNode(editor, {
          accept: DRAG_ITEM_BLOCK,
          element: getElement(editor, [2]),
          nodeRef,
        })
      );
      callDrop({ ...dragItem, id: ['drag', 'hover'] }, monitor);

      expect(editor.read.children().map((child) => child.id)).toEqual([
        'other',
        'drag',
        'hover',
      ]);
    });

    it('moves every selected block across editors without data loss', () => {
      const sourceEditor = createPlateEditor();

      sourceEditor.update.nodes.insert(
        [
          { children: [{ text: 'one' }], id: 'drag-1', type: 'p' },
          { children: [{ text: 'keep' }], id: 'keep', type: 'p' },
          { children: [{ text: 'two' }], id: 'drag-2', type: 'p' },
        ],
        { at: [0] }
      );

      callDrop(
        {
          editor: sourceEditor,
          editorId: sourceEditor.id,
          element: getElement(sourceEditor, [0]),
          id: ['drag-1', 'drag-2'],
        },
        monitor
      );

      expect(editor.read.children().map((child) => child.id)).toEqual([
        'drag',
        'hover',
        'drag-1',
        'drag-2',
        'other',
      ]);
      expect(sourceEditor.read.children().map((child) => child.id)).toEqual([
        'keep',
      ]);
    });

    it('lets the node-id owner rewrite cross-editor id collisions', () => {
      let nextId = 0;
      const targetEditor = createPlateEditor({
        nodeId: { idCreator: () => `target-${++nextId}` },
      });

      targetEditor.update.nodes.insert(
        { children: [{ text: 'target' }], id: 'hover', type: 'p' },
        { at: [0] }
      );

      const sourceEditor = createPlateEditor();

      sourceEditor.update.nodes.insert(
        { children: [{ text: 'source' }], id: 'hover', type: 'p' },
        { at: [0] }
      );

      renderHook(() =>
        useDropNode(targetEditor, {
          accept: DRAG_ITEM_BLOCK,
          element: getElement(targetEditor, [0]),
          nodeRef,
        })
      );
      callDrop(
        {
          editor: sourceEditor,
          editorId: sourceEditor.id,
          element: getElement(sourceEditor, [0]),
          id: 'hover',
        },
        monitor
      );

      const ids = targetEditor.read.children().map((child) => child.id);

      expect(new Set(ids).size).toBe(ids.length);
      expect(targetEditor.read.text.string([])).toContain('source');
    });
  });

  describe('hover', () => {
    let editor = createPlateEditor({ plugins: [DndPlugin] });
    let dragItem: ElementDragItemNode;
    let hoverElement: Element;

    beforeEach(() => {
      editor = createPlateEditor({ plugins: [DndPlugin] });
      editor.update.nodes.insert(
        [
          { children: [{ text: 'previous' }], id: 'previous', type: 'p' },
          { children: [{ text: 'hover' }], id: 'hover', type: 'p' },
          { children: [{ text: 'other' }], id: 'other', type: 'p' },
          { children: [{ text: 'drag' }], id: 'drag', type: 'p' },
        ],
        { at: [0] }
      );
      hoverElement = getElement(editor, [1]);
      dragItem = {
        id: 'drag',
        editorId: editor.id,
        element: getElement(editor, [3]),
      };
      editor.plugin(DndPlugin).store.set({
        _isOver: true,
        dropTarget: { id: null, line: '' },
      });
      renderHook(() =>
        useDropNode(editor, {
          accept: DRAG_ITEM_BLOCK,
          element: hoverElement,
          nodeRef,
        })
      );
    });

    it('updates the plugin drop target when direction changes', () => {
      callHover(dragItem, monitor);

      expect(editor.plugin(DndPlugin).store.get('dropTarget')).toEqual({
        id: 'hover',
        line: 'bottom',
      });
    });

    it('focuses and collapses an expanded selection', () => {
      spyOn(editor.api.dom, 'focus').mockImplementation(() => {});
      editor.update.selection.set({
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [1, 0] },
      });

      callHover(dragItem, monitor);

      expect(editor.read.selection.isExpanded()).toBe(false);
    });

    it('clears a stale drop target when no move is available', () => {
      editor.plugin(DndPlugin).store.set({
        dropTarget: { id: 'hover', line: 'bottom' },
      });

      callHover(
        {
          id: 'other',
          editorId: editor.id,
          element: getElement(editor, [2]),
        },
        monitor
      );

      expect(editor.plugin(DndPlugin).store.get('dropTarget')).toEqual({
        id: null,
        line: '',
      });
    });

    it('maps a top drop to the previous block bottom edge', () => {
      clientOffset = { x: 50, y: 25 };

      callHover(dragItem, monitor);

      expect(editor.plugin(DndPlugin).store.get('dropTarget')).toEqual({
        id: 'previous',
        line: 'bottom',
      });
    });

    it('does not update while the editor is outside the drop zone', () => {
      editor.plugin(DndPlugin).store.set({ _isOver: false });

      callHover(dragItem, monitor);

      expect(editor.plugin(DndPlugin).store.get('dropTarget')).toEqual({
        id: null,
        line: '',
      });
    });
  });

  describe('hover direction', () => {
    const dragElement: Element = {
      children: [{ text: 'drag' }],
      id: 'drag',
      type: 'p',
    };
    const dragItem: ElementDragItemNode = {
      id: 'drag',
      editorId: 'editor',
      element: dragElement,
    };
    const hoverElement: Element = {
      children: [{ text: 'hover' }],
      id: 'hover',
      type: 'p',
    };

    it('returns top above the vertical midpoint', () => {
      clientOffset = { x: 50, y: 25 };

      expect(
        getHoverDirection({
          dragItem,
          element: hoverElement,
          monitor,
          nodeRef,
        })
      ).toBe('top');
    });

    it('returns bottom below the vertical midpoint', () => {
      expect(
        getHoverDirection({
          dragItem,
          element: hoverElement,
          monitor,
          nodeRef,
        })
      ).toBe('bottom');
    });

    it('returns left or right around the horizontal midpoint', () => {
      clientOffset = { x: 25, y: 50 };
      expect(
        getHoverDirection({
          dragItem,
          element: hoverElement,
          monitor,
          nodeRef,
          orientation: 'horizontal',
        })
      ).toBe('left');

      clientOffset = { x: 75, y: 50 };
      expect(
        getHoverDirection({
          dragItem,
          element: hoverElement,
          monitor,
          nodeRef,
          orientation: 'horizontal',
        })
      ).toBe('right');
    });

    it('returns undefined when hovering a selected block', () => {
      expect(
        getHoverDirection({
          dragItem,
          element: dragElement,
          monitor,
          nodeRef,
        })
      ).toBeUndefined();
    });

    it('allows matching block ids across different editors', () => {
      expect(
        getHoverDirection({
          dragItem,
          editorId: 'target-editor',
          element: { ...hoverElement, id: 'drag' },
          monitor,
          nodeRef,
        })
      ).toBe('bottom');
    });
  });
});
