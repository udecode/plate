import { Value } from '@udecode/plate-common';
import { PopoverOptions } from '@udecode/plate-floating';
import { ResizableProps, TImageElement } from '@udecode/plate-media';
import { StyledElementProps } from '@udecode/plate-styled-components';
import { CSSProp } from 'styled-components';

export interface ImageElementStyleProps extends ImageElementProps {
  selected?: boolean;
  focused?: boolean;
}

export interface ImageElementStyles {
  img: CSSProp;
  resizable: CSSProp;
  figure: CSSProp;
  figcaption: CSSProp;
  caption: CSSProp;
  handle: CSSProp;
  handleLeft: CSSProp;
  handleRight: CSSProp;
}

export interface ImageElementPropsCaption {
  disabled?: boolean;

  /**
   * Caption alignment.
   */
  align?: 'left' | 'center' | 'right';

  /**
   * Caption placeholder.
   */
  placeholder?: string;

  /**
   * Whether caption is read-only.
   */
  readOnly?: boolean;
}

export interface ImageElementProps
  extends StyledElementProps<Value, TImageElement, ImageElementStyles>,
    Pick<Partial<ResizableProps>, 'align'> {
  resizableProps?: Omit<ResizableProps, 'as'>;

  caption?: ImageElementPropsCaption;

  popover?: PopoverOptions;

  /**
   * Whether the image is draggable.
   */
  draggable?: boolean;

  /**
   * Ignore editable readOnly mode
   */
  ignoreReadOnly?: boolean;
}
