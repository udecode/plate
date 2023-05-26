import { createNodesWithHOC, RenderFunction } from '@udecode/plate-common';
import { withDraggable, WithDraggableOptions } from '@udecode/plate-dnd';
import { Draggable, PlateDraggableProps } from './Draggable';

export const withPlateDraggable = (
  Component: RenderFunction<any>,
  options?: WithDraggableOptions<
    Partial<Omit<PlateDraggableProps, 'editor' | 'element' | 'children'>>
  >
) => withDraggable<PlateDraggableProps>(Draggable, Component, options as any);

export const withPlateDraggables = createNodesWithHOC(withPlateDraggable);
