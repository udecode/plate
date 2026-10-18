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

type SourcedLifecycleError = Extract<
  EditorLifecycleError<unknown>,
  { source: string }
>;

const describeSource: {
  [TSource in SourcedLifecycleError['source']]: (
    error: Extract<SourcedLifecycleError, { source: TSource }>
  ) => string;
} = {
  'data-transfer-format': (error) =>
    `data-transfer-format ${error.phase} failed in plugin "${error.pluginName}" for MIME type "${error.mimeType}" and key "${error.key}"`,
  'external-text': (error) => `external-text ${error.phase} failed`,
  history: (error) => `history ${error.phase} failed on ${error.direction}`,
  pagination: (error) => `pagination ${error.phase} failed`,
  'render-element': (error) => `render-element ${error.phase} check failed`,
};

const describeCause = (cause: unknown) => {
  try {
    return String(cause instanceof Error ? cause.message : cause);
  } catch {
    return 'a value that cannot be converted to a string';
  }
};

const describeFailingPart = (error: EditorLifecycleError<unknown>): string => {
  if (!('source' in error)) {
    return `plugin ${error.phase} failed in plugin "${error.pluginName}"`;
  }

  return (
    describeSource[error.source] as (error: SourcedLifecycleError) => string
  )(error);
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

  const { cause } = error;
  const reported = new Error(
    `Editor ${describeFailingPart(error)}: ${describeCause(cause)}`,
    { cause }
  );
  const { reportError } = globalThis as {
    reportError?: (error: unknown) => void;
  };

  if (reportError) {
    reportError(reported);
  } else {
    globalThis.console?.error(reported);
  }
};
