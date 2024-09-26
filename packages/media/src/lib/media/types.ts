import type { TElement } from '@udecode/plate-common';

export interface TMediaElement extends TElement {
  url: string;
  id?: string;
  align?: 'center' | 'left' | 'right';
  isUpload?: boolean;
  name?: string;
}

export interface MediaPluginOptions {
  isUrl?: (text: string) => boolean;

  /** Transforms the url. */
  transformUrl?: (url: string) => string;
}
