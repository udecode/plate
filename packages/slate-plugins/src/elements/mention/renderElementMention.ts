import { getRenderElement } from '../../common/utils/getRenderElement';
import { setDefaults } from '../../common/utils/setDefaults';
import { DEFAULTS_MENTION } from './defaults';
import { MentionRenderElementOptions } from './types';

export const renderElementMention = (options?: MentionRenderElementOptions) => {
  const { mention } = setDefaults(options, DEFAULTS_MENTION);

  return getRenderElement(mention);
};
