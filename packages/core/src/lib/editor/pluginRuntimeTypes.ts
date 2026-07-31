import type {
  BaseEditor as PliteRuntimeBaseEditor,
  EditorSchemaContribution,
  EditorSchemaElement,
  EditorSchemaProperty,
  EditorExtensionPortal,
  EditorExtensionReference,
  EditorStateView,
  EditorStateSchemaApi,
  EditorExtensionTypeProvider,
  EditorReadMethods,
  EditorTransactionSpecBuilder,
  EditorUpdateTransaction,
  EditorUpdate,
  EditorUpdateContext,
  EditorUpdateMethods,
  Element,
  PropertyValueDescriptor,
  PropertyValueOf,
  SchemaContentRoot,
  SchemaContentRootContribution,
  SchemaContentRootSlotsFor,
  SchemaElement,
  SchemaElementFor,
  SchemaElementPropertiesFor,
  SchemaElementProperty,
  SchemaElementTypes,
  SchemaProperty,
  SchemaTypesTarget,
  TransactionSpec,
  Value,
} from '@platejs/plite';
import type { UnionToIntersection } from '@udecode/utils';
import type {
  EditorSchemaSourceProvider,
  EditorExtensionDependencyReferenceFor,
  InternalEditorStateViewProvider,
  InternalEditorExtensionInstalledCapabilitiesOf,
  InternalEditorUpdateTransactionProvider,
} from '@platejs/plite/internal';

import type { AnyBasePlugin } from '../plugin/BasePlugin';
import type {
  AnyBasePluginDefinition,
  InferApi,
  InferDependencyDefinitions,
  InferDependencies,
  InferEnabled,
  InferRead,
  InferTargetPluginNames,
  InferUpdate,
  PluginReference,
} from '../plugin/PluginDefinition';
import type { InternalDefinitionOf } from '../plugin/pluginDefinitionCarrier.internal';
import type {
  InferExactPluginSchemaContribution,
  InferPluginDocumentType,
} from '../plugin/pluginSchemaModel.internal';
import type {
  CoreEditorApi,
  CoreEditorRead,
  CoreEditorTransaction,
  CoreEditorUpdate,
} from './coreEditorCapabilityDefinition.internal';
import type { StaticEditorExtensionTypeLambda } from './pluginRuntimeTypes.internal';

export type BasePluginInput = AnyBasePlugin | AnyBasePluginDefinition;

type PluginDefinitionOf<P> =
  InternalDefinitionOf<P> extends infer D
    ? [D] extends [never]
      ? P extends AnyBasePluginDefinition
        ? P
        : P extends AnyBasePlugin
          ? AnyBasePluginDefinition
          : never
      : Extract<D, AnyBasePluginDefinition>
    : never;

type IsAny<T> = 0 extends 1 & T ? true : false;

type InstalledPluginNames<D> =
  D extends Readonly<{ name: infer TName extends string }> ? TName : never;

type ExcludeInstalledPluginNames<D, TNames extends PropertyKey> =
  D extends Readonly<{ name: infer TName extends PropertyKey }>
    ? TName extends TNames
      ? never
      : D
    : D;

export type MergeInstalledPluginDefinitions<D, TOverrides> =
  | ExcludeInstalledPluginNames<D, InstalledPluginNames<TOverrides>>
  | TOverrides;

type ExactPluginName<D extends AnyBasePluginDefinition> =
  IsAny<D['name']> extends true
    ? never
    : string extends D['name']
      ? never
      : D['name'];

type NormalizeInstalledCapability<
  TCapability,
  TDocumentType extends string = TCapability extends Readonly<{
    documentType: infer TExistingDocumentType extends string;
  }>
    ? TExistingDocumentType
    : string,
> =
  TCapability extends Readonly<{ name: infer TName extends string }>
    ? Readonly<{ documentType: TDocumentType; name: TName }> &
        (TCapability extends Readonly<{ api: infer TApi extends object }>
          ? Readonly<{ api: TApi }>
          : {}) &
        (TCapability extends Readonly<{
          enabled: infer TEnabled extends boolean;
        }>
          ? Readonly<{ enabled: TEnabled }>
          : {}) &
        (TCapability extends Readonly<{ read: infer TRead extends object }>
          ? Readonly<{ read: TRead }>
          : {}) &
        (TCapability extends Readonly<{
          schemaContribution: infer TContribution extends
            EditorSchemaContribution;
        }>
          ? Readonly<{ schemaContribution: TContribution }>
          : TCapability extends Readonly<{
                schema: infer TSchema extends EditorSchemaContribution;
              }>
            ? Readonly<{ schemaContribution: TSchema }>
            : {}) &
        (TCapability extends Readonly<{
          targetPluginNames: infer TTargetPluginNames extends readonly string[];
        }>
          ? Readonly<{ targetPluginNames: TTargetPluginNames }>
          : {}) &
        (TCapability extends Readonly<{ type: infer TType extends string }>
          ? Readonly<{ type: TType }>
          : {}) &
        (TCapability extends Readonly<{ update: infer TUpdate extends object }>
          ? Readonly<{ update: TUpdate }>
          : {})
    : never;

type DirectInstalledCapabilitiesOf<P> =
  InternalEditorExtensionInstalledCapabilitiesOf<P>;

type PliteInstalledCapabilitiesOf<P> = [
  DirectInstalledCapabilitiesOf<P>,
] extends [never]
  ? InternalEditorExtensionInstalledCapabilitiesOf<
      EditorExtensionDependencyReferenceFor<P>
    >
  : DirectInstalledCapabilitiesOf<P>;

type InferenceIdentityOf<P> = [DirectInstalledCapabilitiesOf<P>] extends [never]
  ? PluginDefinitionOf<P>
  : P extends Readonly<{ name: infer TName extends string }>
    ? Readonly<{ name: TName }> &
        (P extends Readonly<{ enabled: infer TEnabled extends boolean }>
          ? Readonly<{ enabled: TEnabled }>
          : {})
    : never;

type DirectInstalledCapability<P, D extends AnyBasePluginDefinition> = [
  PliteInstalledCapabilitiesOf<P>,
] extends [never]
  ? P extends Readonly<{ documentType: string }>
    ? D
    : never
  : NormalizeInstalledCapability<
      Extract<PliteInstalledCapabilitiesOf<P>, { name: D['name'] }>,
      P extends PluginReference<string, infer TDocumentType>
        ? TDocumentType
        : InferPluginDocumentType<D>
    >;

type ExplicitPluginNames<T extends readonly unknown[]> =
  T[number] extends infer P
    ? P extends unknown
      ? InferenceIdentityOf<P> extends infer D extends AnyBasePluginDefinition
        ? ExactPluginName<D>
        : never
      : never
    : never;

type DisabledExplicitPluginNames<T extends readonly unknown[]> =
  T[number] extends infer P
    ? P extends unknown
      ? InferenceIdentityOf<P> extends infer D extends AnyBasePluginDefinition
        ? IsLiteralDisabled<D> extends true
          ? ExactPluginName<D>
          : never
        : never
      : never
    : never;

type IsLiteralDisabled<D extends AnyBasePluginDefinition> = [
  InferEnabled<D>,
] extends [false]
  ? true
  : false;

type InferHiddenCapability<
  D extends AnyBasePluginDefinition,
  ExplicitNames extends PropertyKey,
  Seen extends PropertyKey,
> =
  IsBroadPluginDefinition<D> extends true
    ? never
    : D['name'] extends ExplicitNames | Seen
      ? never
      : IsLiteralDisabled<D> extends true
        ? never
        : D;

type InferHiddenDependencies<
  D extends AnyBasePluginDefinition,
  ExplicitNames extends PropertyKey,
  Seen extends PropertyKey,
> = InferDependencies<D>[number] extends infer P
  ? P extends unknown
    ? InferHiddenDependency<P, ExplicitNames, Seen>
    : never
  : never;

type InferHiddenDependency<
  P,
  ExplicitNames extends PropertyKey,
  Seen extends PropertyKey,
> = (
  [PliteInstalledCapabilitiesOf<P>] extends [never]
    ? InferDependencyDefinitions<
        Readonly<{
          dependencies: readonly [
            Extract<P, EditorExtensionReference | PluginReference>,
          ];
          name: 'dependency';
        }>
      >
    : NormalizeInstalledCapability<PliteInstalledCapabilitiesOf<P>>
) extends infer D
  ? D extends AnyBasePluginDefinition
    ? InferHiddenCapability<D, ExplicitNames, Seen>
    : never
  : never;

type InferExplicitPlugin<
  P,
  ExplicitNames extends PropertyKey,
  DisabledNames extends PropertyKey,
> =
  InferenceIdentityOf<P> extends infer D extends AnyBasePluginDefinition
    ? D['name'] extends DisabledNames
      ? never
      :
          | InstalledPluginCapability<P, D>
          | InferExplicitHiddenCapabilities<
              P,
              D,
              ExplicitNames,
              ExactPluginName<D>
            >
    : never;

type InferExplicitHiddenCapabilities<
  P,
  D extends AnyBasePluginDefinition,
  ExplicitNames extends PropertyKey,
  Seen extends PropertyKey,
> = [DirectInstalledCapabilitiesOf<P>] extends [never]
  ? InferHiddenDependencies<D, ExplicitNames, Seen>
  : NormalizeInstalledCapability<
        PliteInstalledCapabilitiesOf<P>
      > extends infer TCapability
    ? TCapability extends AnyBasePluginDefinition
      ? InferHiddenCapability<TCapability, ExplicitNames, Seen>
      : never
    : never;

type InstalledPluginCapability<P, D extends AnyBasePluginDefinition> = [
  DirectInstalledCapability<P, D>,
] extends [never]
  ? D
  : Extract<DirectInstalledCapability<P, D>, AnyBasePluginDefinition>;

/**
 * Finite installed capability union derived tuple-first so explicit descriptors
 * shadow defaults. Authoring fields and dependency carriers are consumed during
 * traversal but never become part of the editor type.
 */
export type InferPlugins<T extends readonly unknown[]> =
  T[number] extends infer P
    ? P extends unknown
      ? InferExplicitPlugin<
          P,
          ExplicitPluginNames<T>,
          DisabledExplicitPluginNames<T>
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

type IsUnion<T, U = T> = [T] extends [never]
  ? false
  : T extends unknown
    ? [U] extends [T]
      ? false
      : true
    : false;

export type IsBroadPluginDefinition<P> =
  IsAny<P> extends true
    ? true
    : P extends { name: infer N }
      ? IsAny<N> extends true
        ? true
        : string extends N
          ? true
          : false
      : false;

type KnownPluginDefinition<P> = P extends unknown
  ? PluginDefinitionOf<P> extends infer D
    ? IsBroadPluginDefinition<D> extends true
      ? never
      : D
    : never
  : never;

type OwnInferencePluginDefinition<P> = [KnownPluginDefinition<P>] extends [
  never,
]
  ? never
  : IsUnknown<KnownPluginDefinition<P>> extends true
    ? never
    : KnownPluginDefinition<P>;

/** Compile raw definitions once before projecting installed editor capabilities. */
type InstalledPluginDefinition<P> =
  IsAny<P> extends true
    ? any
    : true extends IsBroadPluginDefinition<P>
      ? any
      : InferPlugins<readonly [P]>;

type InferApiGroup<D> = [D] extends [never]
  ? never
  : D extends AnyBasePluginDefinition
    ? keyof InferApi<D> extends never
      ? never
      : {
          readonly [K in ExactPluginName<D>]: InferApi<D>;
        }
    : never;

type InferReadGroup<D> = [D] extends [never]
  ? never
  : D extends AnyBasePluginDefinition
    ? keyof InferRead<D> extends never
      ? never
      : {
          readonly [K in ExactPluginName<D>]: InferRead<D>;
        }
    : never;

type InferUpdateGroup<D> = [D] extends [never]
  ? never
  : D extends AnyBasePluginDefinition
    ? keyof InferUpdate<D> extends never
      ? never
      : {
          readonly [K in ExactPluginName<D>]: InferUpdate<D>;
        }
    : never;

type InferTransactionGroup<D> = [D] extends [never]
  ? never
  : D extends AnyBasePluginDefinition
    ? keyof (InferRead<D> & InferUpdate<D>) extends never
      ? never
      : {
          readonly [K in ExactPluginName<D>]: InferRead<D> & InferUpdate<D>;
        }
    : never;

type Materialize<T> = {
  [K in keyof T]: T[K];
};

type MergeObjectIntersection<T> = [T] extends [never]
  ? {}
  : UnionToIntersection<T> extends infer TObject
    ? TObject extends object
      ? TObject
      : {}
    : {};

type ExactSchemaContribution<C> =
  C extends Readonly<{
    schemaContribution: infer TContribution extends EditorSchemaContribution;
  }>
    ? TContribution
    : C extends AnyBasePluginDefinition
      ? InferExactPluginSchemaContribution<C>
      : never;

type InstalledPluginDocumentType<C extends AnyBasePluginDefinition> =
  C extends Readonly<{ documentType: infer TDocumentType extends string }>
    ? TDocumentType
    : InferPluginDocumentType<C>;

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

type SchemaContributionElementProperty<C extends AnyBasePluginDefinition> =
  InstalledPluginDocumentType<C> extends infer TType extends string
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

type DirectSchemaProperty<C extends AnyBasePluginDefinition> =
  | SchemaContributionElementProperty<C>
  | SchemaContributionProperty<ExactSchemaContribution<C>>;

type InstalledPluginDefinitionForName<
  D,
  TName extends string,
> = D extends AnyBasePluginDefinition
  ? D['name'] extends TName
    ? D
    : never
  : never;

type InstalledPluginDocumentTypeForName<D, TName extends string> =
  InstalledPluginDefinitionForName<D, TName> extends infer TDefinition
    ? TDefinition extends AnyBasePluginDefinition
      ? InstalledPluginDocumentType<TDefinition>
      : never
    : never;

type InstalledPluginDocumentTypesForNames<
  D,
  TNames extends readonly string[],
> = {
  readonly [TIndex in keyof TNames]: TNames[TIndex] extends string
    ? InstalledPluginDocumentTypeForName<D, TNames[TIndex]>
    : never;
};

type ResolvePluginTargetProperty<
  TInstalledDefinition,
  D extends AnyBasePluginDefinition,
  TProperty,
> =
  TProperty extends SchemaElementProperty<
    infer TKey,
    infer TDescriptor,
    infer TTarget
  >
    ? TTarget extends SchemaTypesTarget<infer TTypes>
      ? string extends TTypes[number]
        ? InferTargetPluginNames<D> extends infer TNames extends
            readonly string[]
          ? TNames extends readonly []
            ? TProperty
            : SchemaElementProperty<
                TKey,
                TDescriptor,
                SchemaTypesTarget<
                  InstalledPluginDocumentTypesForNames<
                    TInstalledDefinition,
                    TNames
                  >
                >
              >
          : never
        : TProperty
      : TProperty
    : TProperty;

type ExactComposedSchemaProperty<TProperty> = TProperty extends SchemaProperty
  ? string extends TProperty['key']
    ? never
    : TProperty
  : never;

type ResolvedSchemaContributionProperty<D> = D extends AnyBasePluginDefinition
  ? SchemaContributionProperty<
      ExactSchemaContribution<D>
    > extends infer TProperty
    ? ExactComposedSchemaProperty<ResolvePluginTargetProperty<D, D, TProperty>>
    : never
  : never;

type PlateRawSchemaDeclaration<D> =
  true extends IsBroadPluginDefinition<D>
    ? EditorSchemaContribution
    : EditorSchemaContribution<
        MergeObjectIntersection<
          SchemaContributionElements<ExactSchemaContribution<D>>
        >,
        readonly ResolvedSchemaContributionProperty<D>[]
      >;

type PlateRawSchemaSource<D> = EditorSchemaSourceProvider<
  PlateRawSchemaDeclaration<D>
>;

type PlateContentRootSchemaSource<D> = EditorSchemaSourceProvider<
  EditorSchemaContribution<
    MergeObjectIntersection<
      SchemaContributionElements<ExactSchemaContribution<D>>
    >,
    readonly [],
    NonNullable<EditorSchemaContribution['groups']>,
    NonNullable<EditorSchemaContribution['roots']>,
    readonly SchemaContributionContentRoot<ExactSchemaContribution<D>>[]
  >
>;

type PlateElementPropertyValues<
  D,
  TType extends SchemaElementTypes<PlateRawSchemaSource<D>>,
> = SchemaElementPropertiesFor<PlateRawSchemaSource<D>, TType>;

type PlateElementPropertyDescriptors<
  D,
  TType extends SchemaElementTypes<PlateRawSchemaSource<D>>,
> = {
  [TKey in keyof PlateElementPropertyValues<
    D,
    TType
  >]-?: PropertyValueDescriptor<
    Exclude<PlateElementPropertyValues<D, TType>[TKey], undefined>
  >;
};

/**
 * Project targeted properties onto each applicable element. This preserves
 * exact handle inference while making plugin additions monotonic structural
 * capabilities, so specialized editors remain assignable to broad boundaries.
 */
type PlateSchemaElements<D> = {
  [TType in SchemaElementTypes<PlateRawSchemaSource<D>>]: SchemaElement<{
    contentRoots: Readonly<
      Record<
        SchemaContentRootSlotsFor<
          PlateContentRootSchemaSource<D>,
          Extract<TType, SchemaElementTypes<PlateContentRootSchemaSource<D>>>
        >,
        SchemaContentRoot
      >
    >;
    properties: PlateElementPropertyDescriptors<D, TType>;
  }>;
};

type PlateSchemaDeclaration<D> =
  true extends IsBroadPluginDefinition<D>
    ? EditorSchemaContribution
    : EditorSchemaContribution<PlateSchemaElements<D>, readonly []>;

type PlateSchemaSourceForInstalledDefinitions<D> = EditorSchemaSourceProvider<
  PlateSchemaDeclaration<D>
>;

export type PlateSchemaSource<P> = PlateSchemaSourceForInstalledDefinitions<
  InstalledPluginDefinition<P>
>;

type ElementPluginDefinition<D extends AnyBasePluginDefinition> =
  D extends unknown
    ? SchemaContributionElements<
        ExactSchemaContribution<D>
      > extends infer TElements
      ? [TElements] extends [never]
        ? never
        : InstalledPluginDocumentType<D> extends keyof TElements
          ? D
          : never
      : never
    : never;

type ElementPropertyForDefinition<D extends AnyBasePluginDefinition> = Extract<
  DirectSchemaProperty<D>,
  SchemaElementProperty
>;

type SoleDirectElementProperty<D extends AnyBasePluginDefinition> =
  ElementPropertyForDefinition<D> extends infer TProperty
    ? [TProperty] extends [never]
      ? never
      : IsUnion<TProperty> extends true
        ? never
        : Extract<TProperty, SchemaElementProperty>
    : never;

type SoleDirectSchemaProperty<D extends AnyBasePluginDefinition> =
  DirectSchemaProperty<D> extends infer TProperty
    ? [TProperty] extends [never]
      ? never
      : IsUnion<TProperty> extends true
        ? never
        : Extract<TProperty, SchemaProperty>
    : never;

type PluginDocumentType<P> =
  P extends Readonly<{ type: infer TType }> ? Extract<TType, string> : never;

type DescriptorPluginDefinition<P> = Extract<
  PluginDefinitionOf<P>,
  AnyBasePluginDefinition
>;

type InstalledPluginName<D> = D extends AnyBasePluginDefinition
  ? D['name']
  : never;

type InstalledPluginGuard<D, TPlugin> =
  true extends IsBroadPluginDefinition<D>
    ? unknown
    : DescriptorPluginDefinition<TPlugin>['name'] extends InstalledPluginName<D>
      ? unknown
      : never;

type ElementPluginGuard<TPlugin> =
  DescriptorPluginDefinition<TPlugin> extends infer D extends
    AnyBasePluginDefinition
    ? [ElementPluginDefinition<D>] extends [never]
      ? never
      : unknown
    : never;

type DirectPropertyValue<P> =
  SoleDirectElementProperty<
    PluginDefinitionOf<P>
  > extends SchemaElementProperty<any, infer TDescriptor>
    ? PropertyValueOf<TDescriptor>
    : never;

type PlateSchemaElementFor<D, TPlugin extends PluginReference> =
  IsAny<D> extends true
    ? Element
    : true extends IsBroadPluginDefinition<D>
      ? Element
      : SchemaElementFor<
          PlateSchemaSourceForInstalledDefinitions<D>,
          Extract<
            PluginDocumentType<TPlugin>,
            SchemaElementTypes<PlateSchemaSourceForInstalledDefinitions<D>>
          >
        >;

type PlateSchemaCreate<D> = (<const TPlugin extends PluginReference>(
  plugin: TPlugin &
    InstalledPluginGuard<D, TPlugin> &
    ElementPluginGuard<TPlugin>,
  properties?: NoInfer<
    SchemaElementPropertiesFor<
      PlateSchemaSourceForInstalledDefinitions<D>,
      Extract<
        PluginDocumentType<TPlugin>,
        SchemaElementTypes<PlateSchemaSourceForInstalledDefinitions<D>>
      >
    >
  >
) => PlateSchemaElementFor<D, TPlugin>) &
  EditorStateSchemaApi['create'];

type PlateSchemaAllowsElementType<D> = (<
  const TParent extends PluginReference,
  const TChild extends PluginReference,
>(
  parent: TParent &
    InstalledPluginGuard<D, TParent> &
    ElementPluginGuard<TParent>,
  child: TChild & InstalledPluginGuard<D, TChild> & ElementPluginGuard<TChild>
) => boolean) &
  EditorStateSchemaApi['allowsElementType'];

type PlateSchemaElement<D> = (<const TPlugin extends PluginReference>(
  plugin: TPlugin &
    InstalledPluginGuard<D, TPlugin> &
    ElementPluginGuard<TPlugin>
) => EditorSchemaElement | null) &
  EditorStateSchemaApi['element'];

type PlateSchemaIsElementTypeInGroup<D> = (<
  const TPlugin extends PluginReference,
>(
  plugin: TPlugin &
    InstalledPluginGuard<D, TPlugin> &
    ElementPluginGuard<TPlugin>,
  group: string
) => boolean) &
  EditorStateSchemaApi['isElementTypeInGroup'];

type PlateSchemaGetElementProperty<D> = (<
  const TPlugin extends PluginReference,
>(
  element: Element,
  plugin: TPlugin &
    InstalledPluginGuard<D, TPlugin> &
    ([SoleDirectElementProperty<DescriptorPluginDefinition<TPlugin>>] extends [
      never,
    ]
      ? never
      : unknown)
) => DirectPropertyValue<TPlugin> | undefined) &
  EditorStateSchemaApi['getElementProperty'];

type PlateSchemaProperty<D> = (<const TPlugin extends PluginReference>(
  plugin: TPlugin &
    InstalledPluginGuard<D, TPlugin> &
    ([SoleDirectSchemaProperty<DescriptorPluginDefinition<TPlugin>>] extends [
      never,
    ]
      ? never
      : unknown)
) => EditorSchemaProperty | null) &
  EditorStateSchemaApi['property'];

type PlateEditorStateSchemaApi<V extends Value, D> = Omit<
  EditorStateSchemaApi<V>,
  | 'allowsElementType'
  | 'create'
  | 'element'
  | 'getElementProperty'
  | 'isElementTypeInGroup'
  | 'property'
> & {
  allowsElementType: PlateSchemaAllowsElementType<D>;
  create: PlateSchemaCreate<D>;
  element: PlateSchemaElement<D>;
  getElementProperty: PlateSchemaGetElementProperty<D>;
  isElementTypeInGroup: PlateSchemaIsElementTypeInGroup<D>;
  property: PlateSchemaProperty<D>;
};

type InstalledPluginApi<D> =
  IsAny<D> extends true
    ? Record<string, any>
    : MergeObjectIntersection<InferApiGroup<D>>;

type InstalledPluginRead<D> =
  IsAny<D> extends true
    ? Record<string, any>
    : MergeObjectIntersection<InferReadGroup<D>>;

type InstalledPluginTransaction<D> =
  IsAny<D> extends true
    ? Record<string, any>
    : MergeObjectIntersection<InferTransactionGroup<D>>;

type InstalledPluginUpdate<D> =
  IsAny<D> extends true
    ? Record<string, any>
    : MergeObjectIntersection<InferUpdateGroup<D>>;

type MergeCapabilityGroups<TBase, TOverrides> = Omit<TBase, keyof TOverrides> &
  TOverrides;

type PlateInstalledExtension<D> = {
  name: 'plate';
} & EditorExtensionTypeProvider<
  StaticEditorExtensionTypeLambda<{
    api: Materialize<
      MergeCapabilityGroups<CoreEditorApi, InstalledPluginApi<D>>
    >;
    read: Materialize<
      MergeCapabilityGroups<CoreEditorRead, InstalledPluginRead<D>>
    >;
    update: Materialize<
      MergeCapabilityGroups<CoreEditorUpdate, InstalledPluginUpdate<D>>
    >;
  }>
>;

type PlatePluginExtensionPortalResult<D, TPlugin> =
  IsAny<D> extends true
    ? EditorExtensionPortal<TPlugin>
    : true extends IsBroadPluginDefinition<D>
      ? EditorExtensionPortal<TPlugin>
      : [
            Extract<D, { name: TPlugin extends { name: infer N } ? N : never }>,
          ] extends [never]
        ? never
        : EditorExtensionPortal<TPlugin>;

type PlatePluginExtensionPortal<D> = <
  const TPlugin extends AnyBasePlugin & PluginReference,
>(
  plugin: TPlugin
) => PlatePluginExtensionPortalResult<D, TPlugin>;

type PlatePluginDependencyExtension<D> = {
  name: 'plate-dependencies';
} & EditorExtensionTypeProvider<
  StaticEditorExtensionTypeLambda<{
    api: Materialize<InstalledPluginApi<D>>;
    read: Materialize<InstalledPluginRead<D>>;
    update: Materialize<InstalledPluginUpdate<D>>;
  }>
>;

type PlateTransactionExtension<D> = {
  name: 'plate-transaction';
} & EditorExtensionTypeProvider<
  StaticEditorExtensionTypeLambda<{
    update: Materialize<
      MergeCapabilityGroups<
        CoreEditorTransaction,
        InstalledPluginTransaction<D>
      >
    >;
  }>
>;

type BivariantFunction<TFunction> = TFunction extends (
  ...args: infer TArgs
) => infer TResult
  ? { bivarianceHack(...args: TArgs): TResult }['bivarianceHack']
  : never;

type PlateEditorTransactionBuilder<
  V extends Value,
  D,
> = EditorTransactionSpecBuilder<V, readonly [PlateTransactionExtension<D>]>;

type PlateEditorStateView<V extends Value, D> = EditorReadMethods<
  V,
  readonly [PlateInstalledExtension<D>]
> & {
  transaction: BivariantFunction<
    (
      fn: (transaction: PlateEditorTransactionBuilder<V, D>) => void
    ) => TransactionSpec
  > & {
    extend: BivariantFunction<
      (
        base: TransactionSpec,
        fn: (transaction: PlateEditorTransactionBuilder<V, D>) => void
      ) => TransactionSpec
    >;
  };
};

/** Installed editor state visible while a plugin registers editor behavior. */
export type PlatePluginState<P extends AnyBasePluginDefinition> =
  PlateEditorStateView<Value, InstalledPluginDefinition<P>>;

type PlateEditorRead<V extends Value, D> = EditorReadMethods<
  V,
  readonly [PlateInstalledExtension<D>]
> &
  (<T>(fn: (state: PlateEditorStateView<V, D>) => T) => T);

type PlateEditorUpdatePolicy<V extends Value, D> = Parameters<
  EditorUpdate<V, readonly [PlateInstalledExtension<D>]>
>[0];

type PlateEditorUpdate<V extends Value, D> = {
  <TTx extends object = {}>(
    fn: (
      transaction: EditorUpdateTransaction<
        V,
        readonly [PlateTransactionExtension<D>]
      > &
        TTx,
      context: EditorUpdateContext<
        PliteRuntimeBaseEditor<V, readonly [PlateInstalledExtension<D>]>
      >
    ) => void
  ): void;
  <TTx extends object = {}>(
    policy: PlateEditorUpdatePolicy<V, D>,
    fn: (
      transaction: EditorUpdateTransaction<
        V,
        readonly [PlateTransactionExtension<D>]
      > &
        TTx,
      context: EditorUpdateContext<
        PliteRuntimeBaseEditor<V, readonly [PlateInstalledExtension<D>]>
      >
    ) => void
  ): void;
  (
    policy: PlateEditorUpdatePolicy<V, D>
  ): EditorUpdateMethods<V, readonly [PlateInstalledExtension<D>]>;
} & EditorUpdateMethods<V, readonly [PlateInstalledExtension<D>]>;

/** Dependency capabilities visible while a plugin registers editor behavior. */
type PlatePluginExtensionEditorForInstalledDefinitions<D> =
  PliteRuntimeBaseEditor<Value, readonly [PlatePluginDependencyExtension<D>]>;

export type PlatePluginExtensionEditor<P extends AnyBasePluginDefinition> =
  PlatePluginExtensionEditorForInstalledDefinitions<
    InstalledPluginDefinition<P>
  >;

type PlatePluginTransactionForInstalledDefinitions<D> = EditorUpdateTransaction<
  Value,
  readonly [PlateTransactionExtension<D>]
>;

export type PlatePluginTransaction<P extends AnyBasePluginDefinition> =
  PlatePluginTransactionForInstalledDefinitions<InstalledPluginDefinition<P>>;

/** Installed state capabilities visible while a plugin constructs a read group. */
type PlatePluginReadStateForInstalledDefinitions<D> = EditorStateView<
  Value,
  readonly [PlatePluginDependencyExtension<D>]
>;

export type PlatePluginReadState<P extends AnyBasePluginDefinition> =
  PlatePluginReadStateForInstalledDefinitions<InstalledPluginDefinition<P>>;

type PlateOwnInstalledExtension<P> = {
  name: 'plate';
} & EditorExtensionTypeProvider<
  StaticEditorExtensionTypeLambda<{
    update: Materialize<
      MergeObjectIntersection<InferUpdateGroup<OwnInferencePluginDefinition<P>>>
    >;
  }>
>;

export type PlatePluginOwnUpdate<P extends AnyBasePluginDefinition> =
  PliteRuntimeBaseEditor<
    Value,
    readonly [PlateInstalledExtension<AnyBasePluginDefinition>]
  >['update'] &
    PliteRuntimeBaseEditor<
      Value,
      readonly [PlateOwnInstalledExtension<P>]
    >['update'];

/** @internal Editor projection for definitions already lowered by `InferPlugins`. */
export type InternalPliteEditorWithInstalledPlateDefinitions<
  V extends Value,
  D,
> = {
  extension: PlatePluginExtensionPortal<D> &
    PliteRuntimeBaseEditor<
      V,
      readonly [PlateInstalledExtension<D>]
    >['extension'];
  read: PlateEditorRead<V, D> & {
    schema: PlateEditorStateSchemaApi<V, D>;
  };
  update: PlateEditorUpdate<V, D>;
} & InternalEditorStateViewProvider<PlateEditorStateView<V, D>> &
  InternalEditorUpdateTransactionProvider<
    PlatePluginTransactionForInstalledDefinitions<D>
  > &
  Omit<
    PliteRuntimeBaseEditor<V, readonly [PlateInstalledExtension<D>]>,
    'extension' | 'read' | 'update'
  >;

export type PliteEditorWithPlatePlugins<
  V extends Value,
  P extends AnyBasePluginDefinition,
> = InternalPliteEditorWithInstalledPlateDefinitions<
  V,
  InstalledPluginDefinition<P>
>;
