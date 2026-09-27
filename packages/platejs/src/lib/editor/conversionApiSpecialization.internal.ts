import type { ContentSlice, EditorDocumentValue, Value } from '../../facade';

type SpecializeConversionResult<TResult, V extends Value> =
  TResult extends Readonly<{
    document: EditorDocumentValue;
    ok: true;
  }>
    ? Omit<TResult, 'document'> & Readonly<{ document: EditorDocumentValue<V> }>
    : TResult extends Readonly<{ ok: true; slice: ContentSlice }>
      ? Omit<TResult, 'slice'> & Readonly<{ slice: ContentSlice<V> }>
      : TResult;

type SpecializeConversionMethod<TMethod, V extends Value> = TMethod extends (
  ...args: infer TArgs
) => infer TResult
  ? Extract<
      TResult,
      | Readonly<{ document: EditorDocumentValue; ok: true }>
      | Readonly<{ ok: true; slice: ContentSlice }>
    > extends never
    ? TMethod
    : (...args: TArgs) => SpecializeConversionResult<TResult, V>
  : TMethod;

export type SpecializePluginApi<TApi, V extends Value> = {
  readonly [K in keyof TApi]: SpecializeConversionMethod<TApi[K], V>;
};

export type SpecializeInstalledPluginApi<TApi, V extends Value> = {
  readonly [K in keyof TApi]: TApi[K] extends (...args: any[]) => unknown
    ? SpecializeConversionMethod<TApi[K], V>
    : TApi[K] extends object
      ? SpecializePluginApi<TApi[K], V>
      : TApi[K];
};
