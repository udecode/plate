import { Value } from '@udecode/plate-common';
import { PopoverProps } from '@udecode/plate-floating';
import { TMediaEmbedElement } from '@udecode/plate-media';
import { PlateElementProps } from '@udecode/plate-styled-components';
import { CSSProp } from 'styled-components';

export interface MediaEmbedElementStyles {
  iframe: CSSProp;
  iframeWrapper: CSSProp;
  resizable: CSSProp;
  figure: CSSProp;
  figcaption: CSSProp;
  caption: CSSProp;
  handle: CSSProp;
  handleLeft: CSSProp;
  handleRight: CSSProp;
}

export interface MediaEmbedElementPropsCaption {
  disabled?: boolean;

  /**
   * Caption placeholder.
   */
  placeholder?: string;

  /**
   * Whether caption is read-only.
   */
  readOnly?: boolean;
}

export interface MediaEmbedElementProps
  extends PlateElementProps<Value, TMediaEmbedElement> {
  caption?: MediaEmbedElementPropsCaption;
  popoverProps?: PopoverProps;
}
