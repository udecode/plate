import { getRenderElement, setDefaults } from '@udecode/slate-plugins';
import { DEFAULTS_TAG } from './defaults';
import { TagRenderElementOptions } from './types';

export const renderElementTag = (options?: TagRenderElementOptions) => {
  const { tag } = setDefaults(options, DEFAULTS_TAG);

  return getRenderElement(tag);
};
