import type {
  Editor as PliteRuntimeBaseEditor,
  EditorSchemaContribution,
  EditorSchemaDerivedDefinition,
  EditorSchemaElement,
  EditorSchemaExtension,
  EditorSchemaExtensionProvider,
  EditorExtensionPortal,
  EditorExtensionReference,
  EditorExtensionCapabilities,
  EditorStateView,
  EditorStateViewProvider,
  EditorStateSchemaApi,
  EditorExtensionTypeProvider,
  EditorReadMethods,
  EditorTransactionSpecBuilder,
  EditorUpdateTransaction,
  EditorUpdateTransactionProvider,
  EditorUpdateContext,
  EditorUpdateMethods,
  EditorUpdatePolicy,
  EditorValueFromExtensions,
  Element,
  NodeInsertNodesOptions,
  NodeRemoveNodesOptions,
  NodeSetNodesOptions,
  PropertyValueDescriptor,
  PropertyValueOf,
  SchemaContentRootContribution,
  SchemaElement,
  SchemaElementConstructionPropertiesFor,
  SchemaElementFor,
  SchemaElementPropertiesFor,
  SchemaElementProperty,
  SchemaElementTypes,
  SchemaProperty,
  SchemaText,
  SchemaTextProperties,
  SchemaExtensionsOf,
  SchemaTypesTarget,
  TransactionSpec,
  Value,
} from '@platejs/plite';
import type { UnionToIntersection } from '@udecode/utils';
import type {
  EditorSchemaSourceProvider,
  EditorExtensionDependencyReferenceFor,
  InternalEditorExtensionInstalledCapabilitiesOf,
} from '@platejs/plite/internal';

import type { AnyBasePlugin } from '../plugin/BasePlugin';
import type {
  AnyBasePluginDefinition,
  InferApi,
  InferDependencyDefinitions,
  InferDependencies,
  InferEnabled,
  InferRead,
  InferTargetPlugins,
  InferUpdate,
  PluginDependencySource,
  PluginReference,
} from '../plugin/PluginDefinition';
import type { InternalPluginDefinitionOf } from '../plugin/pluginDefinitionLookup.internal';
import type {
  InferExactPluginSchemaContribution,
  InferPluginElementType,
} from '../plugin/pluginSchemaModel.internal';
import type {
  CoreEditorApi,
  CoreEditorRead,
  CoreEditorTransaction,
  CoreEditorUpdate,
} from './coreEditorCapabilityDefinition.internal';
import type { CorePluginDefinition } from '../plugins/getCorePlugins';

export type BasePluginInput = AnyBasePlugin | AnyBasePluginDefinition;

type PluginDefinitionOf<P> =
  InternalPluginDefinitionOf<P> extends infer D
    ? [D] extends [never]
      ? P extends AnyBasePluginDefinition
        ? P
        : P extends AnyBasePlugin
          ? AnyBasePluginDefinition
          : never
      : Extract<D, AnyBasePluginDefinition>
    : never;

type IsAny<T> = 0 extends 1 & T ? true : false;

type InstalledNames<D> =
  D extends Readonly<{ name: infer TName extends string }> ? TName : never;

type ExcludeInstalledNames<D, TNames extends PropertyKey> =
  D extends Readonly<{ name: infer TName extends PropertyKey }>
    ? TName extends TNames
      ? never
      : D
    : D;

export type MergeInstalledPluginDefinitions<D, TOverrides> =
  | ExcludeInstalledNames<D, InstalledNames<TOverrides>>
  | TOverrides;

type ExactName<D extends AnyBasePluginDefinition> =
  IsAny<D['name']> extends true
    ? never
    : string extends D['name']
      ? never
      : D['name'];

type NormalizeInstalledCapability<
  TCapability,
  TElementType extends string = TCapability extends Readonly<{
    elementType: infer TExistingElementType extends string;
  }>
    ? TExistingElementType
    : string,
> =
  TCapability extends Readonly<{ name: infer TName extends string }>
    ? Readonly<{ elementType: TElementType; name: TName }> &
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
          schemaContribution: infer TProvider extends
            () => EditorSchemaContribution;
        }>
          ? Readonly<{ schemaContribution: TProvider }>
          : TCapability extends Readonly<{
                schemaContribution: infer TContribution extends
                  EditorSchemaContribution;
              }>
            ? Readonly<{ schemaContribution: () => TContribution }>
            : TCapability extends Readonly<{
                  schema: infer TSchema extends EditorSchemaContribution;
                }>
              ? Readonly<{ schemaContribution: () => TSchema }>
              : {}) &
        (TCapability extends Readonly<{
          targetPlugins: infer TTargetPlugins extends readonly (
            | PluginReference
            | string
          )[];
        }>
          ? Readonly<{ targetPlugins: TTargetPlugins }>
          : {}) &
        (TCapability extends Readonly<{ type: infer TType extends string }>
          ? Readonly<{ type: TType }>
          : {}) &
        (TCapability extends Readonly<{ update: infer TUpdate extends object }>
          ? Readonly<{ update: TUpdate }>
          : {})
    : never;

type CompactAuthoredPluginDefinition<D extends AnyBasePluginDefinition> =
  Readonly<{ name: D['name'] }> &
    ([InferPluginElementType<D>] extends [never]
      ? {}
      : Readonly<{ elementType: InferPluginElementType<D> }>) &
    ([keyof InferApi<D>] extends [never]
      ? {}
      : Readonly<{ api: InferApi<D> }>) &
    ([InferEnabled<D>] extends [boolean]
      ? {}
      : Readonly<{ enabled: InferEnabled<D> }>) &
    ([keyof InferRead<D>] extends [never]
      ? {}
      : Readonly<{ read: InferRead<D> }>) &
    Readonly<{
      schemaContribution: () => ExactSchemaContribution<D>;
    }> &
    ([InferTargetPlugins<D>] extends [readonly []]
      ? {}
      : Readonly<{ targetPlugins: InferTargetPlugins<D> }>) &
    ([keyof InferUpdate<D>] extends [never]
      ? {}
      : Readonly<{ update: InferUpdate<D> }>);

type DirectInstalledCapabilitiesOf<P> =
  InternalEditorExtensionInstalledCapabilitiesOf<P>;

type PliteInstalledCapabilitiesOf<P> = [
  DirectInstalledCapabilitiesOf<P>,
] extends [never]
  ? InternalEditorExtensionInstalledCapabilitiesOf<
      EditorExtensionDependencyReferenceFor<P>
    >
  : DirectInstalledCapabilitiesOf<P>;

type InferenceIdentityOf<P> =
  IsAny<P> extends true
    ? PluginDefinitionOf<P>
    : [PluginDependencySource<P>] extends [never]
      ? [DirectInstalledCapabilitiesOf<P>] extends [never]
        ? PluginDefinitionOf<P>
        : P extends Readonly<{ name: infer TName extends string }>
          ? Readonly<{ name: TName }> &
              (P extends Readonly<{ enabled: infer TEnabled extends boolean }>
                ? Readonly<{ enabled: TEnabled }>
                : {})
          : never
      : PluginDefinitionOf<PluginDependencySource<P>>;

type DirectInstalledCapability<P, D extends AnyBasePluginDefinition> = [
  PliteInstalledCapabilitiesOf<P>,
] extends [never]
  ? P extends Readonly<{ elementType: string }>
    ? D
    : never
  : NormalizeInstalledCapability<
      Extract<PliteInstalledCapabilitiesOf<P>, { name: D['name'] }>,
      P extends Readonly<{ type: infer TElementType extends string }>
        ? TElementType
        : InferPluginElementType<D>
    >;

type ExplicitNames<T extends readonly unknown[]> = T[number] extends infer P
  ? P extends unknown
    ? InferenceIdentityOf<P> extends infer D extends AnyBasePluginDefinition
      ? ExactName<D>
      : never
    : never
  : never;

type DisabledExplicitNames<T extends readonly unknown[]> =
  T[number] extends infer P
    ? P extends unknown
      ? InferenceIdentityOf<P> extends infer D extends AnyBasePluginDefinition
        ? IsLiteralDisabled<D> extends true
          ? ExactName<D>
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
        : CompactAuthoredPluginDefinition<D>;

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
  [PluginDependencySource<P>] extends [never]
    ? [PliteInstalledCapabilitiesOf<P>] extends [never]
      ? InferDependencyDefinitions<
          Readonly<{
            dependencies: readonly [
              Extract<P, EditorExtensionReference | PluginReference>,
            ];
            name: 'dependency';
          }>
        >
      : NormalizeInstalledCapability<PliteInstalledCapabilitiesOf<P>>
    : InferenceIdentityOf<P>
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
          | InferExplicitHiddenCapabilities<P, D, ExplicitNames, ExactName<D>>
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
  ? CompactAuthoredPluginDefinition<D>
  : Extract<DirectInstalledCapability<P, D>, AnyBasePluginDefinition>;

/**
 * Finite installed capability union derived tuple-first so explicit descriptors
 * shadow defaults. Authoring fields and dependency carriers are consumed during
 * traversal but never become part of the editor type.
 */
export type InferPlugins<T extends readonly unknown[]> =
  T[number] extends infer P
    ? P extends unknown
      ? InferExplicitPlugin<P, ExplicitNames<T>, DisabledExplicitNames<T>>
      : never
    : never;

type NormalizeInstalledRuntimeCapability<
  TCapability,
  TElementType extends string = TCapability extends Readonly<{
    elementType: infer TExistingElementType extends string;
  }>
    ? TExistingElementType
    : string,
> =
  TCapability extends Readonly<{ name: infer TName extends string }>
    ? Readonly<{ elementType: TElementType; name: TName }> &
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
        (TCapability extends Readonly<{ update: infer TUpdate extends object }>
          ? Readonly<{ update: TUpdate }>
          : {})
    : never;

type CompactAuthoredRuntimePluginDefinition<D extends AnyBasePluginDefinition> =
  Readonly<{ name: D['name'] }> &
    ([keyof InferApi<D>] extends [never]
      ? {}
      : Readonly<{ api: InferApi<D> }>) &
    ([InferEnabled<D>] extends [boolean]
      ? {}
      : Readonly<{ enabled: InferEnabled<D> }>) &
    ([keyof InferRead<D>] extends [never]
      ? {}
      : Readonly<{ read: InferRead<D> }>) &
    ([keyof InferUpdate<D>] extends [never]
      ? {}
      : Readonly<{ update: InferUpdate<D> }>);

type DirectInstalledRuntimeCapability<P, D extends AnyBasePluginDefinition> = [
  PliteInstalledCapabilitiesOf<P>,
] extends [never]
  ? P extends Readonly<{ elementType: string }>
    ? CompactAuthoredRuntimePluginDefinition<D>
    : never
  : NormalizeInstalledRuntimeCapability<
      Extract<PliteInstalledCapabilitiesOf<P>, { name: D['name'] }>,
      P extends Readonly<{ type: infer TElementType extends string }>
        ? TElementType
        : InferPluginElementType<D>
    >;

type InferHiddenRuntimeCapability<
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
        : CompactAuthoredRuntimePluginDefinition<D>;

type InferHiddenRuntimeDependencies<
  D extends AnyBasePluginDefinition,
  ExplicitNames extends PropertyKey,
  Seen extends PropertyKey,
> = InferDependencies<D>[number] extends infer P
  ? P extends unknown
    ? InferHiddenRuntimeDependency<P, ExplicitNames, Seen>
    : never
  : never;

type InferHiddenRuntimeDependency<
  P,
  ExplicitNames extends PropertyKey,
  Seen extends PropertyKey,
> = (
  [PluginDependencySource<P>] extends [never]
    ? [PliteInstalledCapabilitiesOf<P>] extends [never]
      ? InferenceIdentityOf<P>
      : NormalizeInstalledRuntimeCapability<PliteInstalledCapabilitiesOf<P>>
    : InferenceIdentityOf<P>
) extends infer D
  ? D extends AnyBasePluginDefinition
    ? D['name'] extends Seen
      ? never
      :
          | InferHiddenRuntimeCapability<D, ExplicitNames, Seen>
          | InferHiddenRuntimeDependencies<
              D,
              ExplicitNames,
              Seen | ExactName<D>
            >
    : never
  : never;

type InferExplicitRuntimeHiddenCapabilities<
  P,
  D extends AnyBasePluginDefinition,
  ExplicitNames extends PropertyKey,
  Seen extends PropertyKey,
> = [DirectInstalledCapabilitiesOf<P>] extends [never]
  ? InferHiddenRuntimeDependencies<D, ExplicitNames, Seen>
  : NormalizeInstalledRuntimeCapability<
        PliteInstalledCapabilitiesOf<P>
      > extends infer TCapability
    ? TCapability extends AnyBasePluginDefinition
      ? InferHiddenRuntimeCapability<TCapability, ExplicitNames, Seen>
      : never
    : never;

type InferExplicitRuntimePlugin<
  P,
  ExplicitNames extends PropertyKey,
  DisabledNames extends PropertyKey,
> =
  InferenceIdentityOf<P> extends infer D extends AnyBasePluginDefinition
    ? D['name'] extends DisabledNames
      ? never
      :
          | ([DirectInstalledRuntimeCapability<P, D>] extends [never]
              ? CompactAuthoredRuntimePluginDefinition<D>
              : Extract<
                  DirectInstalledRuntimeCapability<P, D>,
                  AnyBasePluginDefinition
                >)
          | InferExplicitRuntimeHiddenCapabilities<
              P,
              D,
              ExplicitNames,
              ExactName<D>
            >
    : never;

/** Installed editor capabilities without schema grammar payloads. */
export type InferRuntimePlugins<T extends readonly unknown[]> =
  T[number] extends infer P
    ? P extends unknown
      ? InferExplicitRuntimePlugin<
          P,
          ExplicitNames<T>,
          DisabledExplicitNames<T>
        >
      : never
    : never;

type InferDirectRuntimePlugin<
  P,
  ExplicitNames extends PropertyKey,
  DisabledNames extends PropertyKey,
> =
  PluginDefinitionOf<P> extends infer D extends AnyBasePluginDefinition
    ? D['name'] extends DisabledNames
      ? never
      : IsLiteralDisabled<D> extends true
        ? never
        :
            | CompactAuthoredRuntimePluginDefinition<D>
            | (InferDependencyDefinitions<D> extends infer TDependency
                ? TDependency extends AnyBasePluginDefinition
                  ? TDependency['name'] extends DisabledNames
                    ? never
                    : string extends ExplicitNames
                      ? CompactAuthoredRuntimePluginDefinition<TDependency>
                      : TDependency['name'] extends ExplicitNames
                        ? never
                        : CompactAuthoredRuntimePluginDefinition<TDependency>
                  : never
                : never)
    : never;

/**
 * Compact public editor capabilities from explicitly installed plugins.
 * Dependency descriptors remain available through their owning plugin portals.
 */
export type InferEditorRuntimePlugins<T extends readonly unknown[]> =
  T[number] extends infer P
    ? P extends unknown
      ? InferDirectRuntimePlugin<P, ExplicitNames<T>, DisabledExplicitNames<T>>
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
    ? AnyBasePluginDefinition
    : true extends IsBroadPluginDefinition<P>
      ?
          | Extract<P, AnyBasePluginDefinition>
          | InferDependencyDefinitions<Extract<P, AnyBasePluginDefinition>>
      : InferPlugins<readonly [P]>;

type InstalledRuntimePluginDefinitions<P> = InferRuntimePlugins<readonly [P]>;

type InferApiGroup<D> = [D] extends [never]
  ? never
  : D extends AnyBasePluginDefinition
    ? keyof InferApi<D> extends never
      ? never
      : {
          readonly [K in ExactName<D>]: InferApi<D>;
        }
    : never;

type InferReadGroup<D> = [D] extends [never]
  ? never
  : D extends AnyBasePluginDefinition
    ? keyof InferRead<D> extends never
      ? never
      : {
          readonly [K in ExactName<D>]: InferRead<D>;
        }
    : never;

type InstalledSchemaDefinitionsOf<D> =
  D extends InternalInstalledSchemaDefinitionsProvider<infer TDefinitions>
    ? TDefinitions
    : D;

type EditorElementMutation = Readonly<{
  construction: object;
  properties: object;
}>;

type GeneratedElementUpdate<
  TMutations,
  TPlugin extends AnyBasePluginDefinition,
> = TPlugin['name'] extends infer TName extends keyof TMutations
  ? TMutations[TName] extends infer TMutation extends EditorElementMutation
    ? Readonly<{
        insert: {} extends TMutation['construction']
          ? (
              properties?: TMutation['construction'],
              options?: Omit<NodeInsertNodesOptions<Element>, 'match'>
            ) => void
          : (
              properties: TMutation['construction'],
              options?: Omit<NodeInsertNodesOptions<Element>, 'match'>
            ) => void;
        remove: (
          options?: Omit<NodeRemoveNodesOptions<Element>, 'match'>
        ) => void;
        set: (
          properties: Partial<TMutation['properties']>,
          options?: Omit<NodeSetNodesOptions<Element>, 'match'>
        ) => void;
      }>
    : {}
  : {};

type SchemaPluginDefinitionForRuntimePlugin<TSchemaDefinitions, D> =
  D extends Readonly<{ name: infer TName extends string }>
    ? Extract<InstalledSchemaDefinitionsOf<TSchemaDefinitions>, { name: TName }>
    : never;

type DefaultElementUpdate<
  TSchemaDefinitions,
  TPlugin extends AnyBasePluginDefinition,
> =
  TSchemaDefinitions extends InternalEditorMutationProvider<infer TMutations>
    ? GeneratedElementUpdate<TMutations, TPlugin>
    : [ElementPluginDefinition<TPlugin>] extends [never]
      ? {}
      : InstalledPluginElementType<TPlugin> extends infer TType extends string
        ? TType extends SchemaElementTypes<
            PlateSchemaSourceForInstalledDefinitions<
              InstalledSchemaDefinitionsOf<TSchemaDefinitions>
            >
          >
          ? Readonly<{
              insert: {} extends SchemaElementConstructionPropertiesFor<
                PlateSchemaSourceForInstalledDefinitions<
                  InstalledSchemaDefinitionsOf<TSchemaDefinitions>
                >,
                TType
              >
                ? (
                    properties?: SchemaElementConstructionPropertiesFor<
                      PlateSchemaSourceForInstalledDefinitions<
                        InstalledSchemaDefinitionsOf<TSchemaDefinitions>
                      >,
                      TType
                    >,
                    options?: Omit<NodeInsertNodesOptions<Element>, 'match'>
                  ) => void
                : (
                    properties: SchemaElementConstructionPropertiesFor<
                      PlateSchemaSourceForInstalledDefinitions<
                        InstalledSchemaDefinitionsOf<TSchemaDefinitions>
                      >,
                      TType
                    >,
                    options?: Omit<NodeInsertNodesOptions<Element>, 'match'>
                  ) => void;
              remove: (
                options?: Omit<NodeRemoveNodesOptions<Element>, 'match'>
              ) => void;
              set: (
                properties: Partial<
                  SchemaElementPropertiesFor<
                    PlateSchemaSourceForInstalledDefinitions<
                      InstalledSchemaDefinitionsOf<TSchemaDefinitions>
                    >,
                    TType
                  >
                >,
                options?: Omit<NodeSetNodesOptions<Element>, 'match'>
              ) => void;
            }>
          : {}
        : {};

type PluginUpdate<TSchemaDefinitions, D extends AnyBasePluginDefinition> = Omit<
  DefaultElementUpdate<
    TSchemaDefinitions,
    TSchemaDefinitions extends InternalEditorMutationProvider<unknown>
      ? D
      : SchemaPluginDefinitionForRuntimePlugin<TSchemaDefinitions, D>
  >,
  keyof InferUpdate<D>
> &
  InferUpdate<D>;

type InferUpdateGroup<D, TSchemaDefinitions = D> = [D] extends [never]
  ? never
  : D extends AnyBasePluginDefinition
    ? keyof PluginUpdate<TSchemaDefinitions, D> extends never
      ? never
      : {
          readonly [K in ExactName<D>]: PluginUpdate<TSchemaDefinitions, D>;
        }
    : never;

type InferTransactionGroup<D, TSchemaDefinitions = D> = [D] extends [never]
  ? never
  : D extends AnyBasePluginDefinition
    ? keyof (InferRead<D> & PluginUpdate<TSchemaDefinitions, D>) extends never
      ? never
      : {
          readonly [K in ExactName<D>]: InferRead<D> &
            PluginUpdate<TSchemaDefinitions, D>;
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
    schemaContribution: infer TContribution;
  }>
    ? TContribution extends () => infer TResult
      ? Extract<TResult, EditorSchemaContribution>
      : Extract<TContribution, EditorSchemaContribution>
    : C extends AnyBasePluginDefinition
      ? InferExactPluginSchemaContribution<C>
      : never;

type SchemaContributionElements<TContribution> =
  TContribution extends Readonly<{ elements?: infer TElements }>
    ? Extract<NonNullable<TElements>, Readonly<Record<string, SchemaElement>>>
    : never;

type InstalledPluginElementType<C extends AnyBasePluginDefinition> =
  C extends Readonly<{ elementType: infer TElementType extends string }>
    ? TElementType
    : [InferPluginElementType<C>] extends [never]
      ? C['name'] extends keyof SchemaContributionElements<
          ExactSchemaContribution<C>
        >
        ? C['name']
        : never
      : InferPluginElementType<C>;

type SchemaContributionProperty<TContribution> =
  TContribution extends Readonly<{
    properties?: readonly (infer TProperty)[];
  }>
    ? Extract<TProperty, SchemaProperty>
    : never;

type ExactSchemaPropertyKey<TProperty> =
  TProperty extends Readonly<{
    key: infer TKey extends string;
  }>
    ? string extends TKey
      ? never
      : TKey
    : never;

type RequiredSchemaPropertyKey<TProperty> =
  TProperty extends Readonly<{
    key: infer TKey extends string;
    value: infer TDescriptor;
  }>
    ? string extends TKey
      ? never
      : TDescriptor extends Readonly<{ required: true }>
        ? TKey
        : TDescriptor extends Readonly<{
              default: unknown;
              omitDefault: false;
            }>
          ? TKey
          : never
    : never;

type SchemaPropertyValueFor<TProperty, TKey extends string> =
  TProperty extends Readonly<{
    key: TKey;
    value: infer TDescriptor extends PropertyValueDescriptor;
  }>
    ? PropertyValueOf<TDescriptor>
    : never;

type SchemaPropertyRecord<TProperty> = Readonly<
  {
    [TKey in RequiredSchemaPropertyKey<TProperty>]: SchemaPropertyValueFor<
      TProperty,
      TKey
    >;
  } & {
    [TKey in Exclude<
      ExactSchemaPropertyKey<TProperty>,
      RequiredSchemaPropertyKey<TProperty>
    >]?: SchemaPropertyValueFor<TProperty, TKey>;
  }
>;

type RequiredDescriptorKey<TProperties> = {
  [TKey in Extract<
    keyof TProperties,
    string
  >]: TProperties[TKey] extends Readonly<{
    required: true;
  }>
    ? TKey
    : TProperties[TKey] extends Readonly<{
          default: unknown;
          omitDefault: false;
        }>
      ? TKey
      : never;
}[Extract<keyof TProperties, string>];

type SchemaDescriptorRecord<TProperties> =
  TProperties extends Readonly<Record<string, PropertyValueDescriptor>>
    ? Readonly<
        {
          [TKey in RequiredDescriptorKey<TProperties>]: PropertyValueOf<
            TProperties[TKey]
          >;
        } & {
          [TKey in Exclude<
            Extract<keyof TProperties, string>,
            RequiredDescriptorKey<TProperties>
          >]?: PropertyValueOf<TProperties[TKey]>;
        }
      >
    : Readonly<Record<never, never>>;

type SchemaElementDescriptorProperties<TElement> = [TElement] extends [never]
  ? Readonly<Record<never, never>>
  : TElement extends SchemaElement<infer TInput>
    ? TInput extends Readonly<{ properties: infer TProperties }>
      ? SchemaDescriptorRecord<TProperties>
      : Readonly<Record<never, never>>
    : Readonly<Record<never, never>>;

type SchemaContributionContentRoot<TContribution> =
  TContribution extends Readonly<{
    contentRoots?: readonly (infer TContentRoot)[];
  }>
    ? Extract<TContentRoot, SchemaContentRootContribution>
    : never;

type InstalledPluginDefinitionForName<
  D,
  TName extends string,
> = D extends AnyBasePluginDefinition
  ? D['name'] extends TName
    ? D
    : never
  : never;

type InstalledPluginElementTypeForName<D, TName extends string> =
  InstalledPluginDefinitionForName<D, TName> extends infer TDefinition
    ? TDefinition extends AnyBasePluginDefinition
      ? InstalledPluginElementType<TDefinition>
      : never
    : never;

type PluginReferenceName<TPlugin> =
  TPlugin extends PluginReference<infer TName>
    ? TName
    : Extract<TPlugin, string>;

type InstalledPluginElementTypesForPlugins<
  D,
  TPlugins extends readonly (PluginReference | string)[],
> = {
  readonly [TIndex in keyof TPlugins]: InstalledPluginElementTypeForName<
    D,
    PluginReferenceName<TPlugins[TIndex]>
  >;
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
        ? InferTargetPlugins<D> extends infer TPlugins extends readonly (
            | PluginReference
            | string
          )[]
          ? TPlugins extends readonly []
            ? TProperty
            : SchemaElementProperty<
                TKey,
                TDescriptor,
                SchemaTypesTarget<
                  InstalledPluginElementTypesForPlugins<
                    TInstalledDefinition,
                    TPlugins
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

type ResolvedSchemaContributionProperty<
  D,
  TInstalledDefinition = D,
> = D extends AnyBasePluginDefinition
  ? SchemaContributionProperty<
      ExactSchemaContribution<D>
    > extends infer TProperty
    ? ExactComposedSchemaProperty<
        ResolvePluginTargetProperty<TInstalledDefinition, D, TProperty>
      >
    : never
  : never;

type PlateRawSchemaDeclaration<D> =
  true extends IsBroadPluginDefinition<D>
    ? EditorSchemaContribution
    : EditorSchemaContribution<
        MergeObjectIntersection<
          SchemaContributionElements<ExactSchemaContribution<D>>
        >,
        readonly ResolvedSchemaContributionProperty<D>[],
        NonNullable<EditorSchemaContribution['groups']>,
        NonNullable<EditorSchemaContribution['roots']>,
        readonly SchemaContributionContentRoot<ExactSchemaContribution<D>>[]
      >;

type PlateSchemaDefinition<D> = EditorSchemaDerivedDefinition<
  NonNullable<PlateRawSchemaDeclaration<D>['elements']>,
  NonNullable<PlateRawSchemaDeclaration<D>['properties']>,
  NonNullable<PlateRawSchemaDeclaration<D>['groups']>,
  NonNullable<PlateRawSchemaDeclaration<D>['roots']>,
  NonNullable<PlateRawSchemaDeclaration<D>['contentRoots']>
>;

type PlateSchemaExtension<D> = EditorSchemaExtension<
  PlateSchemaDefinition<D>,
  'plate'
>;

type PlateDependencySchemaProviders<TDependencies extends readonly unknown[]> =
  {
    readonly [TIndex in keyof TDependencies]: TDependencies[TIndex] extends EditorSchemaExtensionProvider<
      infer TSchema
    >
      ? EditorSchemaExtensionProvider<TSchema>
      : never;
  };

/** @internal Complete installed schema carried by one concrete descriptor. */
export type InternalPlateSchemaExtensionForPlugin<
  P extends AnyBasePluginDefinition,
> = SchemaExtensionsOf<
  readonly [
    EditorSchemaExtensionProvider<PlateSchemaExtension<P>>,
    ...PlateDependencySchemaProviders<InferDependencies<P>>,
  ]
>;

type PlateSchemaSourceForInstalledDefinitions<D> = EditorSchemaSourceProvider<
  PlateRawSchemaDeclaration<D>
>;

export type PlateSchemaSource<P> = PlateSchemaSourceForInstalledDefinitions<
  InstalledPluginDefinition<P>
>;

/** @internal Property-only projection used by the offline declaration emitter. */
export type InternalEditorDefinitionElementProperties<
  TPlugins extends readonly unknown[],
  TName extends string,
  TDefinitions = MergeInstalledPluginDefinitions<
    CorePluginDefinition,
    InferPlugins<TPlugins>
  >,
  TPlugin = Extract<TDefinitions, { name: TName }>,
> = TPlugin extends AnyBasePluginDefinition
  ? InstalledPluginElementType<TPlugin> extends infer TType extends string
    ? TType extends SchemaElementTypes<
        PlateSchemaSourceForInstalledDefinitions<TDefinitions>
      >
      ? SchemaElementPropertiesFor<
          PlateSchemaSourceForInstalledDefinitions<TDefinitions>,
          TType
        >
      : Readonly<Record<never, never>>
    : Readonly<Record<never, never>>
  : Readonly<Record<never, never>>;

/** @internal Property types declared by one plugin, independent of runtime targets. */
export type InternalEditorDefinitionOwnedElementProperties<
  TPlugins extends readonly unknown[],
  TName extends string,
  TDefinitions = MergeInstalledPluginDefinitions<
    CorePluginDefinition,
    InferPlugins<TPlugins>
  >,
  TPlugin = Extract<TDefinitions, { name: TName }>,
> = TPlugin extends AnyBasePluginDefinition
  ? ExactSchemaContribution<TPlugin> extends infer TContribution
    ? Materialize<
        SchemaElementDescriptorProperties<
          SchemaContributionElements<TContribution> extends infer TElements
            ? TElements extends Readonly<Record<string, SchemaElement>>
              ? InstalledPluginElementType<TPlugin> extends keyof TElements
                ? TElements[InstalledPluginElementType<TPlugin>]
                : never
              : never
            : never
        > &
          SchemaPropertyRecord<
            SchemaContributionProperty<TContribution> extends infer TProperty
              ? TProperty extends SchemaElementProperty
                ? TProperty
                : never
              : never
          >
      >
    : Readonly<Record<never, never>>
  : Readonly<Record<never, never>>;

/** @internal Text-property projection used by the offline declaration emitter. */
export type InternalEditorDefinitionTextProperties<
  TPlugins extends readonly unknown[],
> = SchemaTextProperties<
  PlateSchemaSourceForInstalledDefinitions<
    MergeInstalledPluginDefinitions<
      CorePluginDefinition,
      InferPlugins<TPlugins>
    >
  >
>;

type ElementPluginDefinition<D extends AnyBasePluginDefinition> =
  D extends unknown
    ? SchemaContributionElements<
        ExactSchemaContribution<D>
      > extends infer TElements
      ? [TElements] extends [never]
        ? never
        : InstalledPluginElementType<D> extends keyof TElements
          ? D
          : never
      : never
    : never;

type EditorDefinitionElementMutation<D extends AnyBasePluginDefinition> = [
  ElementPluginDefinition<D>,
] extends [never]
  ? never
  : InstalledPluginElementType<D> extends infer TType extends string
    ? TType extends SchemaElementTypes<
        PlateSchemaSourceForInstalledDefinitions<D>
      >
      ? Readonly<{
          construction: SchemaElementConstructionPropertiesFor<
            PlateSchemaSourceForInstalledDefinitions<D>,
            TType
          >;
          properties: SchemaElementPropertiesFor<
            PlateSchemaSourceForInstalledDefinitions<D>,
            TType
          >;
        }>
      : never
    : never;

type EditorDefinitionMutationsFromDefinitions<TDefinitions> = Materialize<
  MergeObjectIntersection<
    TDefinitions extends infer D extends AnyBasePluginDefinition
      ? EditorDefinitionElementMutation<D> extends infer TMutation
        ? [TMutation] extends [never]
          ? never
          : Readonly<{ [TName in D['name']]: TMutation }>
        : never
      : never
  >
>;

/** @internal Descriptor-local mutation types for an authored raw editor kit. */
export type InternalEditorDefinitionMutations<
  TPlugins extends readonly unknown[],
  TDefinitions = MergeInstalledPluginDefinitions<
    CorePluginDefinition,
    InferPlugins<TPlugins>
  >,
> = EditorDefinitionMutationsFromDefinitions<TDefinitions>;

type DescriptorPluginDefinition<P> = Extract<
  PluginDefinitionOf<P>,
  AnyBasePluginDefinition
>;

type RawEditorMutationForPlugin<TPlugin> = EditorDefinitionElementMutation<
  DescriptorPluginDefinition<TPlugin>
>;

type RawElementPluginGuard<TPlugin> = [
  RawEditorMutationForPlugin<TPlugin>,
] extends [never]
  ? never
  : unknown;

/** @internal Lazy installed-schema witness for compact editor projections. */
export interface InternalInstalledSchemaDefinitionsProvider<D> {
  readonly definitions: () => D;
}

/** @internal Descriptor-bound mutation projection for raw and generated kits. */
export interface InternalEditorMutationProvider<TMutations> {
  readonly mutations: () => TMutations;
}

type EditorMutationForPlugin<TMutations, TPlugin> =
  DescriptorPluginDefinition<TPlugin>['name'] extends infer TName extends
    keyof TMutations
    ? TMutations[TName] extends EditorElementMutation
      ? TMutations[TName]
      : never
    : never;

type MutationPluginGuard<TMutations, TPlugin> = [
  EditorMutationForPlugin<TMutations, TPlugin>,
] extends [never]
  ? never
  : unknown;

type PlateMutationSchemaCreate<TMutations> = (<
  const TPlugin extends PluginReference & Readonly<{ type: string }>,
>(
  plugin: TPlugin & NoInfer<MutationPluginGuard<TMutations, TPlugin>>,
  ...properties: EditorMutationForPlugin<
    TMutations,
    TPlugin
  > extends infer TMutation extends EditorElementMutation
    ? {} extends TMutation['construction']
      ? [properties?: NoInfer<TMutation['construction']>]
      : [properties: NoInfer<TMutation['construction']>]
    : never
) => Element &
  Readonly<{ type: TPlugin['type'] }> &
  EditorMutationForPlugin<TMutations, TPlugin>['properties']) &
  EditorStateSchemaApi['create'];

type PlateMutationSchemaElement<TMutations> = (<
  const TPlugin extends PluginReference,
>(
  plugin: TPlugin & NoInfer<MutationPluginGuard<TMutations, TPlugin>>
) => EditorSchemaElement | null) &
  EditorStateSchemaApi['element'];

type PlateMutationSchemaAllowsElementType<TMutations> = (<
  const TParent extends PluginReference,
  const TChild extends PluginReference,
>(
  parent: TParent & NoInfer<MutationPluginGuard<TMutations, TParent>>,
  child: TChild & NoInfer<MutationPluginGuard<TMutations, TChild>>
) => boolean) &
  EditorStateSchemaApi['allowsElementType'];

type PlateMutationSchemaIsElementTypeInGroup<TMutations> = (<
  const TPlugin extends PluginReference,
>(
  plugin: TPlugin & NoInfer<MutationPluginGuard<TMutations, TPlugin>>,
  group: string
) => boolean) &
  EditorStateSchemaApi['isElementTypeInGroup'];

type PlateMutationStateSchemaApi<
  V extends Value,
  TMutations,
> = keyof TMutations extends never
  ? EditorStateSchemaApi<V>
  : Omit<
      EditorStateSchemaApi<V>,
      'allowsElementType' | 'create' | 'element' | 'isElementTypeInGroup'
    > & {
      allowsElementType: PlateMutationSchemaAllowsElementType<TMutations>;
      create: PlateMutationSchemaCreate<TMutations>;
      element: PlateMutationSchemaElement<TMutations>;
      isElementTypeInGroup: PlateMutationSchemaIsElementTypeInGroup<TMutations>;
    };

type PlateRawSchemaCreate = (<
  const TPlugin extends PluginReference & Readonly<{ type: string }>,
>(
  plugin: TPlugin & NoInfer<RawElementPluginGuard<TPlugin>>,
  ...properties: RawEditorMutationForPlugin<TPlugin> extends infer TMutation extends
    EditorElementMutation
    ? {} extends TMutation['construction']
      ? [properties?: NoInfer<TMutation['construction']>]
      : [properties: NoInfer<TMutation['construction']>]
    : never
) => Element &
  Readonly<{ type: TPlugin['type'] }> &
  RawEditorMutationForPlugin<TPlugin>['properties']) &
  EditorStateSchemaApi['create'];

type PlateRawSchemaElement = (<const TPlugin extends PluginReference>(
  plugin: TPlugin & NoInfer<RawElementPluginGuard<TPlugin>>
) => EditorSchemaElement | null) &
  EditorStateSchemaApi['element'];

type PlateRawSchemaAllowsElementType = (<
  const TParent extends PluginReference,
  const TChild extends PluginReference,
>(
  parent: TParent & NoInfer<RawElementPluginGuard<TParent>>,
  child: TChild & NoInfer<RawElementPluginGuard<TChild>>
) => boolean) &
  EditorStateSchemaApi['allowsElementType'];

type PlateRawSchemaIsElementTypeInGroup = (<
  const TPlugin extends PluginReference,
>(
  plugin: TPlugin & NoInfer<RawElementPluginGuard<TPlugin>>,
  group: string
) => boolean) &
  EditorStateSchemaApi['isElementTypeInGroup'];

type PlateRawStateSchemaApi<V extends Value> = Omit<
  EditorStateSchemaApi<V>,
  'allowsElementType' | 'create' | 'element' | 'isElementTypeInGroup'
> & {
  allowsElementType: PlateRawSchemaAllowsElementType;
  create: PlateRawSchemaCreate;
  element: PlateRawSchemaElement;
  isElementTypeInGroup: PlateRawSchemaIsElementTypeInGroup;
};

type PlateEditorStateSchemaApi<V extends Value, D> =
  IsAny<D> extends true
    ? EditorStateSchemaApi<V>
    : D extends InternalEditorMutationProvider<infer TMutations>
      ? PlateMutationStateSchemaApi<V, TMutations>
      : PlateRawStateSchemaApi<V>;

type InstalledPluginApi<D> =
  IsAny<D> extends true
    ? Record<string, any>
    : MergeObjectIntersection<InferApiGroup<D>>;

type InstalledPluginRead<D> =
  IsAny<D> extends true
    ? Record<string, any>
    : MergeObjectIntersection<InferReadGroup<D>>;

type InstalledPluginTransaction<D, TSchemaDefinitions = D> =
  IsAny<D> extends true
    ? Record<string, any>
    : MergeObjectIntersection<InferTransactionGroup<D, TSchemaDefinitions>>;

type InstalledPluginUpdate<D, TSchemaDefinitions = D> =
  IsAny<D> extends true
    ? Record<string, any>
    : MergeObjectIntersection<InferUpdateGroup<D, TSchemaDefinitions>>;

type MergeCapabilityGroups<TBase, TOverrides> = Omit<TBase, keyof TOverrides> &
  TOverrides;

type SpecializeCoreEditorApi<TApi, V extends Value> = Omit<TApi, 'html'> & {
  html: TApi extends Readonly<{ html: infer THtml extends object }>
    ? THtml extends Readonly<{ deserialize: (...args: any[]) => unknown }>
      ? Omit<THtml, keyof CoreEditorApi['html']> & CoreEditorApi<V>['html']
      : THtml
    : CoreEditorApi<V>['html'];
};

type PlateEditorApi<V extends Value, D> = Readonly<
  SpecializeCoreEditorApi<
    MergeCapabilityGroups<CoreEditorApi, InstalledPluginApi<D>>,
    V
  >
>;

type PlateSchemaInstalledExtension<D> = {
  name: 'plate';
} & EditorSchemaExtensionProvider<PlateSchemaExtension<D>>;

type PlateInstalledExtension<V extends Value, D, S = D> = Readonly<{
  name: 'plate';
}> &
  EditorExtensionTypeProvider<
    EditorExtensionCapabilities<{
      api: PlateEditorApi<V, D>;
      read: MergeCapabilityGroups<CoreEditorRead, InstalledPluginRead<D>>;
      update: MergeCapabilityGroups<
        CoreEditorUpdate,
        InstalledPluginUpdate<D, S>
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

type PlatePluginDependencyExtension<D, S = D> = {
  name: 'plate-dependencies';
} & EditorExtensionTypeProvider<
  EditorExtensionCapabilities<{
    api: InstalledPluginApi<D>;
    read: InstalledPluginRead<D>;
    update: InstalledPluginUpdate<D, S>;
  }>
>;

type PlateTransactionExtension<D, S = D> = {
  name: 'plate-transaction';
} & EditorExtensionTypeProvider<
  EditorExtensionCapabilities<{
    update: MergeCapabilityGroups<
      CoreEditorTransaction,
      InstalledPluginTransaction<D, S>
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
  S = D,
> = EditorTransactionSpecBuilder<V, readonly [PlateTransactionExtension<D, S>]>;

type PlateEditorStateView<V extends Value, D, S = D> = EditorReadMethods<
  V,
  readonly [PlateInstalledExtension<V, D, S>]
> & {
  transaction: BivariantFunction<
    (
      fn: (transaction: PlateEditorTransactionBuilder<V, D, S>) => void
    ) => TransactionSpec
  > & {
    extend: BivariantFunction<
      (
        base: TransactionSpec,
        fn: (transaction: PlateEditorTransactionBuilder<V, D, S>) => void
      ) => TransactionSpec
    >;
  };
};

/** Installed editor state visible while a plugin registers editor behavior. */
export type PlatePluginState<P extends AnyBasePluginDefinition> =
  PlateEditorStateView<
    Value,
    InstalledRuntimePluginDefinitions<P>,
    InstalledRuntimePluginDefinitions<P>
  >;

type PlateEditorRead<V extends Value, D, S = D> = EditorReadMethods<
  V,
  readonly [PlateInstalledExtension<V, D, S>]
> &
  (<T>(fn: (state: PlateEditorStateView<V, D, S>) => T) => T);

type PlateEditorUpdate<V extends Value, D, S = D> = {
  <TTx extends object = {}>(
    fn: (
      transaction: EditorUpdateTransaction<
        V,
        readonly [PlateTransactionExtension<D, S>]
      > &
        TTx,
      context: EditorUpdateContext<
        PliteRuntimeBaseEditor<V, readonly [PlateInstalledExtension<V, D, S>]>
      >
    ) => void
  ): void;
  <TTx extends object = {}>(
    policy: EditorUpdatePolicy,
    fn: (
      transaction: EditorUpdateTransaction<
        V,
        readonly [PlateTransactionExtension<D, S>]
      > &
        TTx,
      context: EditorUpdateContext<
        PliteRuntimeBaseEditor<V, readonly [PlateInstalledExtension<V, D, S>]>
      >
    ) => void
  ): void;
  (
    policy: EditorUpdatePolicy
  ): EditorUpdateMethods<V, readonly [PlateInstalledExtension<V, D, S>]>;
} & EditorUpdateMethods<V, readonly [PlateInstalledExtension<V, D, S>]>;

/** Dependency capabilities visible while a plugin registers editor behavior. */
type PlatePluginExtensionEditorForInstalledDefinitions<D> =
  PliteRuntimeBaseEditor<Value, readonly [PlatePluginDependencyExtension<D>]>;

export type PlatePluginExtensionEditor<P extends AnyBasePluginDefinition> =
  PlatePluginExtensionEditorForInstalledDefinitions<
    InstalledRuntimePluginDefinitions<P>
  >;

/** @internal Exact document value compiled from an installed Plate graph. */
export type InternalPlateValueWithInstalledDefinitions<D> =
  true extends IsBroadPluginDefinition<InstalledSchemaDefinitionsOf<D>>
    ? Value
    : EditorValueFromExtensions<
        readonly [
          PlateSchemaInstalledExtension<InstalledSchemaDefinitionsOf<D>>,
        ]
      >;

/** @internal Exact element vocabulary compiled from an installed Plate graph. */
export type InternalPlateElementWithInstalledDefinitions<D> =
  true extends IsBroadPluginDefinition<InstalledSchemaDefinitionsOf<D>>
    ? Element
    : Extract<
        SchemaElementFor<
          PlateSchemaSourceForInstalledDefinitions<
            InstalledSchemaDefinitionsOf<D>
          >
        >,
        Element
      >;

/** @internal Exact text vocabulary compiled from an installed Plate graph. */
export type InternalPlateTextWithInstalledDefinitions<D> =
  true extends IsBroadPluginDefinition<InstalledSchemaDefinitionsOf<D>>
    ? import('@platejs/plite').Text
    : Extract<
        SchemaText<
          PlateSchemaSourceForInstalledDefinitions<
            InstalledSchemaDefinitionsOf<D>
          >
        >,
        import('@platejs/plite').Text
      >;

type PlatePluginTransactionForInstalledDefinitions<D> = EditorUpdateTransaction<
  Value,
  readonly [PlateTransactionExtension<D>]
>;

export type PlatePluginTransaction<P extends AnyBasePluginDefinition> =
  PlatePluginTransactionForInstalledDefinitions<
    InstalledRuntimePluginDefinitions<P>
  >;

/** Installed state capabilities visible while a plugin constructs a read group. */
type PlatePluginReadStateForInstalledDefinitions<D> = EditorStateView<
  Value,
  readonly [PlatePluginDependencyExtension<D>]
>;

export type PlatePluginReadState<P extends AnyBasePluginDefinition> =
  PlatePluginReadStateForInstalledDefinitions<
    InstalledRuntimePluginDefinitions<P>
  >;

type PlateOwnInstalledExtension<P> = {
  name: 'plate';
} & EditorExtensionTypeProvider<
  EditorExtensionCapabilities<{
    update: Materialize<
      MergeObjectIntersection<
        InferUpdateGroup<
          OwnInferencePluginDefinition<P>,
          InstalledPluginDefinition<P>
        >
      >
    >;
  }>
>;

/** Update methods exposed directly by one plugin portal. */
export type PlatePluginUpdate<P extends AnyBasePluginDefinition> = Materialize<
  PluginUpdate<
    InternalEditorMutationProvider<
      EditorDefinitionMutationsFromDefinitions<
        Extract<OwnInferencePluginDefinition<P>, AnyBasePluginDefinition>
      >
    >,
    Extract<OwnInferencePluginDefinition<P>, AnyBasePluginDefinition>
  >
>;

export type PlatePluginOwnUpdate<P extends AnyBasePluginDefinition> =
  PliteRuntimeBaseEditor<
    Value,
    readonly [PlateInstalledExtension<Value, AnyBasePluginDefinition>]
  >['update'] &
    PliteRuntimeBaseEditor<
      Value,
      readonly [PlateOwnInstalledExtension<P>]
    >['update'];

/** @internal Editor projection for definitions already lowered by `InferPlugins`. */
export type InternalPliteEditorWithInstalledPlateDefinitions<
  V extends Value,
  D,
  S = D,
> = {
  api: PlateEditorApi<V, D>;
  extension: PlatePluginExtensionPortal<D> &
    PliteRuntimeBaseEditor<V>['extension'];
  read: PlateEditorRead<V, D, S> & {
    schema: PlateEditorStateSchemaApi<V, S>;
  };
  update: PlateEditorUpdate<V, D, S>;
} & EditorStateViewProvider<() => PlateEditorStateView<V, D, S>> &
  EditorUpdateTransactionProvider<
    () => EditorUpdateTransaction<V, readonly [PlateTransactionExtension<D, S>]>
  > &
  Omit<PliteRuntimeBaseEditor<V>, 'api' | 'extension' | 'read' | 'update'>;

export type PliteEditorWithPlatePlugins<
  V extends Value,
  P extends AnyBasePluginDefinition,
> = InternalPliteEditorWithInstalledPlateDefinitions<
  V,
  InstalledRuntimePluginDefinitions<P>,
  InstalledRuntimePluginDefinitions<P>
>;
