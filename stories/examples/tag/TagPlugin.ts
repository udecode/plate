import { setDefaults } from '@udecode/slate-plugins';
import { SlatePlugin } from '@udecode/slate-plugins-core';
import { DEFAULTS_TAG } from './defaults';
import { deserializeTag } from './deserializeTag';
import { renderElementTag } from './renderElementTag';
import { TagPluginOptions } from './types';

/**
 * Enables support for hypertags.
 */
export const TagPlugin = (options?: TagPluginOptions): SlatePlugin => {
  const { tag } = setDefaults(options, DEFAULTS_TAG);

  return {
    renderElement: renderElementTag(options),
    deserialize: deserializeTag(options),
    inlineTypes: [tag.type],
    voidTypes: [tag.type],
  };
};
