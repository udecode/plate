import { type ExtendEditor, createEditorPlugin } from '../plugin';
import { withCurrentRuntimeHistory } from '../../internal/currentRuntimeBridge';

export const withPlateHistory: ExtendEditor = ({ editor }) => {
  withCurrentRuntimeHistory(
    editor as unknown as Parameters<typeof withCurrentRuntimeHistory>[0]
  );

  return editor;
};

export const HistoryPlugin = createEditorPlugin({
  key: 'history',
  extendEditor: withPlateHistory,
});
