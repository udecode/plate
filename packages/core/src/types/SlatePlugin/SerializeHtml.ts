import { RenderElement } from './RenderElement';
import { RenderLeaf } from './RenderLeaf';

/**
 * HTML Serializer for element and leaf
 */
export interface SerializeHtml {
  element?: ReturnType<RenderElement>;
  leaf?: ReturnType<RenderLeaf>;
}
