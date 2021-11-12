import { createPlugin } from '@udecode/plate-core';
import { withDeserializeHtml } from './withDeserializeHtml';

export const KEY_DESERIALIZE_HTML = 'deserializeHtml';

/**
 * @see {@link withDeserializeHTML}
 */
export const createDeserializeHtmlPlugin = createPlugin({
  key: KEY_DESERIALIZE_HTML,
  withOverrides: withDeserializeHtml(),
});
