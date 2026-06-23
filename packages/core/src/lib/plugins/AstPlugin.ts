import { createEditorPlugin } from '../plugin';

/**
 * Enables support for deserializing inserted content from Plite Ast format to
 * Plite format while apply a small bug fix.
 */
export const AstPlugin = createEditorPlugin({
  key: 'ast',
  parser: {
    format: 'application/x-plite-fragment',
    deserialize: ({ data }) => {
      const decoded = decodeURIComponent(window.atob(data));
      let parsed: any;

      try {
        parsed = JSON.parse(decoded);
      } catch {
        /* empty */
      }

      return parsed;
    },
  },
});
