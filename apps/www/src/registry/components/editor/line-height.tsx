import { BaseLineHeightPlugin, PLUGINS } from 'platejs';

export const LineHeightKit = [
  BaseLineHeightPlugin.configure({
    inject: {
      nodeProps: {
        defaultNodeValue: 1.5,
        validNodeValues: [1, 1.2, 1.5, 2, 3],
      },
    },
    targetPlugins: [PLUGINS.heading, PLUGINS.paragraph],
  }),
] as const;
