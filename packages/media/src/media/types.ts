import React from 'react';

import { TCaptionElement } from '../caption/index';
import { TResizableElement } from '../resizable/index';
import { EmbedUrlData } from './parseMediaUrl';

export interface TMediaElement extends TCaptionElement, TResizableElement {
  url: string;
}

export type MediaUrlParser = (url: string) => EmbedUrlData | undefined;

export type MediaPluginRule = {
  parser: MediaUrlParser;
  component?: React.FC<EmbedUrlData>;
};

export interface MediaPlugin {
  isUrl?: (text: string) => boolean;

  /**
   * Transforms the url.
   */
  transformUrl?: (url: string) => string;

  /**
   * List of rules. The first rule that matches the url will be used,
   * i.e. its component will be used to render the media. Used by `MediaEmbed`.
   */
  rules?: MediaPluginRule[];

  disableCaption?: boolean;
}

export const ELEMENT_MEDIA = 'media';
