import castArray from 'lodash/castArray';
import { Editor } from 'slate';
import { getOnHotkeyToggleNodeType } from './getOnHotkeyToggleNodeType';
import { setDefaults } from './setDefaults';

interface GetOnHotkeyToggleNodeTypeDefaultOptions {
  key: string | string[];
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
  const keys = castArray(key);
  return (e: any, editor: Editor) => {
    keys.forEach((keyItem) => {
      const keyOptions = setDefaults(options, defaultOptions)[keyItem];
      return getOnHotkeyToggleNodeType(keyOptions)?.(e, editor);
    });
  };
};
