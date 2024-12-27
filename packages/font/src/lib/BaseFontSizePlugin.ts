import {
  type PluginConfig,
  bindFirst,
  createTSlatePlugin,
} from '@udecode/plate-common';

import { setFontSize } from './utils';

export type BaseFontSizeConfig = PluginConfig<
  'fontSize',
  {},
  {
    fontSize: {
      setMark: (fontSize: string) => void;
    };
  }
>;

export const BaseFontSizePlugin = createTSlatePlugin({
  key: 'fontSize',
  inject: {
    nodeProps: {
      nodeKey: 'fontSize',
    },
  },
})
  .extend(({ type }) => ({
    parsers: {
      html: {
        deserializer: {
          isLeaf: true,
          parse: ({ element }) => ({ [type]: element.style.fontSize }),
          rules: [
            {
              validStyle: {
                fontSize: '*',
              },
            },
          ],
        },
      },
    },
  }))
  .extendApi(({ editor }) => ({
    setMark: bindFirst(setFontSize, editor),
  }));
