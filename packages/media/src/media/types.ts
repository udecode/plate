import { TElement } from '@udecode/plate-common';

export interface TMediaElement extends TElement {
  url: string;
  align?: 'left' | 'center' | 'right';
}

export interface MediaPlugin {
  isUrl?: (text: string) => boolean;

  /**
   * Transforms the url.
   */
  transformUrl?: (url: string) => string;
}

export const ELEMENT_MEDIA = 'media';
