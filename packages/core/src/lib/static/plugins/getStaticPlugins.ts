import { ViewPlugin } from './ViewPlugin';

export const getStaticPlugins = () => {
  const staticPlugins = [ViewPlugin];

  return [...staticPlugins];
};
