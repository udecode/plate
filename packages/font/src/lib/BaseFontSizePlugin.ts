import {
  type PluginConfig,
  bindFirst,
  createTSlatePlugin,
} from '@udecode/plate-common';

import { type getChangedFontSizeOptions, setChangedFontSize } from './utils';

export type BaseFontSizeConfig = PluginConfig<
  'fontSize',
  FontSizeSelectors,
  {
    fontSize: {
      setChangedFontSize: (options: getChangedFontSizeOptions) => void;
    };
  }
>;

type FontSizeSelectors = {};

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
    setChangedFontSize: bindFirst(setChangedFontSize, editor),
  }));
