import {
  type PluginConfig,
  bindFirst,
  createTSlatePlugin,
} from '@udecode/plate';

import { setFontSize } from './transforms';

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
  parsers: {
    html: {
      deserializer: {
        isLeaf: true,
        rules: [
          {
            validStyle: {
              fontSize: '*',
            },
          },
        ],
        parse: ({ element, type }) => ({ [type]: element.style.fontSize }),
      },
    },
  },
}).extendApi(({ editor }) => ({
  setMark: bindFirst(setFontSize, editor),
}));
