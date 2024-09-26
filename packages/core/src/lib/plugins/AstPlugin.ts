import { createSlatePlugin } from '../plugin';

/**
 * Enables support for deserializing inserted content from Slate Ast format to
 * Slate format while apply a small bug fix.
 */
export const AstPlugin = createSlatePlugin({
  key: 'ast',
  parser: {
    deserialize: ({ data }) => {
      const decoded = decodeURIComponent(window.atob(data));
      let parsed;

      try {
        parsed = JSON.parse(decoded);
      } catch {
        /* empty */
      }

      return parsed;
    },
    format: 'application/x-slate-fragment',
  },
});
