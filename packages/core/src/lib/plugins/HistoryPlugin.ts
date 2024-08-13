import { withHistory } from 'slate-history';

import type { PlateEditor } from '../editor';
import type { WithOverride } from '../plugin/types/PlatePlugin';

import { createPlugin } from '../plugin/createPlugin';

export const withPlateHistory: WithOverride = ({ editor }) =>
  withHistory(editor as any) as any as PlateEditor;

/** @see {@link withHistory} */
export const HistoryPlugin = createPlugin({
  key: 'history',
  withOverrides: withPlateHistory,
});
