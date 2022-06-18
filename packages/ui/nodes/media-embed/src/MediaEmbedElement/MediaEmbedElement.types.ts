import { HTMLAttributes } from 'react';
import { Value } from '@udecode/plate-core';
import { TMediaEmbedElement } from '@udecode/plate-media-embed';
import { StyledElementProps } from '@udecode/plate-styled-components';
import { CSSProp } from 'styled-components';
import { EmbedUrlData } from './utils/parseEmbedUrl';
import { TweetProps } from './Tweet';

export interface MediaEmbedElementStyles {
  iframeWrapper: CSSProp;
  iframe: CSSProp;
  input: CSSProp;
}

export type MediaEmbedElementProps<V extends Value> = StyledElementProps<
  V,
  TMediaEmbedElement,
  MediaEmbedElementStyles
> & {
  disableInput?: boolean;
  tweetProps?: Partial<TweetProps>;
  getIframeProps?: (options: {
    element: TMediaEmbedElement;
    embedUrlData: EmbedUrlData;
  }) => HTMLAttributes<HTMLIFrameElement>;
};
