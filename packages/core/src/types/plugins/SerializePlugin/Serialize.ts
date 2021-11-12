import { RenderElement } from '../PlatePlugin/RenderElement';
import { RenderLeaf } from '../PlatePlugin/RenderLeaf';

/**
 * HTML Serializer for element and leaf.
 */
export interface Serialize {
  element?: RenderElement;
  leaf?: RenderLeaf;
}
