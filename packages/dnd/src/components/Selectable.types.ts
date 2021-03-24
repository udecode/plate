import React from 'react';
import {
  ClassName,
  RootStyleSet,
  StyledElementProps,
} from '@udecode/slate-plugins-ui-fluent';
import { IStyle } from '@uifabric/styling';

export interface SelectableStyleProps extends ClassName {
  direction: '' | 'top' | 'bottom';
  isDragging: boolean;

  // TODO: tbd
  selected?: boolean;
}

export interface SelectableStyleSet extends RootStyleSet {
  /**
   * Block and gutter.
   */
  blockAndGutter?: IStyle;

  /**
   * Block.
   */
  block?: IStyle;

  /**
   * Gutter at the left side of the editor.
   * It has the height of the block
   */
  gutterLeft?: IStyle;

  /**
   * Block toolbar wrapper in the gutter left.
   * It has the height of a line of the block.
   */
  blockToolbarWrapper?: IStyle;

  /**
   * Block toolbar in the gutter.
   */
  blockToolbar?: IStyle;

  /**
   * Button to dnd the block, in the block toolbar.
   */
  dragButton?: IStyle;

  /**
   * Icon of the drag button, in the drag icon.
   */
  dragIcon?: IStyle;

  /**
   * Show a dropline above or below the block when dragging a block.
   */
  dropLine?: IStyle;
}

export interface SelectableProps
  extends StyledElementProps<{}, SelectableStyleProps, SelectableStyleSet> {
  componentRef?: any;

  dragIcon?: React.ReactNode;
}
