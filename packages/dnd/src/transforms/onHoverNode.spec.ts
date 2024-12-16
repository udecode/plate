/* eslint-disable @typescript-eslint/no-require-imports */
import type { PlateEditor } from '@udecode/plate-common/react';
import type { DropTargetMonitor } from 'react-dnd';

import { collapseSelection, isExpanded } from '@udecode/plate-common';
import { focusEditor } from '@udecode/plate-common/react';

import type { DragItemNode } from '../types';

import { DndPlugin } from '../DndPlugin';
import { onHoverNode } from './onHoverNode';

jest.mock('@udecode/plate-common', () => ({
  ...jest.requireActual('@udecode/plate-common'),
  collapseSelection: jest.fn(),
  isExpanded: jest.fn(),
}));

jest.mock('@udecode/plate-common/react', () => ({
  ...jest.requireActual('@udecode/plate-common/react'),
  focusEditor: jest.fn(),
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
  const editor = {
    getOptions: jest.fn(),
    selection: {},
    setOption: jest.fn(),
  } as unknown as PlateEditor;
  const monitor = {} as DropTargetMonitor;
  const nodeRef = {};
  const dragItem: DragItemNode = { id: 'drag' };

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

    (isExpanded as jest.Mock).mockReturnValue(false);

    onHoverNode(editor, {
      id: 'hover',
      dragItem,
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

    (isExpanded as jest.Mock).mockReturnValue(true);

    onHoverNode(editor, {
      id: 'hover',
      dragItem,
      monitor,
      nodeRef,
    });

    expect(collapseSelection).toHaveBeenCalledWith(editor);
    expect(focusEditor).toHaveBeenCalledWith(editor);
  });

  it('should handle horizontal orientation', () => {
    const { getDropPath } = require('./onDropNode');
    getDropPath.mockReturnValueOnce({
      direction: 'left',
      dragPath: [0],
      to: [1],
    });

    (isExpanded as jest.Mock).mockReturnValue(false);

    onHoverNode(editor, {
      id: 'hover',
      dragItem,
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
      id: 'hover',
      dragItem,
      monitor,
      nodeRef,
    });

    expect(editor.setOption).toHaveBeenCalledWith(DndPlugin, 'dropTarget', {
      id: null,
      line: '',
    });
  });
});
