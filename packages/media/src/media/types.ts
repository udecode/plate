import { TCaptionElement } from '../caption/index';
import { TResizableElement } from '../resizable/index';

export interface TMediaElement extends TCaptionElement, TResizableElement {
  url: string;
}

export interface MediaPlugin {
  isUrl?: (text: string) => boolean;

  transformUrl?: (url: string) => string;
}

export const ELEMENT_MEDIA = 'media';
