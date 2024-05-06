import type { TElement } from '@udecode/plate-common/server';

export interface TMediaElement extends TElement {
  url: string;
  align?: 'center' | 'left' | 'right';
}

export interface MediaPlugin {
  isUrl?: (text: string) => boolean;

  /** Transforms the url. */
  transformUrl?: (url: string) => string;
}

export const ELEMENT_MEDIA = 'media';
