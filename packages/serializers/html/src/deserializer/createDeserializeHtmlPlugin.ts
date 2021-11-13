import { createPluginFactory } from '@udecode/plate-core';
import { withDeserializeHtml } from './withDeserializeHtml';

export const KEY_DESERIALIZE_HTML = 'deserializeHtml';

/**
 * @see {@link withDeserializeHTML}
 */
export const createDeserializeHtmlPlugin = createPluginFactory({
  key: KEY_DESERIALIZE_HTML,
  withOverrides: withDeserializeHtml(),
});
