import juice from 'juice';

import { defineBasePlugin, PLUGINS } from '../../core';

export const JuicePlugin = defineBasePlugin(PLUGINS.juice, {
  editOnly: true,
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/html': {
        transformData: ({ data }) => {
          // juice ignores the first class when there is <!-- just after <style>, so we remove it
          let newData = data.replaceAll(/<style>\s*<!--/g, '<style>');
          newData = juice(newData);
          return newData;
        },
      },
    }),
});
