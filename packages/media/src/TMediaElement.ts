import { TCaptionElement } from './caption/TCaptionElement';
import { TResizableElement } from './resizable/TResizableElement';

export interface TMediaElement extends TCaptionElement, TResizableElement {
  url: string;
}
