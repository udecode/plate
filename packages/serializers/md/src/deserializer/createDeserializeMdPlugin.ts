import { createPluginFactory } from '@udecode/plate-core';
import { deserializeMd } from './utils';
import { withDeserializeMd } from './withDeserializeMd';

export const KEY_DESERIALIZE_MD = 'deserializeMd';

/**
 * @see {@link withDeserializeMd}
 */
export const createDeserializeMdPlugin = createPluginFactory({
  key: KEY_DESERIALIZE_MD,
  withOverrides: withDeserializeMd,
});
