import assert from 'node:assert/strict';
import type { Element } from '@platejs/plite';
import type { DropTargetMonitor } from 'react-dnd';

import { createPlateEditor, type PlateEditor } from '@platejs/core/react';

import type { ElementDragItemNode } from '../types';

import * as utils from '../utils';
import { onDropNode } from './onDropNode';

const getElement = (editor: PlateEditor, path: number[]) => {
  const entry = editor.read.nodes.get<Element>(path);
  assert(entry);

  return entry[0];
};

describe('onDropNode', () => {
  const monitor = { canDrop: () => true } as DropTargetMonitor;
  const nodeRef = { current: null };

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
  });

  afterEach(() => {
    mock.restore();
  });

  it('does nothing without a drop direction', () => {
    spyOn(utils, 'getHoverDirection').mockReturnValue(undefined);

    onDropNode(editor, {
      dragItem,
      element: hoverElement,
      monitor,
      nodeRef,
    });

    expect(editor.read.children().map((node) => node.id)).toEqual([
      'drag',
      'hover',
      'other',
    ]);
  });

  it('moves a block below the hovered block', () => {
    spyOn(utils, 'getHoverDirection').mockReturnValue('bottom');

    onDropNode(editor, {
      dragItem,
      element: hoverElement,
      monitor,
      nodeRef,
    });

    expect(editor.read.children().map((node) => node.id)).toEqual([
      'hover',
      'drag',
      'other',
    ]);
  });

  it('moves a block before the hovered block', () => {
    spyOn(utils, 'getHoverDirection').mockReturnValue('top');
    const otherElement = getElement(editor, [2]);

    onDropNode(editor, {
      dragItem: {
        id: 'other',
        editorId: editor.id,
        element: otherElement,
      },
      element: hoverElement,
      monitor,
      nodeRef,
    });

    expect(editor.read.children().map((node) => node.id)).toEqual([
      'drag',
      'other',
      'hover',
    ]);
  });

  it('keeps a block in place when it is already adjacent', () => {
    spyOn(utils, 'getHoverDirection').mockReturnValue('bottom');
    const move = spyOn(editor.update.nodes, 'move');

    onDropNode(editor, {
      dragItem: {
        id: 'hover',
        editorId: editor.id,
        element: hoverElement,
      },
      element: dragElement,
      monitor,
      nodeRef,
    });

    expect(move).not.toHaveBeenCalled();
  });

  it('honors the package drop guard', () => {
    spyOn(utils, 'getHoverDirection').mockReturnValue('bottom');
    const move = spyOn(editor.update.nodes, 'move');

    onDropNode(editor, {
      canDropNode: () => false,
      dragItem,
      element: hoverElement,
      monitor,
      nodeRef,
    });

    expect(move).not.toHaveBeenCalled();
  });

  it('moves every selected block in the same editor', () => {
    spyOn(utils, 'getHoverDirection').mockReturnValue('bottom');
    const targetElement = getElement(editor, [2]);

    onDropNode(editor, {
      dragItem: { ...dragItem, id: ['drag', 'hover'] },
      element: targetElement,
      monitor,
      nodeRef,
    });

    expect(editor.read.children().map((node) => node.id)).toEqual([
      'other',
      'drag',
      'hover',
    ]);
  });

  it('moves every selected block across editors without dropping data', () => {
    spyOn(utils, 'getHoverDirection').mockReturnValue('bottom');
    const sourceEditor = createPlateEditor();
    sourceEditor.update.nodes.insert(
      [
        { children: [{ text: 'one' }], id: 'drag-1', type: 'p' },
        { children: [{ text: 'keep' }], id: 'keep', type: 'p' },
        { children: [{ text: 'two' }], id: 'drag-2', type: 'p' },
      ],
      { at: [0] }
    );
    const sourceElement = getElement(sourceEditor, [0]);

    onDropNode(editor, {
      dragItem: {
        editor: sourceEditor,
        editorId: sourceEditor.id,
        element: sourceElement,
        id: ['drag-1', 'drag-2'],
      },
      element: hoverElement,
      monitor,
      nodeRef,
    });

    expect(editor.read.children().map((node) => node.id)).toEqual([
      'drag',
      'hover',
      'drag-1',
      'drag-2',
      'other',
    ]);
    expect(sourceEditor.read.children().map((node) => node.id)).toEqual([
      'keep',
    ]);
  });

  it('lets the node-id owner rewrite cross-editor id collisions', () => {
    spyOn(utils, 'getHoverDirection').mockReturnValue('bottom');
    let nextId = 0;
    const targetEditor = createPlateEditor({
      nodeId: { idCreator: () => `target-${++nextId}` },
    });
    targetEditor.update.nodes.insert(
      { children: [{ text: 'target' }], id: 'hover', type: 'p' },
      { at: [0] }
    );
    const targetElement = getElement(targetEditor, [0]);
    const sourceEditor = createPlateEditor();
    sourceEditor.update.nodes.insert(
      { children: [{ text: 'source' }], id: 'hover', type: 'p' },
      { at: [0] }
    );
    const sourceElement = getElement(sourceEditor, [0]);

    onDropNode(targetEditor, {
      dragItem: {
        editor: sourceEditor,
        editorId: sourceEditor.id,
        element: sourceElement,
        id: 'hover',
      },
      element: targetElement,
      monitor,
      nodeRef,
    });

    const ids = targetEditor.read.children().map((node) => node.id);

    expect(new Set(ids).size).toBe(ids.length);
    expect(targetEditor.read.text.string([])).toContain('source');
  });
});
