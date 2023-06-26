import {
  createPluginFactory,
  KEY_DESERIALIZE_HTML,
} from '@udecode/plate-common';
import juice from 'juice';

export const KEY_JUICE = 'juice';

export const createJuicePlugin = createPluginFactory({
  key: KEY_JUICE,
  inject: {
    pluginsByKey: {
      [KEY_DESERIALIZE_HTML]: {
        editor: {
          insertData: {
            transformData: (data) => {
              // juice ignores the first class when there is <!-- just after <style>, so we remove it
              let newData = data.replaceAll(/<style>(\s*)<!--/g, '<style>');
              newData = juice(newData);
              return newData;
            },
          },
        },
      },
    },
  },
});
