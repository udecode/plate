import { pipeInsertFragment } from '../../internal/plugin/pipeInsertFragment';
import { pipeTransformData } from '../../internal/plugin/pipeTransformData';
import { pipeTransformFragment } from '../../internal/plugin/pipeTransformFragment';
import { createSlatePlugin, getEditorPlugin } from '../plugin';
import { getInjectedPlugins } from '../utils';
import { pipeInsertDataQuery } from '../utils/pipeInsertDataQuery';

export const ParserPlugin = createSlatePlugin({
  key: 'parser',
}).overrideEditor(({ editor, tf: { insertData } }) => ({
  transforms: {
    insertData(dataTransfer: DataTransfer) {
      const inserted = [...editor.meta.pluginList].reverse().some((plugin) => {
        const parser = plugin.parser;

        if (!parser) return false;

        const injectedPlugins = getInjectedPlugins(editor, plugin);
        const { deserialize, format, mimeTypes } = parser;

        if (!format && !mimeTypes) return false;

        // Handle both string and string[] formats
        const formats = format && (Array.isArray(format) ? format : [format]);
        const mimeTypeList =
          mimeTypes ||
          formats.map((fmt) => (fmt.includes('/') ? fmt : `text/${fmt}`));

        for (const mimeType of mimeTypeList) {
          let data = dataTransfer.getData(mimeType);

          if (
            (mimeType !== 'Files' && !data) ||
            (mimeType === 'Files' && dataTransfer.files.length === 0)
          )
            continue;
          if (
            !pipeInsertDataQuery(editor, injectedPlugins, {
              data,
              dataTransfer,
              mimeType,
            })
          ) {
            continue;
          }

          data = pipeTransformData(editor, injectedPlugins, {
            data,
            dataTransfer,
            mimeType,
          });

          let fragment = deserialize?.({
            ...getEditorPlugin(editor, plugin),
            data,
            dataTransfer,
            mimeType,
          });

          if (!fragment?.length) continue;

          fragment = pipeTransformFragment(editor, injectedPlugins, {
            data,
            dataTransfer,
            fragment,
            mimeType,
          });

          if (fragment.length === 0) continue;

          pipeInsertFragment(editor, injectedPlugins, {
            data,
            dataTransfer,
            fragment,
            mimeType,
          });

          return true;
        }

        return false;
      });

      if (inserted) return;

      insertData(dataTransfer);
    },
  },
}));
