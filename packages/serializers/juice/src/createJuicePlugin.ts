import { createPluginFactory, KEY_DESERIALIZE_HTML } from '@udecode/plate-core';
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
              return juice(data);
            },
          },
        },
      },
    },
  },
});
