import assert from 'node:assert/strict';
import type { Element } from '@platejs/plite';
import type { DropTargetMonitor } from 'react-dnd';

import { createPlateEditor, type PlateEditor } from '@platejs/core/react';

import type { ElementDragItemNode } from '../types';

import { DndPlugin } from '../DndPlugin';
import * as onDropNodeModule from './onDropNode';
import { onHoverNode } from './onHoverNode';

const getElement = (editor: PlateEditor, path: number[]) => {
  const entry = editor.read.nodes.get<Element>(path);
  assert(entry);

  return entry[0];
};

describe('onHoverNode', () => {
  const monitor = {} as DropTargetMonitor;
  const nodeRef = { current: null };

  let editor = createPlateEditor({ plugins: [DndPlugin] });
  let dragItem: ElementDragItemNode;
  let hoverElement: Element;

  beforeEach(() => {
    editor = createPlateEditor({ plugins: [DndPlugin] });
    editor.update.nodes.insert(
      [
        { children: [{ text: 'previous' }], id: 'previous', type: 'p' },
        { children: [{ text: 'hover' }], id: 'hover', type: 'p' },
        { children: [{ text: 'drag' }], id: 'drag', type: 'p' },
      ],
      { at: [0] }
    );
    const dragElement = getElement(editor, [2]);
    hoverElement = getElement(editor, [1]);
    dragItem = {
      id: 'drag',
      editorId: editor.id,
      element: dragElement,
    };
    editor.plugin(DndPlugin).setOptions({
      _isOver: true,
      dropTarget: { id: null, line: '' },
    });
  });

  afterEach(() => {
    mock.restore();
  });

  it('updates the plugin drop target when direction changes', () => {
    spyOn(onDropNodeModule, 'getDropPath').mockReturnValue({
      direction: 'bottom',
      dragPath: [2],
      to: [2],
    });

    onHoverNode(editor, {
      dragItem,
      element: hoverElement,
      monitor,
      nodeRef,
    });

    expect(editor.plugin(DndPlugin).getOption('dropTarget')).toEqual({
      id: 'hover',
      line: 'bottom',
    });
  });

  it('focuses and collapses an expanded selection', () => {
    spyOn(onDropNodeModule, 'getDropPath').mockReturnValue({
      direction: 'bottom',
      dragPath: [2],
      to: [2],
    });
    spyOn(editor.api.dom, 'focus').mockImplementation(() => {});
    editor.update.selection.set({
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [1, 0] },
    });

    onHoverNode(editor, {
      dragItem,
      element: hoverElement,
      monitor,
      nodeRef,
    });

    expect(editor.read.selection.isExpanded()).toBe(false);
  });

  it('clears a stale drop target when no move is available', () => {
    spyOn(onDropNodeModule, 'getDropPath').mockReturnValue(undefined);
    editor.plugin(DndPlugin).setOption('dropTarget', {
      id: 'hover',
      line: 'bottom',
    });

    onHoverNode(editor, {
      dragItem,
      element: hoverElement,
      monitor,
      nodeRef,
    });

    expect(editor.plugin(DndPlugin).getOption('dropTarget')).toEqual({
      id: null,
      line: '',
    });
  });

  it('maps a top drop to the previous block bottom edge', () => {
    spyOn(onDropNodeModule, 'getDropPath').mockReturnValue({
      direction: 'top',
      dragPath: [2],
      to: [1],
    });

    onHoverNode(editor, {
      dragItem,
      element: hoverElement,
      monitor,
      nodeRef,
    });

    expect(editor.plugin(DndPlugin).getOption('dropTarget')).toEqual({
      id: 'previous',
      line: 'bottom',
    });
  });

  it('does not update while the editor is outside the drop zone', () => {
    spyOn(onDropNodeModule, 'getDropPath').mockReturnValue({
      direction: 'bottom',
      dragPath: [2],
      to: [2],
    });
    editor.plugin(DndPlugin).setOption('_isOver', false);

    onHoverNode(editor, {
      dragItem,
      element: hoverElement,
      monitor,
      nodeRef,
    });

    expect(editor.plugin(DndPlugin).getOption('dropTarget')).toEqual({
      id: null,
      line: '',
    });
  });
});
