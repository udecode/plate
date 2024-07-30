import type { WithOverride } from '../types';

import { createPlugin } from '../utils';
import { getInjectedPlugins } from '../utils/getInjectedPlugins';
import { pipeInsertDataQuery } from '../utils/pipeInsertDataQuery';
import { pipeInsertFragment } from '../utils/pipeInsertFragment';
import { pipeTransformData } from '../utils/pipeTransformData';
import { pipeTransformFragment } from '../utils/pipeTransformFragment';

export const withInsertData: WithOverride = (editor) => {
  const { insertData } = editor;

  editor.insertData = (dataTransfer) => {
    const inserted = [...editor.plugins].reverse().some((plugin) => {
      const insertDataOptions = plugin.editor.insertData;

      if (!insertDataOptions) return false;

      const injectedPlugins = getInjectedPlugins(editor, plugin);
      const { format, getFragment } = insertDataOptions;

      if (!format) return false;

      let data = dataTransfer.getData(format);

      if (!data) return;
      if (
        !pipeInsertDataQuery(injectedPlugins, {
          data,
          dataTransfer,
        })
      ) {
        return false;
      }

      data = pipeTransformData(injectedPlugins, {
        data,
        dataTransfer,
      });

      let fragment = getFragment?.({
        data,
        dataTransfer,
      });

      if (!fragment?.length) return false;

      fragment = pipeTransformFragment(injectedPlugins, {
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

export const KEY_INSERT_DATA = 'insertData';

export const InsertDataPlugin = createPlugin({
  key: KEY_INSERT_DATA,
  withOverrides: withInsertData,
});
