import type { SlateEditor } from '../editor';
import type { ParserOptions } from '../plugin/BasePlugin';
import type { AnyEditorPlugin } from '../plugin/SlatePlugin';

import { getEditorPlugin } from '../plugin';

/** Is the plugin disabled by another plugin. */
export const pipeInsertDataQuery = (
  editor: SlateEditor,
  plugins: Partial<AnyEditorPlugin>[],
  { data, dataTransfer }: ParserOptions
) =>
  plugins.every((p) => {
    const query = p.parser?.query;

    return (
      !query ||
      query({
        ...getEditorPlugin(editor, p as any),
        data,
        dataTransfer,
      })
    );
  });
