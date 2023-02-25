import React from 'react';
import { EElement, TEditor, TElement, Value } from '@udecode/plate-core';
import { DropLineDirection } from '@udecode/plate-dnd';
import { StyledElementProps } from '@udecode/plate-styled-components';
import { Path } from 'slate';
import { CSSProp } from 'styled-components';

export interface DraggableStyleProps extends PlateDraggableProps {
  direction: DropLineDirection;
  isDragging: boolean;

  selected?: boolean;
}

export interface DraggableStyles {
  /**
   * Block and gutter.
   */
  blockAndGutter: CSSProp;

  /**
   * Block.
   */
  block: CSSProp;

  /**
   * Gutter at the left side of the editor.
   * It has the height of the block
   */
  gutterLeft: CSSProp;

  /**
   * Block toolbar wrapper in the gutter left.
   * It has the height of a line of the block.
   */
  blockToolbarWrapper: CSSProp;

  /**
   * Block toolbar in the gutter.
   */
  blockToolbar: CSSProp;

  /**
   * Button to dnd the block, in the block toolbar.
   */
  dragHandle: CSSProp;

  /**
   * Icon of the drag button, in the drag icon.
   */
  dragIcon: CSSProp;

  /**
   * Show a dropline above or below the block when dragging a block.
   */
  dropLine: CSSProp;
}

export interface DragHandleProps
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  element: TElement;
  styles?: CSSProp;
}

export interface PlateDraggableProps
  extends StyledElementProps<Value, EElement<Value>, DraggableStyles> {
  /**
   * An override to render the drag handle.
   */
  onRenderDragHandle?: (props: DragHandleProps) => JSX.Element;

  /**
   * Document level where dnd is enabled. 0 = root blocks, 1 = first level of children, etc.
   * Set to null to allow all levels.
   * @default 0
   */
  level?: number | null;

  /**
   * Filter out elements that can't be dragged.
   */
  filter?: (editor: TEditor, path: Path) => boolean;

  /**
   * Enables dnd in read-only.
   */
  allowReadOnly?: boolean;
}
