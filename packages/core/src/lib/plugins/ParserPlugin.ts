import {
  type ExtendEditor,
  createSlatePlugin,
  getEditorPlugin,
} from '../plugin';
import {
  getInjectedPlugins,
  pipeInsertDataQuery,
  pipeInsertFragment,
  pipeTransformData,
  pipeTransformFragment,
} from '../utils';

export const withParser: ExtendEditor = ({ editor }) => {
  const { insertData } = editor;

  editor.insertData = (dataTransfer) => {
    const inserted = [...editor.pluginList].reverse().some((plugin) => {
      const parser = plugin.parser;

      if (!parser) return false;

      const injectedPlugins = getInjectedPlugins(editor, plugin);
      const { deserialize, format, mimeTypes } = parser;

      if (!format) return false;

      // Handle both string and string[] formats
      const formats = Array.isArray(format) ? format : [format];
      const mimeTypeList =
        mimeTypes ||
        formats.map((fmt) => (fmt.includes('/') ? fmt : `text/${fmt}`));

      for (const mimeType of mimeTypeList) {
        let data = dataTransfer.getData(mimeType);

        if (!data) continue;
        if (
          !pipeInsertDataQuery(editor, injectedPlugins, {
            data,
            dataTransfer,
          })
        ) {
          continue;
        }

        data = pipeTransformData(editor, injectedPlugins, {
          data,
          dataTransfer,
        });

        let fragment = deserialize?.({
          ...getEditorPlugin(editor, plugin),
          data,
          dataTransfer,
        });

        if (!fragment?.length) continue;

        fragment = pipeTransformFragment(editor, injectedPlugins, {
          data,
          dataTransfer,
          fragment,
        });

        if (fragment.length === 0) continue;

        pipeInsertFragment(editor, injectedPlugins, {
          data,
          dataTransfer,
          fragment,
        });

        return true;
      }

      return false;
    });

    if (inserted) return;

    insertData(dataTransfer);
  };

  return editor;
};

export const ParserPlugin = createSlatePlugin({
  key: 'parser',
  extendEditor: withParser,
});
