import { SlatePlugin } from 'slate-react';
import { withShortcuts } from './withShortcuts';

export const MarkdownShortcutsPlugin = (): SlatePlugin => ({
  editor: withShortcuts,
});
