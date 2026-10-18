import { getPluginSchemaFamily } from '../utils/mergePlugins';

const firstPartyNames = new WeakMap<object, string>();

export const registerFirstPartyPlugin = (
  plugin: Readonly<{ name: string }>
) => {
  const family = getPluginSchemaFamily(plugin);

  if (!family) {
    throw new Error(
      `First-party plugin "${plugin.name}" must be a nominal plugin descriptor.`
    );
  }

  firstPartyNames.set(family, plugin.name);
};

export const getFirstPartyPluginName = (family: object) =>
  firstPartyNames.get(family);
