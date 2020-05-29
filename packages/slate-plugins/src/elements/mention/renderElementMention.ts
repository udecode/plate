import { getRenderElement } from '../../element/utils';
import { MentionElement } from './components';
import { MENTION, MentionRenderElementOptions } from './types';

export const renderElementMention = ({
  typeMention = MENTION,
  component = MentionElement,
  prefix = '@',
  onClick,
}: MentionRenderElementOptions = {}) =>
  getRenderElement({
    type: typeMention,
    component,
    prefix,
    onClick,
  });
