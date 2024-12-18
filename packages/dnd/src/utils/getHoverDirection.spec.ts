import type { DropTargetMonitor } from 'react-dnd';

import type { DragItemNode } from '../types';

import { getHoverDirection } from './getHoverDirection';

describe('getHoverDirection', () => {
  const nodeRef = {
    current: {
      getBoundingClientRect: jest.fn(),
    },
  } as any;

  const mockMonitor = {
    getClientOffset: jest.fn(),
  } as unknown as DropTargetMonitor;

  const dragItem: DragItemNode = { id: 'drag' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return "top" when vertical and mouse is above middle', () => {
    nodeRef.current.getBoundingClientRect.mockReturnValue({
      bottom: 200,
      top: 100,
    });
    (mockMonitor.getClientOffset as any).mockReturnValue({ x: 150, y: 120 });

    const direction = getHoverDirection({
      id: 'hover',
      dragItem,
      monitor: mockMonitor,
      nodeRef,
      orientation: 'vertical',
    });

    expect(direction).toBe('top');
  });

  it('should return "bottom" when vertical and mouse is below middle', () => {
    nodeRef.current.getBoundingClientRect.mockReturnValue({
      bottom: 200,
      top: 100,
    });
    (mockMonitor.getClientOffset as any).mockReturnValue({ x: 150, y: 180 });

    const direction = getHoverDirection({
      id: 'hover',
      dragItem,
      monitor: mockMonitor,
      nodeRef,
      orientation: 'vertical',
    });

    expect(direction).toBe('bottom');
  });

  it('should return "left" when horizontal and mouse is left of middle', () => {
    nodeRef.current.getBoundingClientRect.mockReturnValue({
      left: 100,
      right: 200,
    });
    (mockMonitor.getClientOffset as any).mockReturnValue({ x: 120, y: 150 });

    const direction = getHoverDirection({
      id: 'hover',
      dragItem,
      monitor: mockMonitor,
      nodeRef,
      orientation: 'horizontal',
    });

    expect(direction).toBe('left');
  });

  it('should return "right" when horizontal and mouse is right of middle', () => {
    nodeRef.current.getBoundingClientRect.mockReturnValue({
      left: 100,
      right: 200,
    });
    (mockMonitor.getClientOffset as any).mockReturnValue({ x: 180, y: 150 });

    const direction = getHoverDirection({
      id: 'hover',
      dragItem,
      monitor: mockMonitor,
      nodeRef,
      orientation: 'horizontal',
    });

    expect(direction).toBe('right');
  });

  it('should return undefined if dragId === id', () => {
    const direction = getHoverDirection({
      id: 'drag',
      dragItem: { id: 'drag' },
      monitor: mockMonitor,
      nodeRef,
    });

    expect(direction).toBeUndefined();
  });
});
