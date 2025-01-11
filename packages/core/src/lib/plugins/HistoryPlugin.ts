import { withHistory } from '@udecode/slate';

import type { SlateEditor } from '../editor';

import { type ExtendEditor, createSlatePlugin } from '../plugin';

export const withPlateHistory: ExtendEditor = ({ editor }) =>
  withHistory(editor as any) as any as SlateEditor;

/** @see {@link withHistory} */
export const HistoryPlugin = createSlatePlugin({
  key: 'history',
  extendEditor: withPlateHistory,
});
