import { getRenderElement, RenderElementOptions } from 'element';
import { MentionElement } from './components';
import { MENTION } from './types';

export const renderElementMention = ({
  typeMention = MENTION,
  component = MentionElement,
}: RenderElementOptions = {}) =>
  getRenderElement({
    type: typeMention,
    component,
  });
