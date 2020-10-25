import { getOnHotkeyToggleNodeType } from './getOnHotkeyToggleNodeType';
import { setDefaults } from './setDefaults';

/**
 * Get `onKeyDown` handler for mark with default options.
 */
export const getOnHotkeyToggleNodeTypeDefault = <Key extends string>({
  key,
  defaultOptions,
  options,
}: {
  key: Key;
  defaultOptions: Record<Key, any>;
  options?: any;
}) => {
  const keyOptions = setDefaults(options, defaultOptions)[key];

  return getOnHotkeyToggleNodeType(keyOptions);
};
