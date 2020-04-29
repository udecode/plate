import { RenderElementOptions } from 'elements/types';
import { getRenderElement } from '../utils';
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
