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

export type InferPluginDocumentType<C extends AnyBasePluginDefinition> =
  IsAny<C> extends true
    ? string
    : C extends Readonly<{ type: infer TType extends string }>
      ? TType
      : C['name'];

export type InferPluginSchema<C extends AnyBasePluginDefinition> =
  IsAny<C> extends true
    ? PluginSchema<C> | null
    : C extends Readonly<{
          schema: infer TSchema extends PluginSchemaDeclaration;
        }>
      ? TSchema
      : null;

type ResolvePluginSchemaDeclaration<TSchema> = TSchema extends (
  ...args: never[]
) => infer TDeclaration
  ? Extract<TDeclaration, PluginSchemaDeclaration>
  : Extract<TSchema, PluginSchemaDeclaration>;

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
  TType extends string,
> = Readonly<{
  contentRoots: PluginDeclarationContentRoots<TDeclaration>;
  elements: TDeclaration extends Readonly<{
    element: infer TElement extends SchemaElement;
  }>
    ? Readonly<{ [TKey in TType]: TElement }>
    : Readonly<Record<never, never>>;
  properties: readonly [
    ...PluginDeclarationProperties<TDeclaration>,
    ...PluginMarkProperties<TDeclaration, TType>,
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
        InferPluginDocumentType<C>
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
