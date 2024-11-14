import type { TElement } from '@udecode/plate-common';

export interface TMediaElement extends TElement {
  url: string;
  id?: string;
  align?: 'center' | 'left' | 'right';
  isUpload?: boolean;
  name?: string;
  placeholderId?: string;
}

export interface MediaPluginOptions {
  isFloatingOpen?: boolean;
  isUrl?: (text: string) => boolean;
  mediaType?: string | null;

  /** Transforms the url. */
  transformUrl?: (url: string) => string;

  url?: string;
}
