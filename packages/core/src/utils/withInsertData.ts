import { WithOverride } from '../types/plugins/WithOverride';
import { getInjectedPlugins } from './getInjectedPlugins';
import { isPluginDisabled } from './isPluginDisabled';
import { pipeInsertFragment } from './pipeInsertFragment';
import { pipeTransformData } from './pipeTransformData';
import { pipeTransformFragment } from './pipeTransformFragment';

export const withInsertData: WithOverride = (editor) => {
  const { insertData } = editor;

  editor.insertData = (dataTransfer) => {
    const inserted = editor.plugins.some((plugin) => {
      const insertDataOptions = plugin.editor.insertData;
      if (!insertDataOptions) return false;

      const injectedPlugins = getInjectedPlugins(editor, plugin);

      const isDisabled = isPluginDisabled(injectedPlugins);
      if (isDisabled) return false;

      const { format, getFragment, query } = insertDataOptions;
      if (!format) return false;

      let data = dataTransfer.getData(format);
      if (!data) return;

      data = pipeTransformData(injectedPlugins, {
        data,
        dataTransfer,
      });

      if (
        query &&
        !query(editor, plugin, {
          data,
          dataTransfer,
        })
      ) {
        return false;
      }

      let fragment = getFragment?.(editor, plugin, {
        data,
        dataTransfer,
      });
      if (!fragment?.length) return false;

      fragment = pipeTransformFragment(injectedPlugins, {
        fragment,
        data,
        dataTransfer,
      });
      if (!fragment.length) return false;

      pipeInsertFragment(editor, injectedPlugins, {
        fragment,
        data,
        dataTransfer,
      });

      return true;
    });
    if (inserted) return;

    insertData(dataTransfer);
  };

  return editor;
};
