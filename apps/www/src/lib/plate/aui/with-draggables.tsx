import {
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CODE_BLOCK,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
  ELEMENT_OL,
  ELEMENT_PARAGRAPH,
  ELEMENT_UL,
} from '@udecode/plate';
import { createNodesWithHOC, RenderFunction } from '@udecode/plate-common';
import {
  withDraggable as withDraggablePrimitive,
  WithDraggableOptions,
} from '@udecode/plate-dnd';
import { Draggable, PlateDraggableProps } from './draggable';

export const withDraggable = (
  Component: RenderFunction<any>,
  options?: WithDraggableOptions<
    Partial<Omit<PlateDraggableProps, 'editor' | 'element' | 'children'>>
  >
) =>
  withDraggablePrimitive<PlateDraggableProps>(
    Draggable,
    Component,
    options as any
  );

export const withDraggablesPrimitive = createNodesWithHOC(withDraggable);

export const withDraggables = (components: any) => {
  return withDraggablesPrimitive(components, [
    {
      keys: [ELEMENT_PARAGRAPH, ELEMENT_UL, ELEMENT_OL],
      level: 0,
    },
    {
      key: ELEMENT_H1,
      draggableProps: {
        classNames: {
          gutterLeft: 'pt-[2em] px-0 pb-1 text-[1.875em]',
          blockToolbarWrapper: 'h-[1.3em]',
        },
      },
    },
    {
      key: ELEMENT_H2,
      draggableProps: {
        classNames: {
          gutterLeft: 'pt-[1.4em] px-0 pb-1 text-[1.5em]',
          blockToolbarWrapper: 'h-[1.3em]',
        },
      },
    },
    {
      key: ELEMENT_H3,
      draggableProps: {
        classNames: {
          gutterLeft: 'pt-[1em] px-0 pb-1 text-[1.25em]',
          blockToolbarWrapper: 'h-[1.3em]',
        },
      },
    },
    {
      keys: [ELEMENT_H4, ELEMENT_H5, ELEMENT_H6],
      draggableProps: {
        classNames: {
          gutterLeft: 'pt-[0.75em] px-0 pb-0 text-[1.1em]',
          blockToolbarWrapper: 'h-[1.3em]',
        },
      },
    },
    {
      keys: [ELEMENT_PARAGRAPH, ELEMENT_UL, ELEMENT_OL],
      draggableProps: {
        classNames: {
          gutterLeft: 'pt-1 px-0 pb-0',
        },
      },
    },
    {
      key: ELEMENT_BLOCKQUOTE,
      draggableProps: {
        classNames: {
          gutterLeft: 'pt-[18px] px-0 pb-0',
        },
      },
    },
    {
      key: ELEMENT_CODE_BLOCK,
      draggableProps: {
        classNames: {
          gutterLeft: 'pt-3 px-0 pb-0',
        },
      },
    },
  ]);
};
