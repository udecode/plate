import juice from 'juice';
import { createBasePlugin } from '@platejs/core';
import { KEYS } from '@platejs/utils';

export const JuicePlugin = createBasePlugin({
  key: KEYS.juice,
  editOnly: true,
  parsers: {
    html: {
      transformData: ({ data }) => {
        // juice ignores the first class when there is <!-- just after <style>, so we remove it
        let newData = data.replaceAll(/<style>\s*<!--/g, '<style>');
        newData = juice(newData);

        return newData;
      },
    },
  },
});
