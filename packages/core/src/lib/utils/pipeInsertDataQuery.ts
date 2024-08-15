import type { PlateEditor } from '../editor';
import type {
  AnyEditorPlugin,
  PlatePluginInsertDataOptions,
} from '../plugin/types/PlatePlugin';

import { getPluginContext } from '../plugin';

/** Is the plugin disabled by another plugin. */
export const pipeInsertDataQuery = (
  editor: PlateEditor,
  plugins: Partial<AnyEditorPlugin>[],
  { data, dataTransfer }: PlatePluginInsertDataOptions
) =>
  plugins.every((p) => {
    const query = p.editor?.insertData?.query;

    return (
      !query ||
      query({
        ...getPluginContext(editor, p as any),
        data,
        dataTransfer,
      })
    );
  });
