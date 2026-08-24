import assert from 'node:assert/strict';

import * as actualCoreReact from '@platejs/core/react';
import { createPlateEditor, type PlateEditor } from '@platejs/core/react';
import {
  type Element,
  ElementApi,
  NodeApi,
  type NodeKey,
} from '@platejs/plite';
import { act, renderHook } from '@testing-library/react';
import type {
  DragSourceHookSpec,
  DragSourceMonitor,
  DropTargetHookSpec,
  DropTargetMonitor,
} from 'react-dnd';
import * as actualReactDnd from 'react-dnd';

import { DndPlugin } from './DndPlugin';
import type {
  DragItemNode,
  ElementDragItemNode,
  UseDropNodeOptions,
} from './useDndNode';

let dropSpec:
  | DropTargetHookSpec<DragItemNode, unknown, { isOver: boolean }>
  | undefined;
let dragSpec:
  | DragSourceHookSpec<DragItemNode, unknown, { isDragging: boolean }>
  | undefined;
const dragSpecByItem = new WeakMap<
  object,
  DragSourceHookSpec<DragItemNode, unknown, { isDragging: boolean }>
>();
const dropConnector = mock(() => null);
const dragConnector = mock(() => null);
const previewConnector = mock(() => null);
const useDropMock = mock(
  (spec: DropTargetHookSpec<DragItemNode, unknown, { isOver: boolean }>) => {
    dropSpec = spec;

    return [{ isOver: false }, dropConnector];
  }
);
let currentEditor: PlateEditor;

void mock.module('@platejs/core/react', () => ({
  ...actualCoreReact,
  useEditor: () => currentEditor,
}));

void mock.module('react-dnd', () => ({
  ...actualReactDnd,
  useDrag: (
    spec: DragSourceHookSpec<DragItemNode, unknown, { isDragging: boolean }>
  ) => {
    dragSpec = spec;

    return [
      { isAboutToDrag: false, isDragging: false },
      dragConnector,
      previewConnector,
    ];
  },
  useDrop: useDropMock,
}));

afterAll(() => {
  mock.restore();
});

const { DRAG_ITEM_BLOCK, getHoverDirection, useDndNode, useDraggable } =
  await import(`./useDndNode?behavior=${Math.random().toString(36).slice(2)}`);

const renderDropNode = (editor: PlateEditor, options: UseDropNodeOptions) => {
  const { accept, canDropNode, element, nodeRef, ...drop } = options;

  currentEditor = editor;

  return renderHook(() =>
    useDndNode({
      canDropNode,
      drop: { accept, ...drop },
      element,
      nodeRef,
    })
  );
};

const getElement = (editor: PlateEditor, path: number[]) => {
  const entry = editor.read.nodes.get(path, {
    match: ElementApi.isElement,
  });

  assert.ok(entry);

  return entry[0];
};

const getNodeKey = (editor: PlateEditor, path: number[]) => {
  const key = editor.key(path);

  assert.ok(key);

  return key;
};

const getTexts = (editor: PlateEditor) =>
  editor.read.children().map((child) => NodeApi.string(child));

const nodeKey = (value: string) => value as NodeKey;

const callDrop = (
  dragItem: DragItemNode,
  monitor: DropTargetMonitor
): Record<PropertyKey, unknown> => {
  if (typeof dropSpec?.drop !== 'function') {
    throw new Error('Expected the DnD drop callback.');
  }

  const result = dropSpec.drop(dragItem, monitor);

  return result && typeof result === 'object'
    ? (result as Record<PropertyKey, unknown>)
    : {};
};

const callHover = (dragItem: DragItemNode, monitor: DropTargetMonitor) => {
  if (typeof dropSpec?.hover !== 'function') {
    throw new Error('Expected the DnD hover callback.');
  }

  dropSpec.hover(dragItem, monitor);
};

const callDragItem = (monitor: DragSourceMonitor) => {
  if (typeof dragSpec?.item !== 'function') {
    throw new Error('Expected the DnD drag item callback.');
  }

  const item = dragSpec.item(monitor);

  if (!item) throw new Error('Expected a DnD drag item.');

  dragSpecByItem.set(item, dragSpec);

  return item;
};

const callCanDrag = (monitor: DragSourceMonitor) => {
  if (typeof dragSpec?.canDrag !== 'function') {
    throw new Error('Expected the DnD canDrag callback.');
  }

  return dragSpec.canDrag(monitor);
};

const callDragEnd = (
  dragItem: DragItemNode,
  dropResult: Record<PropertyKey, unknown>
) => {
  const sourceDragSpec = dragSpecByItem.get(dragItem);

  if (typeof sourceDragSpec?.end !== 'function') {
    throw new Error('Expected the DnD drag end callback.');
  }

  sourceDragSpec.end(dragItem, {
    getDropResult: () => dropResult,
  } as unknown as DragSourceMonitor);
};

describe('Dnd node behavior', () => {
  it('returns caller-owned node and preview refs from useDraggable', () => {
    currentEditor = createPlateEditor();
    const input = {
      children: [{ text: 'block' }],
      type: 'paragraph',
    } as Element;
    currentEditor.update.value.replace({ children: [input], selection: null });
    const element = getElement(currentEditor, [0]);
    const nodeRef = { current: document.createElement('div') };
    const previewRef = { current: document.createElement('div') };
    const { result } = renderHook(() =>
      useDraggable({
        element,
        multiplePreviewRef: previewRef,
        nodeRef,
      })
    );

    expect(result.current.nodeRef).toBe(nodeRef);
    expect(result.current.previewRef).toBe(previewRef);
  });

  it('attaches and detaches drop and preview connectors in layout', () => {
    dropConnector.mockClear();
    previewConnector.mockClear();
    currentEditor = createPlateEditor();
    currentEditor.update.value.replace({
      children: [{ children: [{ text: 'block' }], type: 'paragraph' }],
      selection: null,
    });
    const element = getElement(currentEditor, [0]);
    const nodeRef = { current: document.createElement('div') };
    const previewRef = { current: document.createElement('div') };
    const rendered = renderHook(() =>
      useDraggable({ element, multiplePreviewRef: previewRef, nodeRef })
    );

    expect(dropConnector).toHaveBeenCalledWith(nodeRef);
    expect(previewConnector).toHaveBeenCalledWith(previewRef);

    rendered.unmount();

    expect(dropConnector).toHaveBeenLastCalledWith(null);
    expect(previewConnector).toHaveBeenLastCalledWith(null);
  });

  it('clears an attempted drag only when the monitor never starts it', async () => {
    currentEditor = createPlateEditor();
    currentEditor.update.value.replace({
      children: [{ children: [{ text: 'block' }], type: 'paragraph' }],
      selection: null,
    });
    const element = getElement(currentEditor, [0]);
    const rendered = renderHook(() => useDraggable({ element }));
    const monitor = {
      isDragging: () => false,
    } as unknown as DragSourceMonitor;

    act(() => {
      expect(callCanDrag(monitor)).toBe(true);
    });

    expect(rendered.result.current.isAboutToDrag).toBe(true);

    await act(async () => {
      await new Promise<void>((resolve) => {
        setTimeout(resolve, 5);
      });
    });

    expect(rendered.result.current.isAboutToDrag).toBe(false);
  });

  it('keeps attempted-drag state through item creation and clears it at end', async () => {
    currentEditor = createPlateEditor({ plugins: [DndPlugin] });
    currentEditor.update.value.replace({
      children: [{ children: [{ text: 'block' }], type: 'paragraph' }],
      selection: null,
    });
    const element = getElement(currentEditor, [0]);
    const rendered = renderHook(() => useDraggable({ element }));
    const monitor = {
      isDragging: () => false,
    } as unknown as DragSourceMonitor;
    let dragItem!: DragItemNode;

    act(() => {
      expect(callCanDrag(monitor)).toBe(true);
      dragItem = callDragItem(monitor);
    });

    await act(async () => {
      await new Promise<void>((resolve) => {
        setTimeout(resolve, 5);
      });
    });

    expect(rendered.result.current.isAboutToDrag).toBe(true);

    act(() => {
      callDragEnd(dragItem, {});
    });

    expect(rendered.result.current.isAboutToDrag).toBe(false);
  });

  it('blurs a focused editor when block dragging starts', () => {
    currentEditor = createPlateEditor({ plugins: [DndPlugin] });
    currentEditor.update.value.replace({
      children: [{ children: [{ text: 'block' }], type: 'paragraph' }],
      selection: null,
    });
    const element = getElement(currentEditor, [0]);
    const isFocused = spyOn(currentEditor.api.dom, 'isFocused').mockReturnValue(
      true
    );
    const blur = spyOn(currentEditor.api.dom, 'blur').mockImplementation(
      () => {}
    );

    renderHook(() => useDraggable({ element }));
    callDragItem({} as DragSourceMonitor);

    expect(isFocused).toHaveBeenCalledTimes(1);
    expect(blur).toHaveBeenCalledTimes(1);
  });

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
      renderDropNode(editor, {
        accept: DRAG_ITEM_BLOCK,
        element: hoverElement,
        nodeRef,
      });
    });

    it('does nothing without a drop direction', () => {
      renderDropNode(editor, {
        accept: DRAG_ITEM_BLOCK,
        element: hoverElement,
        nodeRef: { current: null },
      });
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

      renderDropNode(editor, {
        accept: DRAG_ITEM_BLOCK,
        element: dragElement,
        nodeRef,
      });
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

      renderDropNode(editor, {
        accept: DRAG_ITEM_BLOCK,
        canDropNode: () => false,
        element: hoverElement,
        nodeRef,
      });
      callDrop(dragItem, monitor);

      expect(move).not.toHaveBeenCalled();
    });

    it('moves every selected block in the same editor', () => {
      renderDropNode(editor, {
        accept: DRAG_ITEM_BLOCK,
        element: getElement(editor, [2]),
        nodeRef,
      });
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

      renderDropNode(targetEditor, {
        accept: DRAG_ITEM_BLOCK,
        element: getElement(targetEditor, [0]),
        nodeRef,
      });
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

    it('keeps an edited source and inserts the drag-start snapshot', () => {
      const sourceEditor = createPlateEditor({ plugins: [DndPlugin] });
      const targetEditor = createPlateEditor({ plugins: [DndPlugin] });

      sourceEditor.update.value.replace({
        children: [
          { children: [{ text: 'captured' }], type: 'paragraph' },
          { children: [{ text: 'keep' }], type: 'paragraph' },
        ],
        selection: null,
      });
      targetEditor.update.value.replace({
        children: [{ children: [{ text: 'target' }], type: 'paragraph' }],
        selection: null,
      });

      const sourceElement = getElement(sourceEditor, [0]);

      currentEditor = sourceEditor;
      renderHook(() => useDraggable({ element: sourceElement }));
      const capturedItem = callDragItem({} as DragSourceMonitor);

      sourceEditor.update.selection.set({ offset: 0, path: [0, 0] });
      sourceEditor.update.text.insert('edited ');

      renderDropNode(targetEditor, {
        accept: DRAG_ITEM_BLOCK,
        element: getElement(targetEditor, [0]),
        nodeRef,
      });
      const dropResult = callDrop(capturedItem, monitor);

      callDragEnd(capturedItem, { ...dropResult, dropEffect: 'move' });

      expect(getTexts(targetEditor)).toEqual(['target', 'captured']);
      expect(getTexts(sourceEditor)).toEqual(['edited captured', 'keep']);
    });

    it('copies a captured block across editors when the backend resolves copy', () => {
      const sourceEditor = createPlateEditor({ plugins: [DndPlugin] });
      const targetEditor = createPlateEditor({ plugins: [DndPlugin] });

      sourceEditor.update.value.replace({
        children: [
          { children: [{ text: 'captured' }], type: 'paragraph' },
          { children: [{ text: 'keep' }], type: 'paragraph' },
        ],
        selection: null,
      });
      targetEditor.update.value.replace({
        children: [{ children: [{ text: 'target' }], type: 'paragraph' }],
        selection: null,
      });

      currentEditor = sourceEditor;
      renderHook(() =>
        useDraggable({ element: getElement(sourceEditor, [0]) })
      );
      const capturedItem = callDragItem({} as DragSourceMonitor);

      renderDropNode(targetEditor, {
        accept: DRAG_ITEM_BLOCK,
        element: getElement(targetEditor, [0]),
        nodeRef,
      });
      const dropResult = callDrop(capturedItem, monitor);

      callDragEnd(capturedItem, { ...dropResult, dropEffect: 'copy' });

      expect(getTexts(targetEditor)).toEqual(['target', 'captured']);
      expect(getTexts(sourceEditor)).toEqual(['captured', 'keep']);
    });

    it('composes a caller drag end with cross-editor move completion', () => {
      const onDragEnd = mock(() => {});
      const sourceEditor = createPlateEditor({ plugins: [DndPlugin] });
      const targetEditor = createPlateEditor({ plugins: [DndPlugin] });

      sourceEditor.update.value.replace({
        children: [
          { children: [{ text: 'captured' }], type: 'paragraph' },
          { children: [{ text: 'keep' }], type: 'paragraph' },
        ],
        selection: null,
      });
      targetEditor.update.value.replace({
        children: [{ children: [{ text: 'target' }], type: 'paragraph' }],
        selection: null,
      });

      currentEditor = sourceEditor;
      renderHook(() =>
        useDraggable({
          drag: { end: onDragEnd },
          element: getElement(sourceEditor, [0]),
        })
      );
      const capturedItem = callDragItem({} as DragSourceMonitor);

      renderDropNode(targetEditor, {
        accept: DRAG_ITEM_BLOCK,
        element: getElement(targetEditor, [0]),
        nodeRef,
      });
      const dropResult = callDrop(capturedItem, monitor);

      callDragEnd(capturedItem, { ...dropResult, dropEffect: 'move' });

      expect(onDragEnd).toHaveBeenCalledTimes(1);
      expect(getTexts(sourceEditor)).toEqual(['keep']);
      expect(getTexts(targetEditor)).toEqual(['target', 'captured']);
    });

    it('moves only the captured source when a third editor is mounted', () => {
      const sourceEditor = createPlateEditor({ plugins: [DndPlugin] });
      const targetEditor = createPlateEditor({ plugins: [DndPlugin] });
      const bystanderEditor = createPlateEditor({ plugins: [DndPlugin] });

      sourceEditor.update.value.replace({
        children: [
          { children: [{ text: 'captured' }], type: 'paragraph' },
          { children: [{ text: 'keep' }], type: 'paragraph' },
        ],
        selection: null,
      });
      targetEditor.update.value.replace({
        children: [{ children: [{ text: 'target' }], type: 'paragraph' }],
        selection: null,
      });
      bystanderEditor.update.value.replace({
        children: [{ children: [{ text: 'bystander' }], type: 'paragraph' }],
        selection: null,
      });

      currentEditor = sourceEditor;
      renderHook(() =>
        useDraggable({ element: getElement(sourceEditor, [0]) })
      );
      const capturedItem = callDragItem({} as DragSourceMonitor);

      renderDropNode(targetEditor, {
        accept: DRAG_ITEM_BLOCK,
        element: getElement(targetEditor, [0]),
        nodeRef,
      });
      const dropResult = callDrop(capturedItem, monitor);

      callDragEnd(capturedItem, { ...dropResult, dropEffect: 'move' });

      expect(getTexts(sourceEditor)).toEqual(['keep']);
      expect(getTexts(targetEditor)).toEqual(['target', 'captured']);
      expect(getTexts(bystanderEditor)).toEqual(['bystander']);
    });

    it.each([
      { dropResult: { dropEffect: 'move' }, title: 'empty' },
      {
        dropResult: { dropEffect: 'move', external: true },
        title: 'external',
      },
    ])(
      'keeps the source for an unclaimed $title drop result',
      ({ dropResult }) => {
        const sourceEditor = createPlateEditor({ plugins: [DndPlugin] });

        sourceEditor.update.value.replace({
          children: [
            { children: [{ text: 'captured' }], type: 'paragraph' },
            { children: [{ text: 'keep' }], type: 'paragraph' },
          ],
          selection: null,
        });

        currentEditor = sourceEditor;
        renderHook(() =>
          useDraggable({ element: getElement(sourceEditor, [0]) })
        );
        const capturedItem = callDragItem({} as DragSourceMonitor);

        callDragEnd(capturedItem, dropResult);

        expect(getTexts(sourceEditor)).toEqual(['captured', 'keep']);
      }
    );

    it('keeps the source when the target rejects the landing', () => {
      const sourceEditor = createPlateEditor({ plugins: [DndPlugin] });
      const targetEditor = createPlateEditor({ plugins: [DndPlugin] });

      sourceEditor.update.value.replace({
        children: [
          { children: [{ text: 'captured' }], type: 'paragraph' },
          { children: [{ text: 'keep' }], type: 'paragraph' },
        ],
        selection: null,
      });
      targetEditor.update.value.replace({
        children: [{ children: [{ text: 'target' }], type: 'paragraph' }],
        selection: null,
      });

      currentEditor = sourceEditor;
      renderHook(() =>
        useDraggable({ element: getElement(sourceEditor, [0]) })
      );
      const capturedItem = callDragItem({} as DragSourceMonitor);

      renderDropNode(targetEditor, {
        accept: DRAG_ITEM_BLOCK,
        canDropNode: () => false,
        element: getElement(targetEditor, [0]),
        nodeRef,
      });
      const dropResult = callDrop(capturedItem, monitor);

      callDragEnd(capturedItem, { ...dropResult, dropEffect: 'move' });

      expect(getTexts(sourceEditor)).toEqual(['captured', 'keep']);
      expect(getTexts(targetEditor)).toEqual(['target']);
    });

    it('still moves the captured block after a selection-only change', () => {
      const sourceEditor = createPlateEditor({ plugins: [DndPlugin] });
      const targetEditor = createPlateEditor({ plugins: [DndPlugin] });

      sourceEditor.update.value.replace({
        children: [
          { children: [{ text: 'captured' }], type: 'paragraph' },
          { children: [{ text: 'keep' }], type: 'paragraph' },
        ],
        selection: null,
      });
      targetEditor.update.value.replace({
        children: [{ children: [{ text: 'target' }], type: 'paragraph' }],
        selection: null,
      });

      const sourceElement = getElement(sourceEditor, [0]);

      currentEditor = sourceEditor;
      renderHook(() => useDraggable({ element: sourceElement }));
      const capturedItem = callDragItem({} as DragSourceMonitor);

      sourceEditor.update.selection.set({ offset: 0, path: [1, 0] });

      renderDropNode(targetEditor, {
        accept: DRAG_ITEM_BLOCK,
        element: getElement(targetEditor, [0]),
        nodeRef,
      });
      const dropResult = callDrop(capturedItem, monitor);

      callDragEnd(capturedItem, { ...dropResult, dropEffect: 'move' });

      expect(getTexts(targetEditor)).toEqual(['target', 'captured']);
      expect(getTexts(sourceEditor)).toEqual(['keep']);
    });

    it('keeps same-editor drag routing after an unrelated document edit', () => {
      const innerEditor = createPlateEditor({ plugins: [DndPlugin] });

      innerEditor.update.value.replace({
        children: [
          { children: [{ text: 'drag' }], type: 'paragraph' },
          { children: [{ text: 'hover' }], type: 'paragraph' },
          { children: [{ text: 'other' }], type: 'paragraph' },
        ],
        selection: null,
      });

      currentEditor = innerEditor;
      renderHook(() => useDraggable({ element: getElement(innerEditor, [0]) }));
      const capturedItem = callDragItem({} as DragSourceMonitor);

      innerEditor.update.selection.set({ offset: 0, path: [2, 0] });
      innerEditor.update.text.insert('edited ');

      renderDropNode(innerEditor, {
        accept: DRAG_ITEM_BLOCK,
        element: getElement(innerEditor, [1]),
        nodeRef,
      });
      callDrop(capturedItem, monitor);

      expect(getTexts(innerEditor)).toEqual(['hover', 'drag', 'edited other']);
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
      renderDropNode(editor, {
        accept: DRAG_ITEM_BLOCK,
        element: hoverElement,
        nodeRef,
      });
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

    it('keeps a top drop on the first block without requesting a negative path', () => {
      const firstElement = getElement(editor, [0]);
      const firstKey = getNodeKey(editor, [0]);

      clientOffset = { x: 50, y: 25 };
      renderDropNode(editor, {
        accept: DRAG_ITEM_BLOCK,
        element: firstElement,
        nodeRef,
      });

      callHover(dragItem, monitor);

      expect(editor.plugin(DndPlugin).store.get('dropTarget')).toEqual({
        key: firstKey,
        line: 'top',
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
