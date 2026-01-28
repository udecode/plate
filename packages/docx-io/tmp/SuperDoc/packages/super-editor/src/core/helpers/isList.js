import { getExtensionConfigField } from './getExtensionConfigField.js';
import { callOrGet } from '../utilities/callOrGet.js';

/**
 * Check if node is a list.
 * @param name Node name.
 * @param extensions Array of extensions.
 */
export const isList = (name, extensions) => {
  const nodeExtensions = extensions.filter((e) => e.type === 'node');
  const extension = nodeExtensions.find((i) => i.name === name);
  if (!extension) return false;

  const context = {
    name: extension.name,
    options: extension.options,
    storage: extension.storage,
  };
  const group = callOrGet(getExtensionConfigField(extension, 'group', context));
  if (typeof group !== 'string') return false;

  return group.split(' ').includes('list');
};
