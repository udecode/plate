import { getRenderElement } from 'element';
import { getMentionElement } from './components';
import { MENTION, MentionRenderElementOptions } from './types';

export const renderElementMention = (
  options: Partial<MentionRenderElementOptions> = {}
) => {
  const {
    typeMention = MENTION,
    component = getMentionElement(options.onClick),
  } = options;
  return getRenderElement({
    type: typeMention,
    component,
  });
};
