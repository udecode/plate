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

  globalThis.console?.error(error);
};
