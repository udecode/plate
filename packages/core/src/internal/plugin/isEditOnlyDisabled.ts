import type { AnyBasePlugin } from '../../lib/plugin';

const DEFAULT = {
  handlers: true,
  inject: true,
  transformInitialValue: false,
  render: true,
};

/**
 * Check if a plugin feature is disabled in read-only mode based on editOnly
 * configuration.
 *
 * @param plugin The plugin to check
 * @param isReadOnly Whether the editor is in read-only mode
 * @param feature The feature to check ('render' | 'handlers' | 'inject' |
 *   'transformInitialValue')
 * @returns True if the feature should be disabled
 */
export const isEditOnly = (
  readOnly: boolean,
  plugin: Pick<AnyBasePlugin, 'editOnly'>,
  feature: keyof typeof DEFAULT
): boolean => {
  if (!readOnly) return false;

  // If editOnly is true, use the default value for the feature
  if (plugin.editOnly === true) {
    return DEFAULT[feature];
  }

  // If editOnly is an object, use its value if specified, otherwise use default
  if (typeof plugin.editOnly === 'object') {
    if (plugin.editOnly[feature] !== undefined) {
      return plugin.editOnly[feature];
    }

    return DEFAULT[feature];
  }

  return false;
};
