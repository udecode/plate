import { Value } from '@udecode/plate-core';
import { TImageElement } from '@udecode/plate-image';
import { StyledElementProps } from '@udecode/plate-styled-components';
import { ResizableProps } from 're-resizable';
import { CSSProp } from 'styled-components';
import { ImageResizableProps } from './ImageResizable';

export interface ImageElementStyleProps<V extends Value>
  extends ImageElementProps<V> {
  selected?: boolean;
  focused?: boolean;
}

export interface ImageElementStyles {
  resizable: CSSProp;
  figure: CSSProp;
  img: CSSProp;
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

export interface ImageElementProps<V extends Value>
  extends StyledElementProps<V, TImageElement, ImageElementStyles>,
    Pick<Partial<ImageResizableProps>, 'align'> {
  resizableProps?: ResizableProps;

  caption?: ImageElementPropsCaption;

  /**
   * Whether the image is draggable.
   */
  draggable?: boolean;

  /**
   * Ignore editable readOnly mode
   */
  ignoreReadOnly?: boolean;
}
