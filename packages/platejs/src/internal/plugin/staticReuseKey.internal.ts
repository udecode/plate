import type { Element, Path } from '../../facade';
import type { AnyBasePlugin, Editor } from '../../lib';
import { getPluginSchemaFamily } from '../utils/mergePlugins';

export type StaticReuseKeyReader = (context: {
  editor: Editor;
  element: Element;
  path: Path;
}) => string | undefined;

const staticReuseKeyByFamily = new WeakMap<object, StaticReuseKeyReader>();

export const withStaticReuseKey = <TPlugin extends AnyBasePlugin>(
  plugin: TPlugin,
  reader: StaticReuseKeyReader
): TPlugin => {
  const family = getPluginSchemaFamily(plugin);

  if (family) {
    staticReuseKeyByFamily.set(family, reader);
  }

  return plugin;
};

export const getStaticReuseKeyReader = (
  plugin: AnyBasePlugin | undefined
): StaticReuseKeyReader | undefined => {
  if (!plugin) return undefined;

  const family = getPluginSchemaFamily(plugin);

  return family ? staticReuseKeyByFamily.get(family) : undefined;
};
