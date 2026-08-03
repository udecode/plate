import type {
  EditorSchemaContribution,
  PropertyValueDescriptor,
  SchemaContentRootContribution,
  SchemaElement,
  SchemaProperty,
  SchemaTarget,
  SchemaTextProperty,
} from '@platejs/plite';

import type {
  AnyBasePluginDefinition,
  PluginSchema,
  PluginSchemaDeclaration,
} from './PluginDefinition';

type IsAny<T> = 0 extends 1 & T ? true : false;

type ResolvePluginSchemaDeclaration<TSchema> = TSchema extends (
  ...args: never[]
) => infer TDeclaration
  ? Extract<TDeclaration, PluginSchemaDeclaration>
  : Extract<TSchema, PluginSchemaDeclaration>;

type InferPluginSchemaDeclaration<C extends AnyBasePluginDefinition> =
  C extends Readonly<{
    schema: infer TSchema extends PluginSchemaDeclaration;
  }>
    ? ResolvePluginSchemaDeclaration<TSchema>
    : never;

/** Persisted element identity owned by an element plugin. */
export type InferPluginElementType<C extends AnyBasePluginDefinition> =
  IsAny<C> extends true
    ? string
    : C extends Readonly<{ type: infer TType extends string }>
      ? TType
      : [InferPluginSchemaDeclaration<C>] extends [never]
        ? never
        : InferPluginSchemaDeclaration<C> extends Readonly<{
              element: SchemaElement;
            }>
          ? C['name']
          : never;

type InferPluginDeclaredPropertyKeys<C extends AnyBasePluginDefinition> =
  InferPluginSchemaDeclaration<C> extends Readonly<{
    properties: infer TProperties extends readonly SchemaProperty[];
  }>
    ? Extract<TProperties[number]['key'], string>
    : never;

/** Persisted property identity owned by a mark/property plugin. */
export type InferPluginPropertyKey<C extends AnyBasePluginDefinition> =
  IsAny<C> extends true
    ? string
    : C extends Readonly<{ key: infer TKey extends string }>
      ? TKey
      : [InferPluginSchemaDeclaration<C>] extends [never]
        ? never
        : InferPluginSchemaDeclaration<C> extends Readonly<{ mark: unknown }>
          ? C['name']
          : C['name'] extends InferPluginDeclaredPropertyKeys<C>
            ? C['name']
            : never;

/** Primary persisted schema identity, never plugin capability identity. */
export type InferPluginDocumentType<C extends AnyBasePluginDefinition> = [
  InferPluginElementType<C>,
] extends [never]
  ? InferPluginPropertyKey<C>
  : InferPluginElementType<C>;

export type InferPluginSchema<C extends AnyBasePluginDefinition> =
  IsAny<C> extends true
    ? PluginSchema<C> | null
    : C extends Readonly<{
          schema: infer TSchema extends PluginSchemaDeclaration;
        }>
      ? TSchema
      : null;

type PluginDeclarationProperties<TDeclaration> =
  TDeclaration extends Readonly<{
    properties: infer TProperties extends readonly SchemaProperty[];
  }>
    ? readonly Extract<TProperties[number], SchemaProperty>[]
    : readonly [];

type PluginDeclarationContentRoots<TDeclaration> =
  TDeclaration extends Readonly<{
    contentRoots: infer TContentRoots extends
      readonly SchemaContentRootContribution[];
  }>
    ? TContentRoots
    : readonly [];

type PluginMarkDescriptor<TMark> = TMark extends PropertyValueDescriptor
  ? TMark
  : TMark extends Readonly<{
        property: infer TDescriptor extends PropertyValueDescriptor;
      }>
    ? TDescriptor
    : never;

type PluginMarkTarget<TMark> =
  TMark extends Readonly<{
    target: infer TTarget extends SchemaTarget;
  }>
    ? TTarget
    : undefined;

type PluginMarkProperties<TDeclaration, TType extends string> =
  TDeclaration extends Readonly<{ mark: infer TMark }>
    ? readonly [
        SchemaTextProperty<
          TType,
          PluginMarkDescriptor<TMark>,
          PluginMarkTarget<TMark>
        >,
      ]
    : readonly [];

type LowerPluginSchemaDeclaration<
  TDeclaration,
  TElementType extends string,
  TPropertyKey extends string,
> = Readonly<{
  contentRoots: PluginDeclarationContentRoots<TDeclaration>;
  elements: TDeclaration extends Readonly<{
    element: infer TElement extends SchemaElement;
  }>
    ? Readonly<{ [TKey in TElementType]: TElement }>
    : Readonly<Record<never, never>>;
  properties: readonly [
    ...PluginDeclarationProperties<TDeclaration>,
    ...PluginMarkProperties<TDeclaration, TPropertyKey>,
  ];
}>;

type InferExactPluginSchemaContributionForDefinition<
  C extends AnyBasePluginDefinition,
> =
  C extends Readonly<{
    schema: infer TSchema extends PluginSchemaDeclaration;
  }>
    ? LowerPluginSchemaDeclaration<
        ResolvePluginSchemaDeclaration<TSchema>,
        InferPluginElementType<C>,
        InferPluginPropertyKey<C>
      >
    : never;

export type InferExactPluginSchemaContribution<
  C extends AnyBasePluginDefinition,
> = C extends unknown
  ? InferExactPluginSchemaContributionForDefinition<C>
  : never;

export type InferPluginSchemaContribution<C extends AnyBasePluginDefinition> = [
  InferExactPluginSchemaContribution<C>,
] extends [never]
  ? EditorSchemaContribution
  : InferExactPluginSchemaContribution<C>;
