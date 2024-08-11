import { createPlugin } from '../plugin';

export const KEY_DESERIALIZE_AST = 'deserializeAst';

/**
 * Enables support for deserializing inserted content from Slate Ast format to
 * Slate format while apply a small bug fix.
 */
export const DeserializeAstPlugin = createPlugin({
  editor: {
    insertData: {
      format: 'application/x-slate-fragment',
      getFragment: ({ data }) => {
        const decoded = decodeURIComponent(window.atob(data));
        let parsed;

        try {
          parsed = JSON.parse(decoded);
        } catch (error) {
          /* empty */
        }

        return parsed;
      },
    },
  },
  key: KEY_DESERIALIZE_AST,
});
