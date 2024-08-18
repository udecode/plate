import { withHistory } from 'slate-history';

import type { SlateEditor } from '../editor';
import type { WithOverride } from '../plugin/SlatePlugin';

import { createSlatePlugin } from '../plugin/createSlatePlugin';

export const withPlateHistory: WithOverride = ({ editor }) =>
  withHistory(editor as any) as any as SlateEditor;

/** @see {@link withHistory} */
export const HistoryPlugin = createSlatePlugin({
  key: 'history',
  withOverrides: withPlateHistory,
});
