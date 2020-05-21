import { getRenderElement } from 'element';
import { MentionElement } from './components';
import { MENTION, MentionRenderElementOptions } from './types';

export const renderElementMention = ({
  typeMention = MENTION,
  component = MentionElement,
  prefix = '@',
}: MentionRenderElementOptions = {}) =>
  getRenderElement({
    type: typeMention,
    component,
    prefix,
  });
