import { createEditorPlugin, KEYS } from 'platejs';

export const BaseHorizontalRulePlugin = createEditorPlugin({
  key: KEYS.hr,
  node: { isElement: true, isVoid: true },
  parsers: {
    html: {
      deserializer: {
        rules: [
          {
            validNodeName: 'HR',
          },
        ],
      },
    },
  },
  render: { as: 'hr' },
});
