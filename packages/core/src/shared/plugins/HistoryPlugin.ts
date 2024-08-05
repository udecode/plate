import { withHistory } from 'slate-history';

import type { PlateEditor, WithOverride } from '../types';

import { createPlugin } from '../utils';

export const KEY_HISTORY = 'history';

export const withPlateHistory: WithOverride = ({ editor }) =>
  withHistory(editor as any) as any as PlateEditor;

/** @see {@link withHistory} */
export const HistoryPlugin = createPlugin({
  key: KEY_HISTORY,
  withOverrides: withPlateHistory,
});
