import { SlatePlugin } from 'slate-react';
import { renderElementMention } from './renderElementMention';

export const MentionPlugin = (): SlatePlugin => ({
  renderElement: renderElementMention(),
});
