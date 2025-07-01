import { CopyPlugin } from './CopyPlugin';

export type GetStaticPluginsOptions = {
  /** Enable copy plugin. */
  copyPlugin?: boolean;
};

export const getStaticPlugins = ({
  copyPlugin = true,
}: GetStaticPluginsOptions) => {
  const staticPlugins = [CopyPlugin.configure({ enabled: copyPlugin })];

  return [...staticPlugins];
};
