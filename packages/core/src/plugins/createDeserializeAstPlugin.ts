import { createPluginFactory } from '../utils/createPluginFactory';

export const KEY_DESERIALIZE_AST = 'deserializeAst';

/**
 * Enables support for deserializing inserted content from Slate Ast format to Slate format
 * while apply a small bug fix.
 */
export const createDeserializeAstPlugin = createPluginFactory({
  key: KEY_DESERIALIZE_AST,
  editor: {
    insertData: {
      format: 'application/x-slate-fragment',
      getFragment: ({ data }) => {
        const decoded = decodeURIComponent(window.atob(data));
        return JSON.parse(decoded);
      },
    },
  },
});
