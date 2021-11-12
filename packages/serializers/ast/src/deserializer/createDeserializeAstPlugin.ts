import { createPlugin } from '@udecode/plate-core';
import { withDeserializeAst } from './withDeserializeAst';

export const KEY_DESERIALIZE_AST = 'deserializeAst';

/**
 * @see {@link withDeserializeAst}
 */
export const createDeserializeAstPlugin = createPlugin({
  key: KEY_DESERIALIZE_AST,
  withOverrides: withDeserializeAst(),
});
