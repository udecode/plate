import {
  DeserializeHtmlPlugin,
  createSlatePlugin,
} from '@udecode/plate-common';
import juice from 'juice';

export const JuicePlugin = createSlatePlugin({
  inject: {
    plugins: {
      [DeserializeHtmlPlugin.key]: {
        editor: {
          insertData: {
            transformData: ({ data }) => {
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
  key: 'juice',
});
