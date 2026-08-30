import type {
  EditorNodeTypeProvider,
  EditorSchemaContribution,
  Element,
  PropertyValueDescriptor,
  PropertyValueOf,
  SchemaContentRootContribution,
  SchemaElement,
  SchemaElementShapeFor,
  SchemaElementPropertyDefinition,
  SchemaPropertyHandle,
  SchemaPropertyKey,
  SchemaProperty,
  SchemaPropertyDefinition,
  SchemaTarget,
  SchemaTextProperty,
  SchemaTextPropertyDefinition,
  SchemaText,
  Text,
  EditorSchemaSourceProvider,
} from 'plitejs';

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

type PluginElementPropertyHandles<TDeclaration> =
  TDeclaration extends Readonly<{
    element: Readonly<{
      properties?: infer TProperties extends Readonly<
        Record<string, PropertyValueDescriptor>
      >;
    }>;
  }>
    ? Readonly<{
        [TKey in Extract<keyof TProperties, string>]: SchemaPropertyHandle<
          TKey,
          PropertyValueOf<TProperties[TKey]>,
          'element'
        >;
      }>
    : Readonly<Record<never, never>>;

type PluginDeclaredPropertyKey<TLocalId extends string, TProperty> =
  TProperty extends Readonly<{ key: infer TKey extends SchemaPropertyKey }>
    ? TKey
    : TLocalId;

type PluginDeclaredPropertyHandles<TDeclaration> =
  TDeclaration extends Readonly<{
    properties: infer TProperties;
  }>
    ? TProperties extends Readonly<
        Record<
          string,
          | SchemaElementPropertyDefinition
          | SchemaProperty
          | SchemaTextPropertyDefinition
        >
      >
      ? Readonly<{
          [
            TLocalId in Extract<keyof TProperties, string>
          ]: SchemaPropertyHandle<
            PluginDeclaredPropertyKey<TLocalId, TProperties[TLocalId]>,
            TProperties[TLocalId] extends Readonly<{
              value: infer TDescriptor extends PropertyValueDescriptor;
            }>
              ? PropertyValueOf<TDescriptor>
              : never,
            TProperties[TLocalId] extends Readonly<{
              placement: infer TPlacement extends 'element' | 'text';
            }>
              ? TPlacement
              : never
          >;
        }>
      : Readonly<Record<never, never>>
    : Readonly<Record<never, never>>;

/** Additional compiled properties visible only while authoring one plugin. */
export type InferPluginAdditionalSchemaPropertyHandles<
  C extends AnyBasePluginDefinition,
> =
  IsAny<C> extends true
    ? Readonly<Record<string, SchemaPropertyHandle>>
    : Readonly<
        PluginElementPropertyHandles<InferPluginSchemaDeclaration<C>> &
          PluginDeclaredPropertyHandles<InferPluginSchemaDeclaration<C>>
      >;

type PluginWritablePropertyEntry<
  TOwnerName extends string,
  TLocalId extends string,
  TKey extends SchemaPropertyKey,
  TDescriptor extends PropertyValueDescriptor,
  TPlacement extends 'element' | 'text',
> = Readonly<{
  descriptor: TDescriptor;
  key: TKey;
  localId: TLocalId;
  ownerName: TOwnerName;
  placement: TPlacement;
  unaliased: TKey extends string
    ? TKey extends TLocalId
      ? TLocalId extends TKey
        ? true
        : false
      : false
    : false;
  value: PropertyValueDescriptor extends TDescriptor
    ? unknown
    : PropertyValueOf<TDescriptor>;
}>;

type PluginElementWritablePropertyEntries<
  C extends AnyBasePluginDefinition,
  TDeclaration,
> =
  TDeclaration extends Readonly<{
    element: Readonly<{
      properties?: infer TProperties extends Readonly<
        Record<string, PropertyValueDescriptor>
      >;
    }>;
  }>
    ? {
        [
          TLocalId in Extract<keyof TProperties, string>
        ]: PluginWritablePropertyEntry<
          C['name'],
          TLocalId,
          TLocalId,
          TProperties[TLocalId],
          'element'
        >;
      }[Extract<keyof TProperties, string>]
    : never;

type PluginDeclaredWritablePropertyEntries<
  C extends AnyBasePluginDefinition,
  TDeclaration,
> =
  TDeclaration extends Readonly<{ properties: infer TProperties }>
    ? TProperties extends Readonly<
        Record<
          string,
          | SchemaElementPropertyDefinition
          | SchemaProperty
          | SchemaTextPropertyDefinition
        >
      >
      ? {
          [
            TLocalId in Extract<keyof TProperties, string>
          ]: PluginWritablePropertyEntry<
            C['name'],
            TLocalId,
            PluginDeclaredPropertyKey<TLocalId, TProperties[TLocalId]>,
            TProperties[TLocalId] extends Readonly<{
              value: infer TDescriptor extends PropertyValueDescriptor;
            }>
              ? TDescriptor
              : PropertyValueDescriptor,
            TProperties[TLocalId] extends Readonly<{
              placement: infer TPlacement extends 'element' | 'text';
            }>
              ? TPlacement
              : never
          >;
        }[Extract<keyof TProperties, string>]
      : never
    : never;

type PluginMarkWritablePropertyEntry<
  C extends AnyBasePluginDefinition,
  TDeclaration,
> =
  TDeclaration extends Readonly<{ mark: infer TMark }>
    ? PluginWritablePropertyEntry<
        C['name'],
        C['name'],
        TMark extends Readonly<{ key: infer TKey extends string }>
          ? TKey
          : C['name'],
        PluginMarkDescriptor<TMark>,
        'text'
      >
    : never;

/** Shallow writable property identities owned by one plugin definition. */
export type InferPluginWritablePropertyEntries<
  C extends AnyBasePluginDefinition,
> =
  IsAny<C> extends true
    ? PluginWritablePropertyEntry<
        string,
        string,
        SchemaPropertyKey,
        PropertyValueDescriptor,
        'element' | 'text'
      >
    :
        | PluginElementWritablePropertyEntries<
            C,
            InferPluginSchemaDeclaration<C>
          >
        | PluginDeclaredWritablePropertyEntries<
            C,
            InferPluginSchemaDeclaration<C>
          >
        | PluginMarkWritablePropertyEntry<C, InferPluginSchemaDeclaration<C>>;

/** Persisted element identity owned by an element plugin. */
export type InferPluginElementType<C extends AnyBasePluginDefinition> =
  IsAny<C> extends true
    ? string
    : [InferPluginSchemaDeclaration<C>] extends [never]
      ? never
      : InferPluginSchemaDeclaration<C> extends Readonly<{
            element: infer TElement extends SchemaElement;
          }>
        ? TElement extends Readonly<{ type: infer TType extends string }>
          ? TType
          : C['name']
        : never;

/** Persisted primary property identity owned by a mark plugin. */
export type InferPluginMarkKey<C extends AnyBasePluginDefinition> =
  IsAny<C> extends true
    ? string
    : [InferPluginSchemaDeclaration<C>] extends [never]
      ? never
      : InferPluginSchemaDeclaration<C> extends Readonly<{
            mark: infer TMark;
          }>
        ? TMark extends Readonly<{ key: infer TKey extends string }>
          ? TKey
          : C['name']
        : never;

/** Value stored by a plugin's primary mark. */
export type InferPluginMarkValue<C extends AnyBasePluginDefinition> =
  IsAny<C> extends true
    ? unknown
    : C extends Readonly<{ markValue: infer TValue }>
      ? TValue
      : [InferPluginSchemaDeclaration<C>] extends [never]
        ? never
        : InferPluginSchemaDeclaration<C> extends Readonly<{
              mark: infer TMark;
            }>
          ? PluginMarkDescriptor<TMark> extends PropertyValueDescriptor<
              infer TValue
            >
            ? TValue
            : never
          : never;

/** Primary persisted schema identity, never plugin capability identity. */
export type InferPluginDocumentType<C extends AnyBasePluginDefinition> = [
  InferPluginElementType<C>,
] extends [never]
  ? InferPluginMarkKey<C>
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
    properties: infer TProperties;
  }>
    ? TProperties extends Readonly<
        Record<string, SchemaProperty | SchemaPropertyDefinition>
      >
      ? ReadonlyArray<
          {
            [
              TLocalId in Extract<keyof TProperties, string>
            ]: TProperties[TLocalId] extends infer TProperty extends
              | SchemaProperty
              | SchemaPropertyDefinition
              ? TProperty extends SchemaProperty
                ? TProperty
                : Readonly<{ key: TLocalId }> & TProperty
              : never;
          }[Extract<keyof TProperties, string>]
        >
      : readonly []
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
        InferPluginMarkKey<C>
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

type InferPluginOwnSchemaContribution<C extends AnyBasePluginDefinition> =
  IsAny<C> extends true
    ? EditorSchemaContribution
    : string extends C['name']
      ? EditorSchemaContribution
      : InferExactPluginSchemaContribution<C>;

type PluginOwnSchemaSource<C extends AnyBasePluginDefinition> =
  EditorSchemaSourceProvider<InferPluginOwnSchemaContribution<C>>;

type InferPluginOwnElement<C extends AnyBasePluginDefinition> = [
  InferPluginOwnSchemaContribution<C>,
] extends [never]
  ? never
  : Extract<SchemaElementShapeFor<PluginOwnSchemaSource<C>>, Element>;

type InferPluginOwnText<C extends AnyBasePluginDefinition> = [
  InferPluginOwnSchemaContribution<C>,
] extends [never]
  ? never
  : Extract<SchemaText<PluginOwnSchemaSource<C>>, Text>;

/** Exact descriptor-local node shapes, excluding installed dependencies. */
export type InferPluginNodeTypeProvider<C extends AnyBasePluginDefinition> =
  EditorNodeTypeProvider<
    () => InferPluginOwnElement<C>,
    () => InferPluginOwnText<C>
  >;
