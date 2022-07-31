import { TCaptionElement } from '../caption/index';
import { TResizableElement } from '../resizable/index';
import { EmbedUrlData } from './parseMediaUrl';

export interface TMediaElement extends TCaptionElement, TResizableElement {
  url: string;
}

export interface MediaPluginRule {
  parseUrl: (url: string) => EmbedUrlData;
}

export interface MediaPlugin {
  isUrl?: (text: string) => boolean;

  transformUrl?: (url: string) => string;

  rules?: MediaPluginRule[];
}

export const ELEMENT_MEDIA = 'media';
