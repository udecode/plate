import { createNodesWithHOC, RenderFunction } from '@udecode/plate-core';
import { withDraggable, WithDraggableOptions } from '@udecode/plate-dnd';
import { PlateDraggableProps } from './Draggable.types';
import { PlateDraggable } from './PlateDraggable';

export const withPlateDraggable = (
  Component: RenderFunction<any>,
  options?: WithDraggableOptions<
    Partial<Omit<PlateDraggableProps, 'editor' | 'element' | 'children'>>
  >
) => {
  return withDraggable<PlateDraggableProps>(
    PlateDraggable,
    Component,
    options as any
  );
};

export const withPlateDraggables = createNodesWithHOC(withPlateDraggable);
