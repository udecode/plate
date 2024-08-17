import { withHistory } from 'slate-history';

import type { SlateEditor } from '../editor';
import type { WithOverride } from '../plugin/SlatePlugin';

import { createPlugin } from '../plugin/createPlugin';

export const withPlateHistory: WithOverride = ({ editor }) =>
  withHistory(editor as any) as any as SlateEditor;

/** @see {@link withHistory} */
export const HistoryPlugin = createPlugin({
  key: 'history',
  withOverrides: withPlateHistory,
});
