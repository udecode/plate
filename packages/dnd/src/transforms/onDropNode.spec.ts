import type { DropTargetMonitor } from 'react-dnd';
import type { Element, Path } from '@platejs/slate';
import type { PlateEditor } from 'platejs/react';

import type { DragItemNode } from '../types';

import * as utils from '../utils';
import { onDropNode } from './onDropNode';

type TestTx = {
  nodes: {
    insert: ReturnType<typeof mock>;
    move: ReturnType<typeof mock>;
    remove: ReturnType<typeof mock>;
  };
};

type TestEditor = PlateEditor & {
  api: PlateEditor['api'] & {
    node: ReturnType<typeof mock>;
  };
  update: ReturnType<typeof mock>;
};

const createEditor = (id = 'editor') => {
  const tx: TestTx = {
    nodes: {
      insert: mock(),
      move: mock(),
      remove: mock(),
    },
  };
  const editor = {
    api: {
      node: mock(),
    },
    id,
    update: mock((fn) => fn(tx)),
  } as unknown as TestEditor;

  return { editor, tx };
};

const mockNodePaths = (editor: TestEditor, pathsById: Record<string, Path>) => {
  editor.api.node.mockImplementation(({ id }: { id: string }) => {
    const path = pathsById[id];

    if (!path) return;

    return [{ id } as unknown as Element, path];
  });
};

describe('onDropNode', () => {
  let editor: TestEditor;
  let tx: TestTx;
  let dragItem: DragItemNode;

  const monitor = { canDrop: () => true } as DropTargetMonitor;
  const nodeRef = {};
  const dragElement = { id: 'drag' } as unknown as Element;
  const hoverElement = { id: 'hover' } as unknown as Element;

  let getHoverDirectionSpy: ReturnType<typeof spyOn>;
  let getHoverDirectionMock: ReturnType<typeof mock>;

  beforeEach(() => {
    ({ editor, tx } = createEditor());

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

  it('returns early when no drop direction is available', () => {
    getHoverDirectionMock.mockReturnValueOnce(undefined);

    onDropNode(editor, {
      dragItem: dragItem as any,
      element: hoverElement,
      monitor,
      nodeRef,
    });

    expect(editor.update).not.toHaveBeenCalled();
  });

  it('returns early when the drag node is missing', () => {
    getHoverDirectionMock.mockReturnValueOnce('bottom');
    mockNodePaths(editor, { hover: [1] });

    onDropNode(editor, {
      dragItem: dragItem as any,
      element: hoverElement,
      monitor,
      nodeRef,
    });

    expect(editor.update).not.toHaveBeenCalled();
  });

  it('returns early when the hover node is missing', () => {
    getHoverDirectionMock.mockReturnValueOnce('bottom');
    mockNodePaths(editor, { drag: [0] });

    onDropNode(editor, {
      dragItem: dragItem as any,
      element: hoverElement,
      monitor,
      nodeRef,
    });

    expect(editor.update).not.toHaveBeenCalled();
  });

  it('moves the node below when direction is bottom', () => {
    getHoverDirectionMock.mockReturnValue('bottom');
    mockNodePaths(editor, { drag: [0], hover: [1] });

    onDropNode(editor, {
      dragItem: dragItem as any,
      element: hoverElement,
      monitor,
      nodeRef,
    });

    expect(tx.nodes.move).toHaveBeenCalledWith({
      at: [0],
      to: [1],
    });
  });

  it('moves the node above when direction is top', () => {
    getHoverDirectionMock.mockReturnValue('top');
    mockNodePaths(editor, { drag: [2], hover: [1] });

    onDropNode(editor, {
      dragItem: dragItem as any,
      element: hoverElement,
      monitor,
      nodeRef,
    });

    expect(tx.nodes.move).toHaveBeenCalledWith({
      at: [2],
      to: [1],
    });
  });

  it('does not move when already in the bottom position', () => {
    getHoverDirectionMock.mockReturnValue('bottom');
    mockNodePaths(editor, { drag: [1], hover: [0] });

    onDropNode(editor, {
      dragItem: dragItem as any,
      element: hoverElement,
      monitor,
      nodeRef,
    });

    expect(editor.update).not.toHaveBeenCalled();
  });

  it('does not move when already in the top position', () => {
    getHoverDirectionMock.mockReturnValue('top');
    mockNodePaths(editor, { drag: [0], hover: [1] });

    onDropNode(editor, {
      dragItem: dragItem as any,
      element: hoverElement,
      monitor,
      nodeRef,
    });

    expect(editor.update).not.toHaveBeenCalled();
  });

  it('moves the node right in horizontal orientation', () => {
    getHoverDirectionMock.mockReturnValue('right');
    mockNodePaths(editor, { drag: [2, 0], hover: [2, 1] });

    onDropNode(editor, {
      dragItem: dragItem as any,
      element: hoverElement,
      monitor,
      nodeRef,
      orientation: 'horizontal',
    });

    expect(tx.nodes.move).toHaveBeenCalledWith({
      at: [2, 0],
      to: [2, 1],
    });
  });

  it('moves the node left in horizontal orientation', () => {
    getHoverDirectionMock.mockReturnValue('left');
    mockNodePaths(editor, { drag: [2, 2], hover: [2, 1] });

    onDropNode(editor, {
      dragItem: dragItem as any,
      element: hoverElement,
      monitor,
      nodeRef,
      orientation: 'horizontal',
    });

    expect(tx.nodes.move).toHaveBeenCalledWith({
      at: [2, 2],
      to: [2, 1],
    });
  });

  it('does not move when the drop guard rejects the target', () => {
    getHoverDirectionMock.mockReturnValue('bottom');
    mockNodePaths(editor, { drag: [0], hover: [1] });

    onDropNode(editor, {
      canDropNode: () => false,
      dragItem: dragItem as any,
      element: hoverElement,
      monitor,
      nodeRef,
    });

    expect(editor.update).not.toHaveBeenCalled();
  });

  it('removes nodes from the source editor after inserting into the target editor', () => {
    getHoverDirectionMock.mockReturnValue('bottom');

    const { editor: sourceEditor, tx: sourceTx } = createEditor('source');

    mockNodePaths(editor, { drag: [1], hover: [2] });
    mockNodePaths(sourceEditor, { drag: [0] });

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

    expect(tx.nodes.insert).toHaveBeenCalledWith(dragElement, {
      at: [2],
    });
    expect(sourceEditor.api.node).toHaveBeenCalledWith({
      id: 'drag',
      at: [],
    });
    expect(sourceTx.nodes.remove).toHaveBeenCalledWith({ at: [0] });
  });

  it('removes cross-editor multi-node paths from bottom to top', () => {
    getHoverDirectionMock.mockReturnValue('bottom');

    const { editor: sourceEditor, tx: sourceTx } = createEditor('source');

    mockNodePaths(editor, { drag: [0], hover: [1] });
    mockNodePaths(sourceEditor, {
      'drag-1': [0],
      'drag-2': [2],
    });

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

    expect(sourceTx.nodes.remove.mock.calls).toEqual([
      [{ at: [2] }],
      [{ at: [0] }],
    ]);
  });

  it('moves all dragged ids with a match predicate', () => {
    getHoverDirectionMock.mockReturnValue('bottom');
    mockNodePaths(editor, {
      drag: [0],
      'drag-1': [0],
      'drag-2': [1],
      hover: [2],
    });

    onDropNode(editor, {
      dragItem: {
        ...dragItem,
        id: ['drag-1', 'drag-2'],
      } as any,
      element: hoverElement,
      monitor,
      nodeRef,
    });

    const options = tx.nodes.move.mock.calls[0]?.[0];

    expect(options.at).toEqual([]);
    expect(options.to).toEqual([2]);
    expect(options.match({ id: 'drag-1' })).toBe(true);
    expect(options.match({ id: 'drag-2' })).toBe(true);
    expect(options.match({ id: 'other' })).toBe(false);
  });
});
