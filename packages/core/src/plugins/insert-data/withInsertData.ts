import { Value } from '@udecode/slate';
import { PlateEditor, PluginOptions, WithPlatePlugin } from '../../types';
import {
  getInjectedPlugins,
  pipeInsertDataQuery,
  pipeInsertFragment,
  pipeTransformData,
  pipeTransformFragment,
} from '../../utils/index';

export const withInsertData = <
  P = PluginOptions,
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  editor: E,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  plugin: WithPlatePlugin<P, V, E>
) => {
  const { insertData } = editor;

  editor.insertData = (dataTransfer) => {
    const inserted = [...editor.plugins].reverse().some((p) => {
      const insertDataOptions = p.editor.insertData;
      if (!insertDataOptions) return false;

      const injectedPlugins = getInjectedPlugins<{}, V>(editor, p);
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
