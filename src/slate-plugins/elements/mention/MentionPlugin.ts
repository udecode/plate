import { SlatePlugin } from 'slate-plugins/types';
import { renderElementMention } from './renderElementMention';

export const MentionPlugin = (): SlatePlugin => ({
  renderElement: renderElementMention(),
});
