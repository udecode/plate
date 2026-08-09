import assert from 'node:assert/strict';

import { renderHook } from '@testing-library/react';
import { type Element, NodeApi, type NodeKey } from '@platejs/plite';
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

const getNodeKey = (editor: PlateEditor, path: number[]) => {
  const key = editor.key(path);

  assert(key);

  return key;
};

const getTexts = (editor: PlateEditor) =>
  editor.read.children().map((child) => NodeApi.string(child));

const nodeKey = (value: string) => value as NodeKey;

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
    let dragKey: NodeKey;
    let dragElement: Element;
    let hoverKey: NodeKey;
    let hoverElement: Element;
    let otherKey: NodeKey;
    let dragItem: ElementDragItemNode;

    beforeEach(() => {
      editor = createPlateEditor();
      editor.update.value.replace({
        children: [
          { children: [{ text: 'drag' }], type: 'paragraph' },
          { children: [{ text: 'hover' }], type: 'paragraph' },
          { children: [{ text: 'other' }], type: 'paragraph' },
        ],
        selection: null,
      });
      dragElement = getElement(editor, [0]);
      dragKey = getNodeKey(editor, [0]);
      hoverElement = getElement(editor, [1]);
      hoverKey = getNodeKey(editor, [1]);
      otherKey = getNodeKey(editor, [2]);
      dragItem = {
        key: dragKey,
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

      expect(getTexts(editor)).toEqual(['drag', 'hover', 'other']);
    });

    it('moves a block below the hovered block', () => {
      callDrop(dragItem, monitor);

      expect(getTexts(editor)).toEqual(['hover', 'drag', 'other']);
    });

    it('moves a block before the hovered block', () => {
      clientOffset = { x: 50, y: 25 };

      callDrop(
        {
          key: otherKey,
          editorId: editor.id,
          element: getElement(editor, [2]),
        },
        monitor
      );

      expect(getTexts(editor)).toEqual(['drag', 'other', 'hover']);
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
          key: hoverKey,
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
      callDrop({ ...dragItem, key: [dragKey, hoverKey] }, monitor);

      expect(getTexts(editor)).toEqual(['other', 'drag', 'hover']);
    });

    it('moves every selected block across editors without data loss', () => {
      const sourceEditor = createPlateEditor();

      sourceEditor.update.value.replace({
        children: [
          { children: [{ text: 'one' }], type: 'paragraph' },
          { children: [{ text: 'keep' }], type: 'paragraph' },
          { children: [{ text: 'two' }], type: 'paragraph' },
        ],
        selection: null,
      });

      callDrop(
        {
          editor: sourceEditor,
          editorId: sourceEditor.id,
          element: getElement(sourceEditor, [0]),
          key: [getNodeKey(sourceEditor, [0]), getNodeKey(sourceEditor, [2])],
        },
        monitor
      );

      expect(getTexts(editor)).toEqual([
        'drag',
        'hover',
        'one',
        'two',
        'other',
      ]);
      expect(getTexts(sourceEditor)).toEqual(['keep']);
    });

    it('assigns fresh node key to cross-editor copies', () => {
      const targetEditor = createPlateEditor();

      targetEditor.update.value.replace({
        children: [{ children: [{ text: 'target' }], type: 'paragraph' }],
        selection: null,
      });

      const sourceEditor = createPlateEditor();

      sourceEditor.update.value.replace({
        children: [{ children: [{ text: 'source' }], type: 'paragraph' }],
        selection: null,
      });

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
          key: getNodeKey(sourceEditor, [0]),
        },
        monitor
      );

      const keys = targetEditor.read
        .children()
        .map((_, index) => getNodeKey(targetEditor, [index]));

      expect(new Set(keys).size).toBe(keys.length);
      expect(targetEditor.read.text.string([])).toContain('source');
    });
  });

  describe('hover', () => {
    let editor = createPlateEditor({ plugins: [DndPlugin] });
    let dragItem: ElementDragItemNode;
    let hoverKey: NodeKey;
    let hoverElement: Element;
    let otherKey: NodeKey;
    let previousKey: NodeKey;

    beforeEach(() => {
      editor = createPlateEditor({ plugins: [DndPlugin] });
      editor.update.value.replace({
        children: [
          { children: [{ text: 'previous' }], type: 'paragraph' },
          { children: [{ text: 'hover' }], type: 'paragraph' },
          { children: [{ text: 'other' }], type: 'paragraph' },
          { children: [{ text: 'drag' }], type: 'paragraph' },
        ],
        selection: null,
      });
      hoverElement = getElement(editor, [1]);
      previousKey = getNodeKey(editor, [0]);
      hoverKey = getNodeKey(editor, [1]);
      otherKey = getNodeKey(editor, [2]);
      dragItem = {
        key: getNodeKey(editor, [3]),
        editorId: editor.id,
        element: getElement(editor, [3]),
      };
      editor.plugin(DndPlugin).store.set({
        _isOver: true,
        dropTarget: { key: null, line: '' },
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
        key: hoverKey,
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
        dropTarget: { key: hoverKey, line: 'bottom' },
      });

      callHover(
        {
          key: otherKey,
          editorId: editor.id,
          element: getElement(editor, [2]),
        },
        monitor
      );

      expect(editor.plugin(DndPlugin).store.get('dropTarget')).toEqual({
        key: null,
        line: '',
      });
    });

    it('maps a top drop to the previous block bottom edge', () => {
      clientOffset = { x: 50, y: 25 };

      callHover(dragItem, monitor);

      expect(editor.plugin(DndPlugin).store.get('dropTarget')).toEqual({
        key: previousKey,
        line: 'bottom',
      });
    });

    it('does not update while the editor is outside the drop zone', () => {
      editor.plugin(DndPlugin).store.set({ _isOver: false });

      callHover(dragItem, monitor);

      expect(editor.plugin(DndPlugin).store.get('dropTarget')).toEqual({
        key: null,
        line: '',
      });
    });
  });

  describe('hover direction', () => {
    const dragElement: Element = {
      children: [{ text: 'drag' }],
      type: 'paragraph',
    };
    const dragItem: ElementDragItemNode = {
      key: nodeKey('drag'),
      editorId: 'editor',
      element: dragElement,
    };
    const hoverElement: Element = {
      children: [{ text: 'hover' }],
      type: 'paragraph',
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

    it('allows matching node keys across different editors', () => {
      expect(
        getHoverDirection({
          dragItem,
          editorId: 'target-editor',
          element: hoverElement,
          monitor,
          nodeRef,
          nodeKey: nodeKey('drag'),
        })
      ).toBe('bottom');
    });
  });
});
