import { SlatePlugin } from 'slate-react';
import { renderElementMention } from './renderElementMention';
import { withMention } from './withMention';

export const MentionPlugin = (): SlatePlugin => ({
  editor: withMention,
  renderElement: renderElementMention(),
});
