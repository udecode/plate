import type {
  BaseEditor as PliteRuntimeBaseEditor,
  EditorSchemaContribution,
  EditorSchemaElement,
  EditorSchemaProperty,
  EditorSchemaSource,
  EditorSchemaSourceProvider,
  EditorStateSchemaApi,
  EditorExtensionTypeProvider,
  EditorUpdateTransaction,
  Element,
  PropertyValueDescriptor,
  PropertyValueOf,
  SchemaContentRoot,
  SchemaContentRootContribution,
  SchemaContentRootSlotsFor,
  SchemaElement,
  SchemaElementFor,
  SchemaElementHandle,
  SchemaElementPropertiesFor,
  SchemaElementProperty,
  SchemaElementTypes,
  SchemaProperty,
  Value,
} from '@platejs/plite';
import type { UnionToIntersection } from '@udecode/utils';

import type { BasePlugin } from '../plugin/BasePlugin';
import type {
  AnyPluginConfig,
  InferApi,
  InferDependencies,
  InferEnabled,
  InferExactPluginSchemaContribution,
  InferPluginApi,
  InferPluginDocumentType,
  InferState,
  InferTx,
} from '../plugin/PluginConfig';
import type { CorePluginApi, CorePluginState, CorePluginTx } from '../plugins';

export type BasePluginInput =
  | AnyPluginConfig
  | Readonly<{
      __config: AnyPluginConfig;
      key: string;
    }>;

export type InferPluginConfig<P> = P extends {
  readonly __config: infer C extends AnyPluginConfig;
}
  ? C
  : P extends BasePlugin<infer C>
    ? C
    : P extends AnyPluginConfig
      ? P
      : never;

type IsAny<T> = 0 extends 1 & T ? true : false;

type ExactPluginKey<C extends AnyPluginConfig> =
  IsAny<C['key']> extends true ? never : C['key'];

type ExplicitPluginKeys<T extends readonly unknown[]> =
  T[number] extends infer P
    ? P extends unknown
      ? InferPluginConfig<P> extends infer C extends AnyPluginConfig
        ? ExactPluginKey<C>
        : never
      : never
    : never;

type DisabledExplicitPluginKeys<T extends readonly unknown[]> =
  T[number] extends infer P
    ? P extends unknown
      ? InferPluginConfig<P> extends infer C extends AnyPluginConfig
        ? IsLiteralDisabled<C> extends true
          ? ExactPluginKey<C>
          : never
        : never
      : never
    : never;

type NextPluginKey<C extends AnyPluginConfig, Seen extends PropertyKey> =
  | Seen
  | ExactPluginKey<C>;

type IsLiteralDisabled<C extends AnyPluginConfig> = [InferEnabled<C>] extends [
  false,
]
  ? true
  : false;

type InferHiddenPlugin<
  P,
  ExplicitKeys extends PropertyKey,
  Seen extends PropertyKey,
> =
  InferPluginConfig<P> extends infer C extends AnyPluginConfig
    ? IsAny<C['key']> extends true
      ? C
      : C['key'] extends ExplicitKeys | Seen
        ? never
        : IsLiteralDisabled<C> extends true
          ? never
          : C | InferHiddenDependencies<C, ExplicitKeys, NextPluginKey<C, Seen>>
    : never;

type InferHiddenDependencies<
  C extends AnyPluginConfig,
  ExplicitKeys extends PropertyKey,
  Seen extends PropertyKey,
> = InferDependencies<C>[number] extends infer P
  ? P extends unknown
    ? InferHiddenPlugin<P, ExplicitKeys, Seen>
    : never
  : never;

type InferExplicitPlugin<
  P,
  ExplicitKeys extends PropertyKey,
  DisabledKeys extends PropertyKey,
> =
  InferPluginConfig<P> extends infer C extends AnyPluginConfig
    ? C['key'] extends DisabledKeys
      ? never
      : C | InferHiddenDependencies<C, ExplicitKeys, ExactPluginKey<C>>
    : never;

/** Installed config union derived tuple-first so explicit descriptors shadow defaults. */
export type InferPlugins<T extends readonly unknown[]> =
  T[number] extends infer P
    ? P extends unknown
      ? InferExplicitPlugin<
          P,
          ExplicitPluginKeys<T>,
          DisabledExplicitPluginKeys<T>
        >
      : never
    : never;

type IsUnknown<T> =
  IsAny<T> extends true
    ? false
    : unknown extends T
      ? [keyof T] extends [never]
        ? true
        : false
      : false;

type WidenLiteral<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T extends bigint
        ? bigint
        : T;

type IsUnion<T, U = T> = [T] extends [never]
  ? false
  : T extends unknown
    ? [U] extends [T]
      ? false
      : true
    : false;

type KeysOfUnion<T> = T extends unknown ? keyof T : never;

type PickUnionKey<T, K extends PropertyKey> = T extends unknown
  ? K extends keyof T
    ? Pick<T, K>
    : never
  : never;

type ValueOfUnionKey<T, K extends PropertyKey> = T extends unknown
  ? K extends keyof T
    ? T[K]
    : never
  : never;

type WidenDuplicateApiMember<T> = T extends (...args: infer A) => infer R
  ? (...args: A) => WidenLiteral<R>
  : T extends object
    ? MergeEditorApiUnion<T>
    : WidenLiteral<T>;

type OptionalKeysOfUnion<T> = {
  [K in KeysOfUnion<T>]: undefined extends ValueOfUnionKey<T, K> ? K : never;
}[KeysOfUnion<T>];

type RequiredKeysOfUnion<T> = Exclude<KeysOfUnion<T>, OptionalKeysOfUnion<T>>;

type MergeApiUnionMember<T, K extends PropertyKey> =
  IsUnion<PickUnionKey<T, K>> extends true
    ? WidenDuplicateApiMember<Exclude<ValueOfUnionKey<T, K>, undefined>>
    : ValueOfUnionKey<T, K>;

type MergeEditorApiUnion<T> = {
  [K in RequiredKeysOfUnion<T>]: MergeApiUnionMember<T, K>;
} & {
  [K in OptionalKeysOfUnion<T>]?: MergeApiUnionMember<T, K>;
};

export type IsBroadPluginConfig<P> =
  IsAny<P> extends true ? true : P extends { key: infer K } ? IsAny<K> : false;

type KnownPluginConfig<P> = P extends unknown
  ? InferPluginConfig<P> extends infer C
    ? IsBroadPluginConfig<C> extends true
      ? never
      : C
    : never
  : never;

type OwnInferencePluginConfig<P> = [KnownPluginConfig<P>] extends [never]
  ? never
  : IsUnknown<KnownPluginConfig<P>> extends true
    ? never
    : KnownPluginConfig<P>;

type InferencePluginConfig<P> =
  InferPluginConfig<P> extends infer C
    ? [C] extends [never]
      ? never
      : IsAny<C> extends true
        ? never
        : [C] extends [AnyPluginConfig]
          ? IsUnion<C> extends true
            ? OwnInferencePluginConfig<C>
            : OwnInferencePluginConfig<
                InferPlugins<readonly [Extract<C, AnyPluginConfig>]>
              >
          : never
    : never;

type InferApiFromPluginConfig<C> = [C] extends [never]
  ? never
  : C extends AnyPluginConfig
    ? InferApi<C>
    : never;

type InferPluginApiFromPluginConfig<C> = [C] extends [never]
  ? never
  : C extends AnyPluginConfig
    ? keyof InferPluginApi<C> extends never
      ? never
      : {
          [K in ExactPluginKey<C>]: InferPluginApi<C>;
        }
    : never;

type InferTxFromPluginConfig<C> = [C] extends [never]
  ? never
  : C extends AnyPluginConfig
    ? InferTx<C>
    : never;

type InferStateFromPluginConfig<C> = [C] extends [never]
  ? never
  : C extends AnyPluginConfig
    ? InferState<C>
    : never;

type Materialize<T> = {
  [K in keyof T]: T[K];
};

type MergeObjectApi<T> =
  MergeEditorApiUnion<T> extends infer TApi
    ? TApi extends object
      ? Materialize<TApi>
      : {}
    : {};

type MergeObjectIntersection<T> = [T] extends [never]
  ? {}
  : UnionToIntersection<T> extends infer TObject
    ? TObject extends object
      ? TObject
      : {}
    : {};

type ExactSchemaContribution<C> = C extends AnyPluginConfig
  ? InferExactPluginSchemaContribution<C>
  : never;

type SchemaContributionElements<TContribution> =
  TContribution extends Readonly<{ elements?: infer TElements }>
    ? Extract<NonNullable<TElements>, Readonly<Record<string, SchemaElement>>>
    : never;

type SchemaContributionProperty<TContribution> =
  TContribution extends Readonly<{
    properties?: readonly (infer TProperty)[];
  }>
    ? Extract<TProperty, SchemaProperty>
    : never;

type SchemaContributionContentRoot<TContribution> =
  TContribution extends Readonly<{
    contentRoots?: readonly (infer TContentRoot)[];
  }>
    ? Extract<TContentRoot, SchemaContentRootContribution>
    : never;

type SchemaContributionElementProperty<C extends AnyPluginConfig> =
  InferPluginDocumentType<C> extends infer TType extends string
    ? SchemaContributionElements<
        ExactSchemaContribution<C>
      > extends infer TElements
      ? TElements extends Readonly<Record<string, SchemaElement>>
        ? TType extends keyof TElements
          ? TElements[TType] extends Readonly<{
              properties?: infer TProperties;
            }>
            ? TProperties extends Readonly<Record<string, unknown>>
              ? {
                  [TKey in Extract<
                    keyof TProperties,
                    string
                  >]: SchemaElementProperty<
                    TKey,
                    Extract<TProperties[TKey], SchemaElementProperty['value']>
                  >;
                }[Extract<keyof TProperties, string>]
              : never
            : never
          : never
        : never
      : never
    : never;

type DirectSchemaProperty<C extends AnyPluginConfig> =
  | SchemaContributionElementProperty<C>
  | SchemaContributionProperty<ExactSchemaContribution<C>>;

type PlateRawSchemaDeclaration<P> =
  true extends IsBroadPluginConfig<P>
    ? EditorSchemaContribution
    : EditorSchemaContribution<
        MergeObjectIntersection<
          SchemaContributionElements<
            ExactSchemaContribution<InferencePluginConfig<P>>
          >
        >,
        readonly SchemaContributionProperty<
          ExactSchemaContribution<InferencePluginConfig<P>>
        >[]
      >;

type PlateRawSchemaSource<P> = EditorSchemaSourceProvider<
  PlateRawSchemaDeclaration<P>
>;

type PlateContentRootSchemaSource<P> = EditorSchemaSourceProvider<
  EditorSchemaContribution<
    MergeObjectIntersection<
      SchemaContributionElements<
        ExactSchemaContribution<InferencePluginConfig<P>>
      >
    >,
    readonly [],
    NonNullable<EditorSchemaContribution['groups']>,
    NonNullable<EditorSchemaContribution['roots']>,
    readonly SchemaContributionContentRoot<
      ExactSchemaContribution<InferencePluginConfig<P>>
    >[]
  >
>;

type PlateElementPropertyValues<
  P,
  TType extends SchemaElementTypes<PlateRawSchemaSource<P>>,
> = SchemaElementPropertiesFor<PlateRawSchemaSource<P>, TType>;

type PlateElementPropertyDescriptors<
  P,
  TType extends SchemaElementTypes<PlateRawSchemaSource<P>>,
> = {
  [TKey in keyof PlateElementPropertyValues<
    P,
    TType
  >]-?: PropertyValueDescriptor<
    Exclude<PlateElementPropertyValues<P, TType>[TKey], undefined>
  >;
};

/**
 * Project targeted properties onto each applicable element. This preserves
 * exact handle inference while making plugin additions monotonic structural
 * capabilities, so specialized editors remain assignable to broad boundaries.
 */
type PlateSchemaElements<P> = {
  [TType in SchemaElementTypes<PlateRawSchemaSource<P>>]: SchemaElement<{
    contentRoots: Readonly<
      Record<
        SchemaContentRootSlotsFor<
          PlateContentRootSchemaSource<P>,
          Extract<TType, SchemaElementTypes<PlateContentRootSchemaSource<P>>>
        >,
        SchemaContentRoot
      >
    >;
    properties: PlateElementPropertyDescriptors<P, TType>;
  }>;
};

type PlateSchemaDeclaration<P> =
  true extends IsBroadPluginConfig<P>
    ? EditorSchemaContribution
    : EditorSchemaContribution<PlateSchemaElements<P>, readonly []>;

export type PlateSchemaSource<P> = EditorSchemaSourceProvider<
  PlateSchemaDeclaration<P>
>;

type PlateSchemaPluginDescriptor<C extends AnyPluginConfig> = Readonly<{
  __config: C;
  key: C['key'];
  type: InferPluginDocumentType<C>;
}>;

type ElementPluginConfig<C extends AnyPluginConfig> =
  SchemaContributionElements<ExactSchemaContribution<C>> extends infer TElements
    ? [TElements] extends [never]
      ? never
      : InferPluginDocumentType<C> extends keyof TElements
        ? C
        : never
    : never;

type PlateElementPlugin<P> =
  true extends IsBroadPluginConfig<P>
    ? PlateSchemaPluginDescriptor<AnyPluginConfig>
    : InferencePluginConfig<P> extends infer C
      ? C extends AnyPluginConfig
        ? PlateSchemaPluginDescriptor<ElementPluginConfig<C>>
        : never
      : never;

type PlateSchemaPlugin<P> =
  true extends IsBroadPluginConfig<P>
    ? PlateSchemaPluginDescriptor<AnyPluginConfig>
    : InferencePluginConfig<P> extends infer C
      ? C extends AnyPluginConfig
        ? PlateSchemaPluginDescriptor<C>
        : never
      : never;

type ElementPropertyForConfig<C extends AnyPluginConfig> = Extract<
  DirectSchemaProperty<C>,
  SchemaElementProperty
>;

type SoleDirectElementProperty<C extends AnyPluginConfig> =
  ElementPropertyForConfig<C> extends infer TProperty
    ? [TProperty] extends [never]
      ? never
      : IsUnion<TProperty> extends true
        ? never
        : Extract<TProperty, SchemaElementProperty>
    : never;

type SoleDirectSchemaProperty<C extends AnyPluginConfig> =
  DirectSchemaProperty<C> extends infer TProperty
    ? [TProperty] extends [never]
      ? never
      : IsUnion<TProperty> extends true
        ? never
        : Extract<TProperty, SchemaProperty>
    : never;

type PluginDocumentType<P> =
  P extends Readonly<{ type: infer TType }> ? Extract<TType, string> : never;

type PluginConfigOf<P> =
  P extends Readonly<{
    __config: infer C extends AnyPluginConfig;
  }>
    ? C
    : never;

type DirectPropertyValue<P> =
  SoleDirectElementProperty<PluginConfigOf<P>> extends SchemaElementProperty<
    any,
    infer TDescriptor
  >
    ? PropertyValueOf<TDescriptor>
    : never;

type PlateSchemaCreateAndFill<P> = EditorStateSchemaApi['createAndFill'] &
  (<TPlugin extends PlateElementPlugin<P>>(
    plugin: TPlugin,
    properties?: NoInfer<
      SchemaElementPropertiesFor<
        PlateSchemaSource<P>,
        Extract<
          PluginDocumentType<TPlugin>,
          SchemaElementTypes<PlateSchemaSource<P>>
        >
      >
    >
  ) => SchemaElementFor<
    PlateSchemaSource<P>,
    Extract<
      PluginDocumentType<TPlugin>,
      SchemaElementTypes<PlateSchemaSource<P>>
    >
  >);

type PlateSchemaElement<P> = EditorStateSchemaApi['element'] &
  (<TPlugin extends PlateElementPlugin<P>>(
    plugin: TPlugin
  ) => EditorSchemaElement | null);

type PlateSchemaGetElementProperty<P> =
  EditorStateSchemaApi['getElementProperty'] &
    (<TPlugin extends PlateSchemaPlugin<P>>(
      element: Element,
      plugin: TPlugin &
        ([SoleDirectElementProperty<PluginConfigOf<TPlugin>>] extends [never]
          ? never
          : unknown)
    ) => DirectPropertyValue<TPlugin> | undefined);

type PlateSchemaProperty<P> = EditorStateSchemaApi['property'] &
  (<TPlugin extends PlateSchemaPlugin<P>>(
    plugin: TPlugin &
      ([SoleDirectSchemaProperty<PluginConfigOf<TPlugin>>] extends [never]
        ? never
        : unknown)
  ) => EditorSchemaProperty | null);

type PlateEditorStateSchemaApi<V extends Value, P> = Omit<
  EditorStateSchemaApi<V>,
  'createAndFill' | 'element' | 'getElementProperty' | 'property'
> & {
  createAndFill: PlateSchemaCreateAndFill<P>;
  element: PlateSchemaElement<P>;
  getElementProperty: PlateSchemaGetElementProperty<P>;
  property: PlateSchemaProperty<P>;
  /** Create a typed Plite element handle from an installed Plate descriptor. */
  handle<TPlugin extends PlateElementPlugin<P> & EditorSchemaSource>(
    plugin: TPlugin &
      (PluginDocumentType<TPlugin> extends SchemaElementTypes<TPlugin>
        ? unknown
        : never)
  ): SchemaElementHandle<
    PlateSchemaSource<P>,
    Extract<PluginDocumentType<TPlugin>, SchemaElementTypes<TPlugin>>
  >;
};

type InstalledPluginApi<P> =
  IsAny<P> extends true
    ? Record<string, any>
    : MergeObjectApi<
        | InferApiFromPluginConfig<InferencePluginConfig<P>>
        | InferPluginApiFromPluginConfig<InferencePluginConfig<P>>
      >;

type InstalledPluginTx<P> =
  IsAny<P> extends true
    ? Record<string, any>
    : MergeObjectIntersection<
        InferTxFromPluginConfig<InferencePluginConfig<P>>
      >;

type InstalledPluginState<P> =
  IsAny<P> extends true
    ? Record<string, any>
    : MergeObjectIntersection<
        InferStateFromPluginConfig<InferencePluginConfig<P>>
      >;

type PlateInstalledExtension<P> = {
  name: 'plate';
} & EditorExtensionTypeProvider<
  () => {
    api: Materialize<CorePluginApi & InstalledPluginApi<P>>;
    state: CorePluginState & InstalledPluginState<P>;
    tx: CorePluginTx & InstalledPluginTx<P>;
  }
>;

type PlatePluginTransactionExtension<P> = {
  name: 'plate-dependencies';
} & EditorExtensionTypeProvider<
  () => {
    api: Materialize<InstalledPluginApi<P>>;
    state: InstalledPluginState<P>;
    tx: InstalledPluginTx<P>;
  }
>;

/** Dependency capabilities visible while a plugin registers editor behavior. */
export type PlatePluginExtensionEditor<P extends AnyPluginConfig> =
  PliteRuntimeBaseEditor<Value, readonly [PlatePluginTransactionExtension<P>]>;

export type PlatePluginTransaction<P extends AnyPluginConfig> =
  EditorUpdateTransaction<Value, readonly [PlatePluginTransactionExtension<P>]>;

type PlateOwnInstalledExtension<P> = {
  name: 'plate';
} & EditorExtensionTypeProvider<
  () => {
    api: Materialize<
      CorePluginApi &
        MergeObjectApi<
          | InferApiFromPluginConfig<OwnInferencePluginConfig<P>>
          | InferPluginApiFromPluginConfig<OwnInferencePluginConfig<P>>
        >
    >;
    state: CorePluginState &
      MergeObjectIntersection<
        InferStateFromPluginConfig<OwnInferencePluginConfig<P>>
      >;
    tx: CorePluginTx &
      MergeObjectIntersection<
        InferTxFromPluginConfig<OwnInferencePluginConfig<P>>
      >;
  }
>;

export type PlatePluginOwnUpdate<P extends AnyPluginConfig> =
  PliteRuntimeBaseEditor<
    Value,
    readonly [PlateOwnInstalledExtension<P>]
  >['update'];

export type PliteEditorWithPlatePlugins<
  V extends Value,
  P extends AnyPluginConfig,
> = PliteRuntimeBaseEditor<V, readonly [PlateInstalledExtension<P>]> & {
  read: PliteRuntimeBaseEditor<
    V,
    readonly [PlateInstalledExtension<P>]
  >['read'] & {
    schema: PlateEditorStateSchemaApi<V, P>;
  };
};
