import { TCaptionElement } from '../caption/index';
import { TResizableElement } from '../resizable/index';

export interface TMediaElement extends TCaptionElement, TResizableElement {
  url: string;
}

export interface MediaPlugin {
  isUrl?: (text: string) => boolean;

  /**
   * Transforms the url.
   */
  transformUrl?: (url: string) => string;

  disableCaption?: boolean;
}

export const ELEMENT_MEDIA = 'media';
