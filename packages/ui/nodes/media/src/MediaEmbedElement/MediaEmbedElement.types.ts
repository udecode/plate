import { Value } from '@udecode/plate-common';
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

export type MediaEmbedElementProps = StyledElementProps<
  Value,
  TMediaEmbedElement,
  MediaEmbedElementStyles
>;
