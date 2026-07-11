import type { Element } from '@platejs/plite';
import type { DropTargetMonitor } from 'react-dnd';

import type { ElementDragItemNode } from '../types';

import { getHoverDirection } from './getHoverDirection';

describe('getHoverDirection', () => {
  const getClientOffset = mock();
  const monitor = { getClientOffset } as unknown as DropTargetMonitor;
  const node = document.createElement('div');
  const nodeRef = { current: node };
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

  beforeEach(() => {
    spyOn(node, 'getBoundingClientRect').mockReturnValue(
      new DOMRect(100, 100, 100, 100)
    );
  });

  afterEach(() => {
    mock.restore();
  });

  it('returns top when a vertical pointer is above the midpoint', () => {
    getClientOffset.mockReturnValue({ x: 150, y: 120 });

    expect(
      getHoverDirection({
        dragItem,
        element: hoverElement,
        monitor,
        nodeRef,
        orientation: 'vertical',
      })
    ).toBe('top');
  });

  it('returns bottom when a vertical pointer is below the midpoint', () => {
    getClientOffset.mockReturnValue({ x: 150, y: 180 });

    expect(
      getHoverDirection({
        dragItem,
        element: hoverElement,
        monitor,
        nodeRef,
        orientation: 'vertical',
      })
    ).toBe('bottom');
  });

  it('returns left or right around the horizontal midpoint', () => {
    getClientOffset.mockReturnValue({ x: 120, y: 150 });
    expect(
      getHoverDirection({
        dragItem,
        element: hoverElement,
        monitor,
        nodeRef,
        orientation: 'horizontal',
      })
    ).toBe('left');

    getClientOffset.mockReturnValue({ x: 180, y: 150 });
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
    getClientOffset.mockReturnValue({ x: 150, y: 180 });

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
