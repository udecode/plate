import { Editor } from 'slate';
import { DeserializeNode } from './DeserializeNode';

/**
 * HTML Deserializer for element and leaf
 */
export type DeserializeHtml = (
  editor: Editor
) => {
  element?: DeserializeNode[];
  leaf?: DeserializeNode[];
};
