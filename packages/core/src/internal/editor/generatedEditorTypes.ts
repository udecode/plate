import type {
  EditorNodeTypeProvider,
  EditorValueTypeProvider,
  Element,
  SchemaPropertyHandle,
  SchemaPropertyKey,
  Text,
  Value,
} from '@platejs/plite';

declare const generatedEditorTypes: unique symbol;

type GeneratedEditorSchema = Readonly<{
  plugins: Readonly<
    Record<string, Readonly<{ key: string }> | Readonly<{ type: string }>>
  >;
  properties: Readonly<
    Record<string, SchemaPropertyHandle<SchemaPropertyKey> | undefined>
  >;
}>;

type GeneratedEditorTypes<
  V extends Value = Value,
  TElement extends Element = Element,
  TText extends Text = Text,
  TSchema extends GeneratedEditorSchema = GeneratedEditorSchema,
  TMutations extends Readonly<Record<string, unknown>> = never,
> = Readonly<{
  element: TElement;
  mutations: TMutations;
  schema: TSchema;
  text: TText;
  value: V;
}>;

type AnyGeneratedEditorTypes = GeneratedEditorTypes<
  Value,
  Element,
  Text,
  GeneratedEditorSchema,
  Readonly<Record<string, unknown>>
>;

/**
 * Type-only exact contract emitted by `plate generate`.
 *
 * @internal
 */
export type GeneratedEditorTypeProvider<
  TTypes extends AnyGeneratedEditorTypes,
> = EditorNodeTypeProvider<() => TTypes['element'], () => TTypes['text']> &
  EditorValueTypeProvider<() => TTypes['value']> &
  Readonly<{ [generatedEditorTypes]: () => TTypes }>;

type GeneratedValueFactory<TPlugins> =
  TPlugins extends EditorValueTypeProvider<infer TValueFactory>
    ? TValueFactory
    : never;

type GeneratedTypesFactory<TPlugins> =
  TPlugins extends Readonly<{
    [generatedEditorTypes]: infer TTypesFactory;
  }>
    ? TTypesFactory
    : never;

/**
 * Exact generated value, or broad runtime `Value`.
 *
 * @internal
 */
export type GeneratedEditorValue<TPlugins> =
  GeneratedValueFactory<TPlugins> extends () => infer TValue
    ? TValue extends Value
      ? TValue
      : Value
    : Value;

/**
 * Exact generated mutation map, or `never` for authored plugins.
 *
 * @internal
 */
export type GeneratedEditorMutations<TPlugins> =
  GeneratedTypesFactory<TPlugins> extends () => infer TTypes
    ? TTypes extends AnyGeneratedEditorTypes
      ? TTypes['mutations']
      : never
    : never;
