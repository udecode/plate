import { Value } from '@udecode/slate';

import { PlateEditor } from '../types/PlateEditor';
import { createPluginFactory } from '../utils/createPluginFactory';
import { getInjectedPlugins } from '../utils/getInjectedPlugins';
import { pipeInsertDataQuery } from '../utils/pipeInsertDataQuery';
import { pipeInsertFragment } from '../utils/pipeInsertFragment';
import { pipeTransformData } from '../utils/pipeTransformData';
import { pipeTransformFragment } from '../utils/pipeTransformFragment';

export const withInsertData = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(
  editor: E
) => {
  const { insertData } = editor;

  editor.insertData = (dataTransfer) => {
    const inserted = [...editor.plugins].reverse().some((plugin) => {
      const insertDataOptions = plugin.editor.insertData;
      if (!insertDataOptions) return false;

      const injectedPlugins = getInjectedPlugins<{}, V>(editor, plugin);
      const { format, getFragment } = insertDataOptions;
      if (!format) return false;

      let data = dataTransfer.getData(format);
      if (!data) return;

      if (
        !pipeInsertDataQuery<{}, V>(injectedPlugins, {
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
        fragment,
        data,
        dataTransfer,
      });
      if (fragment.length === 0) return false;

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

export const KEY_INSERT_DATA = 'insertData';

export const createInsertDataPlugin = createPluginFactory({
  key: KEY_INSERT_DATA,
  withOverrides: withInsertData,
});
