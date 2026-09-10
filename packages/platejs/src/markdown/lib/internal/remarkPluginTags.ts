// Function identity keeps capabilities separate from mutable plugin names.
const tags = new WeakMap<object, string>();

export const getRemarkPluginTag = (plugin: object) => tags.get(plugin);

export const setRemarkPluginTag = (plugin: object, tag: string) => {
  tags.set(plugin, tag);
};
