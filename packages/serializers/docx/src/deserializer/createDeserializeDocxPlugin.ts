import { createPluginFactory } from '@udecode/plate-core';
import { withDeserializeDocx } from './withDeserializeDocx';

export const KEY_DESERIALIZE_DOCX = 'deserializeDocs';

/**
 * @see {@link withDeserializeDocx}
 */
export const createDeserializeDocxPlugin = createPluginFactory({
  key: KEY_DESERIALIZE_DOCX,
  withOverrides: withDeserializeDocx,
});
