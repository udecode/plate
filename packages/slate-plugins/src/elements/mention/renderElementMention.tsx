import { getRenderElement } from '../utils';
import { MentionElement } from './components';
import { MENTION } from './types';

export const renderElementMention = getRenderElement({
  type: MENTION,
  component: MentionElement,
});
