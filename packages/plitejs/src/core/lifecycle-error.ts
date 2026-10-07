import type {
  BaseEditor,
  EditorLifecycleError,
  EditorLifecycleErrorSink,
} from '../interfaces/editor';
import { getEditorRuntimeOwner } from './editor-runtime';

const EDITOR_LIFECYCLE_ERROR_SINKS = new WeakMap<
  BaseEditor,
  (error: unknown) => void
>();

export const setEditorLifecycleErrorSink = <
  TEditor extends BaseEditor<any, any>,
>(
  editor: TEditor,
  sink: EditorLifecycleErrorSink<TEditor> | undefined
) => {
  const owner = getEditorRuntimeOwner(editor);

  if (sink) {
    EDITOR_LIFECYCLE_ERROR_SINKS.set(owner, (error) =>
      Reflect.apply(sink, undefined, [error])
    );
  } else {
    EDITOR_LIFECYCLE_ERROR_SINKS.delete(owner);
  }
};

/** @internal */
export const reportEditorLifecycleError = <
  TEditor extends BaseEditor<any, any>,
>(
  error: EditorLifecycleError<TEditor>
) => {
  const sink = EDITOR_LIFECYCLE_ERROR_SINKS.get(
    getEditorRuntimeOwner(error.editor)
  );

  if (sink) {
    try {
      sink(error);
      return;
    } catch (sinkError) {
      globalThis.console?.error(error, sinkError);
      return;
    }
  }

  const { reportError } = globalThis as {
    reportError?: (error: unknown) => void;
  };

  // A replay failure settles `failed` instead of rejecting; reportError keeps it visible to window error monitors.
  if ('source' in error && error.source === 'history' && reportError) {
    reportError(error.cause);
    return;
  }

  globalThis.console?.error(error);
};
