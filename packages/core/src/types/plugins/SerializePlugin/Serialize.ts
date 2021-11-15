import { RenderElement } from '../../RenderElement';
import { RenderLeaf } from '../../RenderLeaf';

/**
 * HTML Serializer for element and leaf.
 */
export interface Serialize {
  element?: RenderElement;
  leaf?: RenderLeaf;
}
