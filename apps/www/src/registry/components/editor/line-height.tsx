import { BaseLineHeightPlugin, PLUGINS } from 'platejs';

export const LineHeightKit = [
  BaseLineHeightPlugin.configure({
    targetPlugins: [PLUGINS.heading, PLUGINS.paragraph],
  }),
] as const;
