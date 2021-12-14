import React from 'react';
import { TEditor } from '@udecode/plate-core';
import { StyledElementProps } from '@udecode/plate-styled-components';
import { Element, Path } from 'slate';
import { CSSProp } from 'styled-components';

export interface DraggableStyleProps extends DraggableProps {
  direction: '' | 'top' | 'bottom';
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
  element: Element;
  styles?: CSSProp;
}

export interface DraggableProps
  extends StyledElementProps<{}, DraggableStyles> {
  componentRef?: any;

  /**
   * An override to render the drag handle.
   */
  onRenderDragHandle?: (props: DragHandleProps) => JSX.Element;

  level?: number;
  filter?: (editor: TEditor, path: Path) => boolean;
  allowReadOnly?: boolean;
}
