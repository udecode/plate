import React from 'react';
import { TElement } from '@udecode/plate-common';
import { CSSProp } from 'styled-components';

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
