import type { DropTargetMonitor } from 'react-dnd';

import { type TElement, RangeApi } from '@udecode/plate';
import { createPlateEditor } from '@udecode/plate/react';

import type { DragItemNode } from '../types';

import { DndPlugin } from '../DndPlugin';
import { onHoverNode } from './onHoverNode';

jest.mock('@udecode/plate', () => ({
  ...jest.requireActual('@udecode/plate'),
  RangeApi: {
    ...jest.requireActual('@udecode/plate').RangeApi,
    isExpanded: jest.fn(),
  },
}));

jest.mock('../utils', () => ({
  getHoverDirection: jest.fn(),
  getNewDirection: jest.fn((dropLine, direction) => direction),
}));

jest.mock('./onDropNode', () => ({
  getDropPath: jest.fn((editor, options) => ({
    direction: options.orientation === 'horizontal' ? 'left' : 'bottom',
    dragPath: [0],
    to: [1],
  })),
}));

describe('onHoverNode', () => {
  const editor = createPlateEditor();
  editor.getOptions = jest.fn();
  editor.selection = null;
  editor.setOption = jest.fn();
  editor.tf.collapse = jest.fn();
  editor.tf.focus = jest.fn();

  const monitor = {} as DropTargetMonitor;
  const nodeRef = {};
  const dragElement = { id: 'drag' } as unknown as TElement;
  const dragItem: DragItemNode = { id: 'drag', element: dragElement };

  const hoverElement = { id: 'hover' } as unknown as TElement;

  beforeEach(() => {
    jest.clearAllMocks();
    (editor.getOptions as jest.Mock).mockReturnValue({
      dropTarget: { id: null, line: '' },
    });
  });

  it('should update plugin options when direction changes', () => {
    const { getDropPath } = require('./onDropNode');
    getDropPath.mockReturnValueOnce({
      direction: 'bottom',
      dragPath: [0],
      to: [1],
    });

    (RangeApi.isExpanded as jest.Mock).mockReturnValue(false);

    onHoverNode(editor, {
      dragItem,
      element: hoverElement,
      monitor,
      nodeRef,
    });

    expect(editor.setOption).toHaveBeenCalledWith(DndPlugin, 'dropTarget', {
      id: 'hover',
      line: 'bottom',
    });
  });

  it('should collapse selection and focus editor if direction is returned and selection is expanded', () => {
    const { getDropPath } = require('./onDropNode');
    getDropPath.mockReturnValueOnce({
      direction: 'top',
      dragPath: [0],
      to: [1],
    });

    (RangeApi.isExpanded as jest.Mock).mockReturnValue(true);

    editor.selection = {
      anchor: { offset: 0, path: [0] },
      focus: { offset: 0, path: [1] },
    };

    onHoverNode(editor, {
      dragItem,
      element: hoverElement,
      monitor,
      nodeRef,
    });

    expect(editor.tf.collapse).toHaveBeenCalled();
    expect(editor.tf.focus).toHaveBeenCalled();
  });

  it('should handle horizontal orientation', () => {
    const { getDropPath } = require('./onDropNode');
    getDropPath.mockReturnValueOnce({
      direction: 'left',
      dragPath: [0],
      to: [1],
    });

    (RangeApi.isExpanded as jest.Mock).mockReturnValue(false);

    onHoverNode(editor, {
      dragItem,
      element: hoverElement,
      monitor,
      nodeRef,
      orientation: 'horizontal',
    });

    expect(editor.setOption).toHaveBeenCalledWith(DndPlugin, 'dropTarget', {
      id: 'hover',
      line: 'left',
    });
  });

  it('should clear dropTarget when no direction is returned', () => {
    const { getDropPath } = require('./onDropNode');
    getDropPath.mockReturnValueOnce(undefined);

    (editor.getOptions as jest.Mock).mockReturnValue({
      dropTarget: { id: 'hover', line: 'bottom' },
    });

    onHoverNode(editor, {
      dragItem,
      element: hoverElement,
      monitor,
      nodeRef,
    });

    expect(editor.setOption).toHaveBeenCalledWith(DndPlugin, 'dropTarget', {
      id: null,
      line: '',
    });
  });
});
