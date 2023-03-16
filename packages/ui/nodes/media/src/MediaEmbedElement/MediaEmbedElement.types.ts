import { Value } from '@udecode/plate-common';
import { PopoverOptions } from '@udecode/plate-floating';
import { TMediaEmbedElement } from '@udecode/plate-media';
import { StyledElementProps } from '@udecode/plate-styled-components';
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
  extends StyledElementProps<
    Value,
    TMediaEmbedElement,
    MediaEmbedElementStyles
  > {
  caption?: MediaEmbedElementPropsCaption;
  popoverProps?: PopoverOptions;
}
