import {
  KEY_DESERIALIZE_HTML,
  createPluginFactory,
} from '@udecode/plate-common/server';
import juice from 'juice';

export const KEY_JUICE = 'juice';

export const createJuicePlugin = createPluginFactory({
  inject: {
    pluginsByKey: {
      [KEY_DESERIALIZE_HTML]: {
        editor: {
          insertData: {
            transformData: (data) => {
              // juice ignores the first class when there is <!-- just after <style>, so we remove it
              let newData = data.replaceAll(/<style>\s*<!--/g, '<style>');
              newData = juice(newData);

              return newData;
            },
          },
        },
      },
    },
  },
  key: KEY_JUICE,
});
