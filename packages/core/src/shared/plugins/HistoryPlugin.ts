import type { TEditor, THistoryEditor, Value } from '@udecode/slate';

import { withHistory } from 'slate-history';

import { createPlugin } from '../utils';

export const KEY_HISTORY = 'history';

export const withTHistory = <
  V extends Value = Value,
  E extends TEditor<V> = TEditor<V>,
  EE extends E = E & THistoryEditor<V>,
>(
  editor: E
) => withHistory(editor as any) as any as EE;

/** @see {@link withHistory} */
export const HistoryPlugin = createPlugin({
  key: KEY_HISTORY,
  withOverrides: withTHistory,
});
