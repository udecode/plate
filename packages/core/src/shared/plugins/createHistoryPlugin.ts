import type { TEditor, THistoryEditor, Value } from '@udecode/slate';

import { withHistory } from 'slate-history';

import { createPluginFactory } from '../utils/createPluginFactory';

export const HISTORY_KEY = 'history';

export const withTHistory = <
  V extends Value = Value,
  E extends TEditor<V> = TEditor<V>,
  EE extends E = E & THistoryEditor<V>,
>(
  editor: E
) => withHistory(editor as any) as any as EE;

/** @see {@link withHistory} */
export const createHistoryPlugin = createPluginFactory({
  key: HISTORY_KEY,
  withOverrides: withTHistory,
});
