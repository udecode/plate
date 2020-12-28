import { getRenderLeaf } from './getRenderLeaf';
import { setDefaults } from './setDefaults';

/**
 * Get a `renderLeaf` handler for a single type, with default options.
 */
export const getRenderLeafDefault = <Key extends string>({
  key,
  defaultOptions,
  options,
}: {
  key: Key;
  defaultOptions: Record<Key, any>;
  options?: any;
}) => {
  const keyOptions = setDefaults(options, defaultOptions)[key];

  return getRenderLeaf(keyOptions);
};
