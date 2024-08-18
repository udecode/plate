import {
  type WithOverride,
  createSlatePlugin,
  getSlatePluginContext,
} from '../plugin';
import {
  getInjectedPlugins,
  pipeInsertDataQuery,
  pipeInsertFragment,
  pipeTransformData,
  pipeTransformFragment,
} from '../utils';

export const withInsertData: WithOverride = ({ editor }) => {
  const { insertData } = editor;

  editor.insertData = (dataTransfer) => {
    const inserted = [...editor.pluginList].reverse().some((plugin) => {
      const insertDataOptions = plugin.editor.insertData;

      if (!insertDataOptions) return false;

      const injectedPlugins = getInjectedPlugins(editor, plugin);
      const { format, getFragment } = insertDataOptions;

      if (!format) return false;

      let data = dataTransfer.getData(format);

      if (!data) return;
      if (
        !pipeInsertDataQuery(editor, injectedPlugins, {
          data,
          dataTransfer,
        })
      ) {
        return false;
      }

      data = pipeTransformData(editor, injectedPlugins, {
        data,
        dataTransfer,
      });

      let fragment = getFragment?.({
        ...getSlatePluginContext(editor, plugin),
        data,
        dataTransfer,
      });

      if (!fragment?.length) return false;

      fragment = pipeTransformFragment(editor, injectedPlugins, {
        data,
        dataTransfer,
        fragment,
      });

      if (fragment.length === 0) return false;

      pipeInsertFragment(editor, injectedPlugins, {
        data,
        dataTransfer,
        fragment,
      });

      return true;
    });

    if (inserted) return;

    insertData(dataTransfer);
  };

  return editor;
};

export const InsertDataPlugin = createSlatePlugin({
  key: 'insertData',
  withOverrides: withInsertData,
});
