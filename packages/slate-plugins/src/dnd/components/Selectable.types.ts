import React from 'react';
import { IStyle } from '@uifabric/styling';
import { IStyleFunctionOrObject } from '@uifabric/utilities';
import { Element } from 'slate';
import { RenderElementProps } from 'slate-react';

export interface ElementWithId extends Element {
  id: string;
}

export interface SelectableProps
  extends Pick<RenderElementProps, 'attributes'> {
  /**
   * Additional class name to provide on the root element, in addition to the slate-Selectable class.
   */
  className?: string;

  /**
   * Call to provide customized styling that will layer on top of the variant rules.
   */
  styles?: IStyleFunctionOrObject<SelectableStyleProps, SelectableStyles>;

  children?: any;

  componentRef?: any;

  dragIcon?: React.ReactNode;

  element: ElementWithId;
}

export interface SelectableStyleProps {
  className?: string;
  direction: '' | 'top' | 'bottom';
  isDragging: boolean;

  // TODO: tbd
  selected?: boolean;
}

export interface SelectableStyles {
  /**
   * Contains the gutter left, block, dropline.
   */
  root?: IStyle;

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

export interface DragItemBlock {
  id: string;
  type: string;
}

export type DropDirection = 'top' | 'bottom' | undefined;
