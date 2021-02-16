import { RenderElement } from './RenderElement';
import { RenderLeaf } from './RenderLeaf';

export interface SerializeHtml {
  element?: RenderElement;
  leaf?: RenderLeaf;
}
