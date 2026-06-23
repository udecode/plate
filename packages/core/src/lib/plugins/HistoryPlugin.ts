import { type ExtendEditor, createSlatePlugin } from '../plugin';
import { withCurrentRuntimeHistory } from '../../internal/currentRuntimeBridge';

export const withPlateHistory: ExtendEditor = ({ editor }) => {
  withCurrentRuntimeHistory(
    editor as unknown as Parameters<typeof withCurrentRuntimeHistory>[0]
  );

  const runtimeEditor = editor as unknown as {
    api: {
      history?: {
        isMerging: () => boolean | undefined;
        isSaving: () => boolean | undefined;
        withMerging: (fn: () => void) => void;
        withNewBatch: (fn: () => void) => void;
        withoutMerging: (fn: () => void) => void;
        withoutSaving: (fn: () => void) => void;
      };
      isMerging: () => boolean | undefined;
      isSaving: () => boolean | undefined;
    };
    tf: {
      withMerging: (fn: () => void) => void;
      withNewBatch: (fn: () => void) => void;
      withoutMerging: (fn: () => void) => void;
      withoutSaving: (fn: () => void) => void;
    };
  };

  runtimeEditor.api.history = {
    isMerging: runtimeEditor.api.isMerging,
    isSaving: runtimeEditor.api.isSaving,
    withMerging: runtimeEditor.tf.withMerging,
    withNewBatch: runtimeEditor.tf.withNewBatch,
    withoutMerging: runtimeEditor.tf.withoutMerging,
    withoutSaving: runtimeEditor.tf.withoutSaving,
  };

  return editor;
};

export const HistoryPlugin = createSlatePlugin({
  key: 'history',
  extendEditor: withPlateHistory,
});
