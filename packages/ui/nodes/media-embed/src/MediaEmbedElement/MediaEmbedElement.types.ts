import { HTMLAttributes } from 'react';
import { Value } from '@udecode/plate-core';
import { TMediaEmbedElement } from '@udecode/plate-media-embed';
import { StyledElementProps } from '@udecode/plate-styled-components';
import { CSSProp } from 'styled-components';
import { EmbedUrlData } from './utils/parseEmbedUrl';
import { MediaEmbedUrlInputProps } from './MediaEmbedUrlInput';
import { TweetProps } from './Tweet';

export interface MediaEmbedElementStyles {
  iframeInputWrapper: CSSProp;
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
  disableUnknownProviders?: boolean;
  inputProps?: Partial<MediaEmbedUrlInputProps>;
  tweetProps?: Partial<TweetProps>;
  getIframeProps?: (options: {
    element: TMediaEmbedElement;
    embedUrlData: EmbedUrlData;
  }) => HTMLAttributes<HTMLIFrameElement>;
};
