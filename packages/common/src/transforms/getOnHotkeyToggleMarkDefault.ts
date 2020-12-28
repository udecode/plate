import { setDefaults } from '../utils/setDefaults';
import { getOnHotkeyToggleMark } from './getOnHotkeyToggleMark';

/**
 * Get `onKeyDown` handler for mark with default options.
 */
export const getOnHotkeyToggleMarkDefault = <Key extends string>({
  key,
  defaultOptions,
  options,
}: {
  key: Key;
  defaultOptions: Record<Key, any>;
  options?: any;
}) => {
  const keyOptions = setDefaults(options, defaultOptions)[key];

  return getOnHotkeyToggleMark(keyOptions);
};
