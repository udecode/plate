import type { BaseEditor } from '../editor';
import type { ParserOptions } from '../plugin/SlatePlugin';
import type { AnyBasePlugin } from '../plugin/BasePlugin';

import { getEditorPlugin } from '../plugin';

/** Is the plugin disabled by another plugin. */
export const pipeInsertDataQuery = (
  editor: BaseEditor,
  plugins: Partial<AnyBasePlugin>[],
  options: ParserOptions
) =>
  plugins.every((p) => {
    const query = p.parser?.query;

    return (
      !query ||
      query({
        ...getEditorPlugin(editor, p as any),
        ...options,
      })
    );
  });
