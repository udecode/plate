import { createSlatePlugin, KEYS } from 'platejs';
import juice from 'juice';

export const JuicePlugin = createSlatePlugin({
  key: KEYS.juice,
  editOnly: true,
  inject: {
    plugins: {
      [KEYS.html]: {
        parser: {
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
});
