import { getOnHotkeyToggleNodeType } from './getOnHotkeyToggleNodeType';
import { setDefaults } from './setDefaults';

interface GetOnHotkeyToggleNodeTypeDefaultOptions {
  key: string;
  defaultOptions: Record<string, any>;
  options?: any;
}

/**
 * `getOnHotkeyToggleNodeType` with default options.
 */
export const getOnHotkeyToggleNodeTypeDefault = ({
  key,
  defaultOptions,
  options,
}: GetOnHotkeyToggleNodeTypeDefaultOptions) => {
  const keyOptions = setDefaults(options, defaultOptions)[key];

  return getOnHotkeyToggleNodeType(keyOptions);
};
