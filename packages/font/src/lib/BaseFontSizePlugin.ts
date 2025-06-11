import { type PluginConfig, createTSlatePlugin, KEYS } from 'platejs';

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
  key: KEYS.fontSize,
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
}).extendTransforms(({ editor }) => ({
  addMark: (value: string) => {
    editor.tf.addMarks({
      [KEYS.fontSize]: value,
    });
  },
}));
