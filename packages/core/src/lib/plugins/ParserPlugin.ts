import { pipeInsertFragment } from '../../internal/plugin/pipeInsertFragment';
import { pipeTransformData } from '../../internal/plugin/pipeTransformData';
import { pipeTransformFragment } from '../../internal/plugin/pipeTransformFragment';
import { createBasePlugin } from '../plugin';
import { getEditorPlugin } from '../plugin/getEditorPlugin';
import { getInjectedPlugins } from '../utils/getInjectedPlugins';
import { pipeInsertDataQuery } from '../utils/pipeInsertDataQuery';

export const ParserPlugin = createBasePlugin({
  key: 'parser',
}).extendExtension(({ editor }) => ({
  clipboard: {
    insertData(dataTransfer, { next, tx }) {
      const inserted = [...editor.runtime.pluginList]
        .reverse()
        .some((plugin) => {
          const parser = plugin.parser;

          if (!parser) return false;

          const { deserialize, format, mimeTypes } = parser;

          if (!format && !mimeTypes) return false;

          const formats = Array.isArray(format)
            ? format
            : format
              ? [format]
              : [];
          const mimeTypeList =
            mimeTypes ||
            formats.map((format) =>
              format.includes('/') ? format : `text/${format}`
            );

          const injectedPlugins = getInjectedPlugins(editor, plugin);

          for (const mimeType of mimeTypeList) {
            let data = dataTransfer.getData(mimeType);

            if (
              (mimeType !== 'Files' && !data) ||
              (mimeType === 'Files' && (dataTransfer.files?.length ?? 0) === 0)
            ) {
              continue;
            }

            const parserOptions = { data, dataTransfer, mimeType };

            if (!pipeInsertDataQuery(editor, injectedPlugins, parserOptions)) {
              continue;
            }

            data = pipeTransformData(editor, injectedPlugins, parserOptions);

            let fragment = deserialize?.({
              ...getEditorPlugin(editor, plugin),
              ...parserOptions,
              data,
            });

            if (!fragment?.length) continue;

            fragment = pipeTransformFragment(editor, injectedPlugins, {
              ...parserOptions,
              data,
              fragment,
            });

            if (fragment.length === 0) continue;

            pipeInsertFragment(editor, tx, injectedPlugins, {
              ...parserOptions,
              data,
              fragment,
            });

            return true;
          }

          return false;
        });

      if (inserted) return true;
      if (next()) return true;

      const text = dataTransfer.getData('text/plain');

      if (!text) return false;

      tx.text.insert(text);

      return true;
    },
  },
}));
