import { moveNodes } from '../slate';
import { Value } from '../slate/editor/TEditor';
import { PluginOptions, WithPlatePlugin } from '../types';
import { PlateEditor } from '../types/plate/PlateEditor';
import { withNormalizeNode } from '../types/plugin/PlatePluginNormalizeNode';
import { createPluginFactory } from '../utils/plate/createPluginFactory';
import { getInjectedPlugins } from '../utils/plate/getInjectedPlugins';
import { pipeInsertDataQuery } from '../utils/plate/pipeInsertDataQuery';
import { pipeInsertFragment } from '../utils/plate/pipeInsertFragment';
import { pipeTransformData } from '../utils/plate/pipeTransformData';
import { pipeTransformFragment } from '../utils/plate/pipeTransformFragment';

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

  editor = withNormalizeNode(editor, plugin) as any;

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

let it = 0;

export const createInsertDataPlugin = createPluginFactory({
  key: KEY_INSERT_DATA,
  withOverrides: withInsertData,
  editor: {
    normalizeNode: (editor) => ({
      maxIterations: 2,
      apply: (entry) => {
        try {
          moveNodes(editor, {
            at: [it],
            to: [it + 1],
          });
          it++;
          if (it > 5) it = 0;
        } catch (err) {}
        return true;
      },
    }),
  },
});
