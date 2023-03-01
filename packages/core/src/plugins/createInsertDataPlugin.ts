import { Value } from '../../../slate-utils/src/slate/editor/TEditor';
import { PlateEditor } from '../types/plate/PlateEditor';
import { createPluginFactory } from '../utils/plate/createPluginFactory';
import { getInjectedPlugins } from '../utils/plate/getInjectedPlugins';
import { pipeInsertDataQuery } from '../utils/plate/pipeInsertDataQuery';
import { pipeInsertFragment } from '../utils/plate/pipeInsertFragment';
import { pipeTransformData } from '../utils/plate/pipeTransformData';
import { pipeTransformFragment } from '../utils/plate/pipeTransformFragment';

export const withInsertData = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
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

export const KEY_INSERT_DATA = 'insertData';

export const createInsertDataPlugin = createPluginFactory({
  key: KEY_INSERT_DATA,
  withOverrides: withInsertData,
});
