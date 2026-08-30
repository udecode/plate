import type {
  Editor as PliteRuntimeBaseEditor,
  EditorSchemaContribution,
  EditorSchemaDerivedDefinition,
  EditorSchemaElement,
  EditorSchemaExtension,
  EditorSchemaExtensionProvider,
  EditorToggleBlockOptions,
  EditorNodeUnsetOptions,
  EditorExtensionPortal,
  EditorExtensionReference,
  EditorExtensionCapabilities,
  EditorStateView,
  EditorStateViewProvider,
  EditorStateSchemaApi,
  EditorExtensionTypeProvider,
  EditorReadMethods,
  EditorInstalledUpdateGroups,
  EditorTransactionSpecBuilder,
  EditorUpdateTransaction,
  EditorUpdateTransactionProvider,
  EditorUpdateContext,
  EditorUpdateMethods,
  EditorUpdatePolicy,
  EditorValueTypeProvider,
  EditorValueFromExtensions,
  Descendant,
  Element,
  EditorAboveOptions,
  EditorBlockOptions,
  EditorLevelsOptions,
  EditorNextOptions,
  EditorNodeGetOptions,
  EditorNodesReadOptions,
  EditorParentOptions,
  EditorPreviousOptions,
  EditorSelectionBlockOptions,
  EditorSelection,
  EditorStateSelectionApi,
  EditorTransactionSelectionApi,
  Location,
  Node,
  NodeEntry,
  NodeMatch,
  NodeKey,
  NodeIn,
  NodeInsertNodesOptions,
  NodeRemoveNodesOptions,
  NodeSelection,
  NodeSetNodesOptions,
  NodeTarget,
  NodeTypeSelector,
  PropertyValueDescriptor,
  PropertyValueOf,
  PropertyOptionsOf,
  SchemaContentRootContribution,
  SchemaContent,
  SchemaElement,
  SchemaElementConstructionPropertiesFor,
  SchemaElementFor,
  SchemaElementPropertiesFor,
  SchemaElementProperty,
  SchemaElementTypes,
  SchemaProperty,
  SchemaPropertyHandle,
  SchemaText,
  SchemaTextProperties,
  SchemaExtensionsOf,
  SchemaTypesTarget,
  TransactionSpec,
  Value,
  EditorGenericMethod,
  EditorSchemaSourceProvider,
  EditorExtensionDependencyReferenceFor,
  EditorExtensionInstalledCapabilitiesOf,
} from 'plitejs';

import type { UnionToIntersection } from '../../internal/types';
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
  PluginSchemaDeclaration,
} from '../plugin/PluginDefinition';
import type { InternalPluginDefinitionOf } from '../plugin/pluginDefinitionLookup.internal';
import type {
  InferExactPluginSchemaContribution,
  InferPluginElementType,
  InferPluginMarkValue,
  InferPluginWritablePropertyEntries,
} from '../plugin/pluginSchemaModel.internal';
import type { CorePluginDefinition } from '../plugins/getCorePlugins';
import type {
  CoreEditorApi,
  CoreEditorRead,
  CoreEditorTransaction,
  CoreEditorUpdate,
} from './coreEditorCapabilityDefinition.internal';

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
  D extends Readonly<{
    name: infer TName extends string;
  }>
    ? TName
    : never;

type ExcludeInstalledNames<D, TNames extends PropertyKey> =
  D extends Readonly<{
    name: infer TName extends PropertyKey;
  }>
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

type InstalledCapabilityApi<TCapability> =
  TCapability extends Readonly<{ api: infer TApi extends object }>
    ? Readonly<{ api: TApi }>
    : {};

type InstalledCapabilityEnabled<TCapability> =
  TCapability extends Readonly<{
    enabled: infer TEnabled extends boolean;
  }>
    ? Readonly<{ enabled: TEnabled }>
    : {};

type InstalledCapabilityMarkValue<TCapability> =
  TCapability extends Readonly<{ markValue: infer TMarkValue }>
    ? Readonly<{ markValue: TMarkValue }>
    : {};

type InstalledCapabilityRead<TCapability> =
  TCapability extends Readonly<{ read: infer TRead extends object }>
    ? Readonly<{ read: TRead }>
    : {};

type InstalledCapabilitySchemaContribution<TCapability> =
  TCapability extends Readonly<{
    schemaContribution: (...args: never[]) => unknown;
  }>
    ? {}
    : TCapability extends Readonly<{
          schemaContribution: infer TContribution extends
            EditorSchemaContribution;
        }>
      ? Readonly<{ schemaContribution: () => TContribution }>
      : {};

type InstalledCapabilitySchemaDeclaration<TCapability> =
  TCapability extends Readonly<{ schemaContribution: unknown }>
    ? {}
    : TCapability extends Readonly<{
          schema: infer TSchema extends EditorSchemaContribution;
        }>
      ? Readonly<{ schemaContribution: () => TSchema }>
      : {};

type InstalledCapabilitySchemaProvider<TCapability> =
  TCapability extends Readonly<{
    schemaContribution: infer TProvider;
  }>
    ? TProvider extends () => EditorSchemaContribution
      ? Readonly<{ schemaContribution: TProvider }>
      : {}
    : {};

type InstalledCapabilityTargets<TCapability> =
  TCapability extends Readonly<{
    targetPlugins: infer TTargetPlugins extends ReadonlyArray<
      PluginReference | string
    >;
  }>
    ? Readonly<{ targetPlugins: TTargetPlugins }>
    : {};

type InstalledCapabilityType<TCapability> =
  TCapability extends Readonly<{ type: infer TType extends string }>
    ? Readonly<{ type: TType }>
    : {};

type InstalledCapabilityUpdate<TCapability> =
  TCapability extends Readonly<{ update: infer TUpdate extends object }>
    ? Readonly<{ update: TUpdate }>
    : {};

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
        InstalledCapabilityApi<TCapability> &
        InstalledCapabilityEnabled<TCapability> &
        InstalledCapabilityMarkValue<TCapability> &
        InstalledCapabilityRead<TCapability> &
        InstalledCapabilitySchemaContribution<TCapability> &
        InstalledCapabilitySchemaDeclaration<TCapability> &
        InstalledCapabilitySchemaProvider<TCapability> &
        InstalledCapabilityTargets<TCapability> &
        InstalledCapabilityType<TCapability> &
        InstalledCapabilityUpdate<TCapability>
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
    ([InferPluginMarkValue<D>] extends [never]
      ? {}
      : Readonly<{ markValue: InferPluginMarkValue<D> }>) &
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
  EditorExtensionInstalledCapabilitiesOf<P>;

type PliteInstalledCapabilitiesOf<P> = [
  DirectInstalledCapabilitiesOf<P>,
] extends [never]
  ? EditorExtensionInstalledCapabilitiesOf<
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
  innerExplicitNames extends PropertyKey,
  Seen extends PropertyKey,
> =
  IsBroadPluginDefinition<D> extends true
    ? never
    : D['name'] extends innerExplicitNames | Seen
      ? never
      : IsLiteralDisabled<D> extends true
        ? never
        : CompactAuthoredPluginDefinition<D>;

type InferHiddenDependencies<
  D extends AnyBasePluginDefinition,
  innerExplicitNames2 extends PropertyKey,
  Seen extends PropertyKey,
> = InferDependencies<D>[number] extends infer P
  ? P extends unknown
    ? InferHiddenDependency<P, innerExplicitNames2, Seen>
    : never
  : never;

type InferHiddenDependency<
  P,
  innerExplicitNames3 extends PropertyKey,
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
    ? InferHiddenCapability<D, innerExplicitNames3, Seen>
    : never
  : never;

type InferExplicitPlugin<
  P,
  innerExplicitNames4 extends PropertyKey,
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
              innerExplicitNames4,
              ExactName<D>
            >
    : never;

type InferExplicitHiddenCapabilities<
  P,
  D extends AnyBasePluginDefinition,
  innerExplicitNames5 extends PropertyKey,
  Seen extends PropertyKey,
> = [DirectInstalledCapabilitiesOf<P>] extends [never]
  ? InferHiddenDependencies<D, innerExplicitNames5, Seen>
  : NormalizeInstalledCapability<
        PliteInstalledCapabilitiesOf<P>
      > extends infer TCapability
    ? TCapability extends AnyBasePluginDefinition
      ? InferHiddenCapability<TCapability, innerExplicitNames5, Seen>
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
        (TCapability extends Readonly<{ markValue: infer TMarkValue }>
          ? Readonly<{ markValue: TMarkValue }>
          : {}) &
        (TCapability extends Readonly<{ update: infer TUpdate extends object }>
          ? Readonly<{ update: TUpdate }>
          : {})
    : never;

type PluginWritablePropertyProvider<D extends AnyBasePluginDefinition> =
  Readonly<{
    __pluginWritableProperties: D extends Readonly<{
      __pluginWritableProperties: infer TEntry;
    }>
      ? TEntry
      : InferPluginWritablePropertyEntries<D>;
  }>;

type CompactAuthoredRuntimePluginDefinition<D extends AnyBasePluginDefinition> =
  Readonly<{ name: D['name'] }> &
    PluginWritablePropertyProvider<D> &
    ([keyof InferApi<D>] extends [never]
      ? {}
      : Readonly<{ api: InferApi<D> }>) &
    ([InferEnabled<D>] extends [boolean]
      ? {}
      : Readonly<{ enabled: InferEnabled<D> }>) &
    ([keyof InferRead<D>] extends [never]
      ? {}
      : Readonly<{ read: InferRead<D> }>) &
    ([InferPluginMarkValue<D>] extends [never]
      ? {}
      : Readonly<{ markValue: InferPluginMarkValue<D> }>) &
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
    > &
      PluginWritablePropertyProvider<D>;

type InferHiddenRuntimeCapability<
  D extends AnyBasePluginDefinition,
  innerExplicitNames6 extends PropertyKey,
  Seen extends PropertyKey,
> =
  IsBroadPluginDefinition<D> extends true
    ? never
    : D['name'] extends innerExplicitNames6 | Seen
      ? never
      : IsLiteralDisabled<D> extends true
        ? never
        : CompactAuthoredRuntimePluginDefinition<D>;

type InferHiddenRuntimeDependencies<
  D extends AnyBasePluginDefinition,
  innerExplicitNames7 extends PropertyKey,
  Seen extends PropertyKey,
> = InferDependencies<D>[number] extends infer P
  ? P extends unknown
    ? InferHiddenRuntimeDependency<P, innerExplicitNames7, Seen>
    : never
  : never;

type InferHiddenRuntimeDependency<
  P,
  innerExplicitNames8 extends PropertyKey,
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
          | InferHiddenRuntimeCapability<D, innerExplicitNames8, Seen>
          | InferHiddenRuntimeDependencies<
              D,
              innerExplicitNames8,
              Seen | ExactName<D>
            >
    : never
  : never;

type InferExplicitRuntimeHiddenCapabilities<
  P,
  D extends AnyBasePluginDefinition,
  innerExplicitNames9 extends PropertyKey,
  Seen extends PropertyKey,
> = [DirectInstalledCapabilitiesOf<P>] extends [never]
  ? InferHiddenRuntimeDependencies<D, innerExplicitNames9, Seen>
  : NormalizeInstalledRuntimeCapability<
        PliteInstalledCapabilitiesOf<P>
      > extends infer TCapability
    ? TCapability extends AnyBasePluginDefinition
      ? InferHiddenRuntimeCapability<TCapability, innerExplicitNames9, Seen>
      : never
    : never;

type InferExplicitRuntimePlugin<
  P,
  innerExplicitNames10 extends PropertyKey,
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
              innerExplicitNames10,
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
  innerExplicitNames11 extends PropertyKey,
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
                    : string extends innerExplicitNames11
                      ? CompactAuthoredRuntimePluginDefinition<TDependency>
                      : TDependency['name'] extends innerExplicitNames11
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

type DefaultMarkRead<D extends AnyBasePluginDefinition> = [
  InferPluginMarkValue<D>,
] extends [never]
  ? {}
  : Readonly<{
      isActive: (value?: InferPluginMarkValue<D>) => boolean;
      value: () => InferPluginMarkValue<D> | undefined;
    }>;

type DefaultMarkUpdate<D extends AnyBasePluginDefinition> = [
  InferPluginMarkValue<D>,
] extends [never]
  ? {}
  : Readonly<{
      clear: () => void;
      set: (value: InferPluginMarkValue<D>) => void;
      toggle: [InferPluginMarkValue<D>] extends [boolean]
        ? () => void
        : (value: InferPluginMarkValue<D>) => void;
    }>;

type PluginRead<D extends AnyBasePluginDefinition> = Omit<
  DefaultMarkRead<D>,
  keyof InferRead<D>
> &
  InferRead<D>;

type InferReadGroup<D> = [D] extends [never]
  ? never
  : D extends AnyBasePluginDefinition
    ? keyof PluginRead<D> extends never
      ? never
      : {
          readonly [K in ExactName<D>]: PluginRead<D>;
        }
    : never;

type InstalledSchemaDefinitionsOf<D> =
  D extends InternalInstalledSchemaDefinitionsProvider<infer TDefinitions>
    ? TDefinitions
    : D;

type EditorElementMutation = Readonly<{
  construction: object;
  properties: object;
  toggle?: boolean;
  type: string;
}>;

type ElementToggleUpdate = Readonly<{
  toggle: (options?: Omit<EditorToggleBlockOptions, 'wrap'>) => void;
}>;

type PlateGeneratedElementForSelector<TMutations, TSelector> =
  TSelector extends ReadonlyArray<infer TItem>
    ? PlateGeneratedElementForSelector<TMutations, TItem>
    : TSelector extends PluginReference
      ? PlateElementForMutation<EditorMutationForPlugin<TMutations, TSelector>>
      : TSelector extends string
        ? Element & { type: TSelector }
        : Element;

type PlateElementInsertNode<TSchema, TMutations, TSelector> = [
  TMutations,
] extends [never]
  ? PlateElementForSelector<TSchema, TSelector>
  : PlateGeneratedElementForSelector<TMutations, TSelector>;

type PlateElementInsertOptions<
  TSchema,
  TSelector extends PlateNodeTypeSelector,
  TMutations = never,
> = Omit<NodeInsertNodesOptions<Element>, 'match' | 'split' | 'type'> & {
  split?: Omit<
    NonNullable<NodeInsertNodesOptions<Element>['split']>,
    'match' | 'type'
  > & {
    match?: NodeMatch<
      PlateElementInsertNode<TSchema, TMutations, NoInfer<TSelector>>
    >;
    type: TSelector & NoInfer<PlateElementSelectorGuard<TSelector>>;
  };
};

type PlateElementInsert<
  TConstruction extends object,
  TSchema,
  TMutations = never,
> = EditorGenericMethod<
  <const TSelector extends PlateNodeTypeSelector>(
    ...args: {} extends TConstruction
      ? [
          properties?: TConstruction,
          options?: PlateElementInsertOptions<TSchema, TSelector, TMutations>,
        ]
      : [
          properties: TConstruction,
          options?: PlateElementInsertOptions<TSchema, TSelector, TMutations>,
        ]
  ) => void
>;

type GeneratedElementUpdate<
  TMutations,
  TPlugin extends AnyBasePluginDefinition,
> = TPlugin['name'] extends infer TName extends keyof TMutations
  ? TMutations[TName] extends infer TMutation extends EditorElementMutation
    ? Readonly<{
        insert: PlateElementInsert<
          TMutation['construction'],
          InternalEditorMutationProvider<TMutations>,
          TMutations
        >;
        remove: (
          options?: Omit<NodeRemoveNodesOptions<Element>, 'match' | 'type'>
        ) => void;
        set: (
          properties: Partial<TMutation['properties']>,
          options?: Omit<NodeSetNodesOptions<Element>, 'match' | 'type'>
        ) => void;
      }> &
        (TMutation extends Readonly<{ toggle: true }>
          ? ElementToggleUpdate
          : {})
    : {}
  : {};

type SchemaPluginDefinitionForRuntimePlugin<TSchemaDefinitions, D> =
  D extends Readonly<{ name: infer TName extends string }>
    ? Extract<InstalledSchemaDefinitionsOf<TSchemaDefinitions>, { name: TName }>
    : never;

type DefaultElementUpdate<
  TSchemaDefinitions,
  TPlugin extends AnyBasePluginDefinition,
> = TSchemaDefinitions extends InternalEditorApplicationSchemaProvider
  ? {}
  : TSchemaDefinitions extends InternalEditorMutationProvider<infer TMutations>
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
              insert: PlateElementInsert<
                SchemaElementConstructionPropertiesFor<
                  PlateSchemaSourceForInstalledDefinitions<
                    InstalledSchemaDefinitionsOf<TSchemaDefinitions>
                  >,
                  TType
                >,
                TSchemaDefinitions
              >;
              remove: (
                options?: Omit<
                  NodeRemoveNodesOptions<Element>,
                  'match' | 'type'
                >
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
                options?: Omit<NodeSetNodesOptions<Element>, 'match' | 'type'>
              ) => void;
            }> &
              ('toggle' extends keyof InferUpdate<TPlugin>
                ? {}
                : {} extends SchemaElementConstructionPropertiesFor<
                      PlateSchemaSourceForInstalledDefinitions<
                        InstalledSchemaDefinitionsOf<TSchemaDefinitions>
                      >,
                      TType
                    >
                  ? EditorDefinitionElementSupportsToggle<
                      SchemaPluginDefinitionForRuntimePlugin<
                        TSchemaDefinitions,
                        TPlugin
                      >
                    > extends true
                    ? ElementToggleUpdate
                    : {}
                  : {})
          : {}
        : {};

type PluginUpdate<TSchemaDefinitions, D extends AnyBasePluginDefinition> = Omit<
  DefaultElementUpdate<
    TSchemaDefinitions,
    TSchemaDefinitions extends InternalEditorMutationProvider<unknown>
      ? D
      : SchemaPluginDefinitionForRuntimePlugin<TSchemaDefinitions, D>
  > &
    DefaultMarkUpdate<D>,
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
    ? keyof (PluginRead<D> & PluginUpdate<TSchemaDefinitions, D>) extends never
      ? never
      : {
          readonly [K in ExactName<D>]: PluginRead<D> &
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

type SchemaElementSupportsToggle<TElement> =
  TElement extends Readonly<{
    blockContent: false;
  }>
    ? false
    : TElement extends Readonly<{
          inline: true;
        }>
      ? false
      : TElement extends Readonly<{
            void: 'block' | 'inline' | 'markable-inline';
          }>
        ? false
        : TElement extends Readonly<{
              content: SchemaContent<
                Readonly<{
                  kind: 'any';
                  rules: readonly [
                    Readonly<{ kind: 'text' }>,
                    Readonly<{ group: 'inline'; kind: 'group' }>,
                  ];
                }>,
                Readonly<{ default: 'text'; min: 1 }>
              >;
            }>
          ? true
          : TElement extends Readonly<{
                content: SchemaContent<
                  Readonly<{ kind: 'text' }>,
                  Readonly<{ default: 'text'; min: 1 }>
                >;
              }>
            ? true
            : false;

type DirectPluginSchemaElement<D extends AnyBasePluginDefinition> =
  D extends Readonly<{ schema: infer TSchema }>
    ? TSchema extends (...args: never[]) => unknown
      ? never
      : Extract<TSchema, PluginSchemaDeclaration> extends Readonly<{
            element: infer TElement extends SchemaElement;
          }>
        ? TElement
        : never
    : never;

type EditorDefinitionElementSupportsToggle<D extends AnyBasePluginDefinition> =
  SchemaElementSupportsToggle<DirectPluginSchemaElement<D>>;

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
    properties?: ReadonlyArray<infer TProperty>;
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
        : PropertyOptionsOf<TDescriptor> extends { default: unknown }
          ? TDescriptor extends Readonly<{ omitDefault: false }>
            ? TKey
            : never
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
    [
      TKey in Exclude<
        ExactSchemaPropertyKey<TProperty>,
        RequiredSchemaPropertyKey<TProperty>
      >
    ]?: SchemaPropertyValueFor<TProperty, TKey>;
  }
>;

type RequiredDescriptorKey<TProperties> = {
  [
    TKey in Extract<keyof TProperties, string>
  ]: TProperties[TKey] extends Readonly<{
    required: true;
  }>
    ? TKey
    : PropertyOptionsOf<TProperties[TKey]> extends { default: unknown }
      ? TProperties[TKey] extends Readonly<{ omitDefault: false }>
        ? TKey
        : never
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
          [
            TKey in Exclude<
              Extract<keyof TProperties, string>,
              RequiredDescriptorKey<TProperties>
            >
          ]?: PropertyValueOf<TProperties[TKey]>;
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
    contentRoots?: ReadonlyArray<infer TContentRoot>;
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
  TPlugins extends ReadonlyArray<PluginReference | string>,
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
        ? InferTargetPlugins<D> extends infer TPlugins extends ReadonlyArray<
            PluginReference | string
          >
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
        ReadonlyArray<ResolvedSchemaContributionProperty<D>>,
        NonNullable<EditorSchemaContribution['groups']>,
        NonNullable<EditorSchemaContribution['roots']>,
        ReadonlyArray<SchemaContributionContentRoot<ExactSchemaContribution<D>>>
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
    readonly [
      TIndex in keyof TDependencies
    ]: TDependencies[TIndex] extends EditorSchemaExtensionProvider<
      infer TSchema
    >
      ? EditorSchemaExtensionProvider<TSchema>
      : never;
  };

/**
 * Complete installed schema carried by one concrete descriptor.
 *
 * @internal
 */
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

/**
 * Property-only projection used by the offline declaration emitter.
 *
 * @internal
 */
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

/**
 * Property types declared by one plugin, independent of runtime targets.
 *
 * @internal
 */
type ExplicitEditorDefinitionPlugin<
  TPlugins extends readonly unknown[],
  TName extends string,
> = TPlugins[number] extends infer TPlugin
  ? PluginDefinitionOf<TPlugin> extends infer TDefinition
    ? TDefinition extends AnyBasePluginDefinition
      ? TDefinition['name'] extends TName
        ? TDefinition
        : never
      : never
    : never
  : never;

export type InternalEditorDefinitionOwnedElementProperties<
  TPlugins extends readonly unknown[],
  TName extends string,
  TDefinitions = MergeInstalledPluginDefinitions<
    CorePluginDefinition,
    InferPlugins<TPlugins>
  >,
  TExplicitPlugin = ExplicitEditorDefinitionPlugin<TPlugins, TName>,
  TPlugin = [TExplicitPlugin] extends [never]
    ? Extract<TDefinitions, { name: TName }>
    : TExplicitPlugin,
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

/**
 * Text-property projection used by the offline declaration emitter.
 *
 * @internal
 */
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
          toggle: 'toggle' extends keyof InferUpdate<D>
            ? false
            : {} extends SchemaElementConstructionPropertiesFor<
                  PlateSchemaSourceForInstalledDefinitions<D>,
                  TType
                >
              ? EditorDefinitionElementSupportsToggle<D>
              : false;
          type: TType;
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

/**
 * Descriptor-local mutation types for an authored raw editor kit.
 *
 * @internal
 */
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

type RawEditorMutationForPlugin<TPlugin> =
  TPlugin extends AnyBasePluginDefinition
    ? EditorDefinitionElementMutation<TPlugin>
    : EditorDefinitionElementMutation<DescriptorPluginDefinition<TPlugin>>;

type RawEditorMutationsForPlugin<TPlugin> = [
  RawEditorMutationForPlugin<TPlugin>,
] extends [never]
  ? Readonly<Record<never, never>>
  : (
        TPlugin extends AnyBasePluginDefinition
          ? TPlugin
          : DescriptorPluginDefinition<TPlugin>
      ) extends infer TDefinition extends AnyBasePluginDefinition
    ? Readonly<{
        [TName in TDefinition['name']]: RawEditorMutationForPlugin<TPlugin>;
      }>
    : Readonly<Record<never, never>>;

type RawElementPluginGuard<TPlugin> = [
  RawEditorMutationForPlugin<TPlugin>,
] extends [never]
  ? never
  : unknown;

/**
 * Lazy installed-schema witness for compact editor projections.
 *
 * @internal
 */
export interface InternalInstalledSchemaDefinitionsProvider<D> {
  readonly definitions: () => D;
}

declare const editorApplicationSchemaProvider: unique symbol;

/**
 * Application schema policy needs generated mutations for exact generic commands.
 *
 * @internal
 */
export interface InternalEditorApplicationSchemaProvider {
  readonly [editorApplicationSchemaProvider]: true;
}

type ApplicationSchemaMemberHasPolicy<TSchema> = TSchema extends undefined
  ? false
  : 'overrides' extends keyof TSchema
    ? true
    : 'properties' extends keyof TSchema
      ? true
      : 'root' extends keyof TSchema
        ? true
        : false;

type HasApplicationSchemaPolicy<TSchema> =
  true extends ApplicationSchemaMemberHasPolicy<TSchema> ? true : false;

/**
 * Keep raw generic commands conservative when application policy can rewrite them.
 *
 * @internal
 */
export type InternalInstalledSchemaMutationProvider<D, TSchema> =
  InternalInstalledSchemaDefinitionsProvider<D> &
    (HasApplicationSchemaPolicy<TSchema> extends true
      ? InternalEditorApplicationSchemaProvider
      : {});

/**
 * Descriptor-bound mutation projection for raw and generated kits.
 *
 * @internal
 */
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

type PlateElementForMutation<TMutation> =
  TMutation extends EditorElementMutation
    ? Element & Readonly<{ type: TMutation['type'] }> & TMutation['properties']
    : never;

type PlateElementForPlugin<TSchema, TPlugin> = [TSchema] extends [
  InternalEditorMutationProvider<infer TMutations>,
]
  ? PlateElementForMutation<EditorMutationForPlugin<TMutations, TPlugin>>
  : [TSchema] extends [InternalEditorApplicationSchemaProvider]
    ? Element
    : PlateElementForMutation<RawEditorMutationForPlugin<TPlugin>>;

type PlatePropertiesForMutation<TMutation> =
  TMutation extends EditorElementMutation
    ? TMutation['properties']
    : Readonly<Record<string, unknown>>;

type PlatePropertiesForPlugin<TSchema, TPlugin> = [TSchema] extends [
  InternalEditorMutationProvider<infer TMutations>,
]
  ? PlatePropertiesForMutation<EditorMutationForPlugin<TMutations, TPlugin>>
  : [TSchema] extends [InternalEditorApplicationSchemaProvider]
    ? Readonly<Record<string, unknown>>
    : PlatePropertiesForMutation<RawEditorMutationForPlugin<TPlugin>>;

type PlateNodeTypeSelector =
  | PluginReference
  | string
  | ReadonlyArray<PluginReference | string>;

/** Broad insertion options for package APIs that forward a stored selector. */
export type PlateNodeInsertOptions = Omit<
  NodeInsertNodesOptions<Node, NodeTypeSelector | undefined>,
  'split'
> & {
  split?: Omit<
    NonNullable<
      NodeInsertNodesOptions<Node, NodeTypeSelector | undefined>['split']
    >,
    'type'
  > & {
    type?: PlateNodeTypeSelector;
  };
};

type PlateElementForSelector<TSchema, TSelector> =
  TSelector extends ReadonlyArray<infer TItem>
    ? PlateElementForSelector<TSchema, TItem>
    : TSelector extends string
      ? Element & { type: TSelector }
      : TSelector extends PluginReference
        ? PlateElementForPlugin<TSchema, TSelector>
        : never;

type PlatePropertiesForSelector<TSchema, TSelector> =
  TSelector extends ReadonlyArray<infer TItem>
    ? PlatePropertiesForSelector<TSchema, TItem>
    : TSelector extends PluginReference
      ? PlatePropertiesForPlugin<TSchema, TSelector>
      : Readonly<Record<string, unknown>>;

type PlateNodesReadOptions<TNode extends Node, TSelector> = Omit<
  EditorNodesReadOptions<TNode>,
  'match' | 'type'
> & {
  match?: NodeMatch<TNode>;
  type: TSelector & ([TNode] extends [never] ? never : unknown);
};

type PlateNodeGetOptions<TNode extends Node, TSelector> = Omit<
  EditorNodeGetOptions<TNode>,
  'match' | 'type'
> & {
  match?: NodeMatch<TNode>;
  type: TSelector & ([TNode] extends [never] ? never : unknown);
};

type PlateAboveOptions<TNode extends Element, TSelector> = Omit<
  EditorAboveOptions<TNode>,
  'match' | 'type'
> & {
  match?: NodeMatch<TNode>;
  type: TSelector & ([TNode] extends [never] ? never : unknown);
};

type PlateBlockOptions<TNode extends Element, TSelector> = Omit<
  EditorBlockOptions<TNode>,
  'match' | 'type'
> & {
  match?: NodeMatch<TNode>;
  type: TSelector & ([TNode] extends [never] ? never : unknown);
};

type PlateLevelsOptions<TNode extends Node, TSelector> = Omit<
  EditorLevelsOptions<TNode>,
  'match' | 'type'
> & {
  match?: NodeMatch<TNode>;
  type: TSelector & ([TNode] extends [never] ? never : unknown);
};

type PlateNextOptions<TNode extends Element, TSelector> = Omit<
  EditorNextOptions<TNode>,
  'match' | 'type'
> & {
  match?: NodeMatch<TNode>;
  type: TSelector & ([TNode] extends [never] ? never : unknown);
};

type PlatePreviousOptions<TNode extends Node, TSelector> = Omit<
  EditorPreviousOptions<TNode>,
  'match' | 'type'
> & {
  match?: NodeMatch<TNode>;
  type: TSelector & ([TNode] extends [never] ? never : unknown);
};

type PlateParentOptions<TNode extends Element, TSelector> = Omit<
  EditorParentOptions<TNode>,
  'match' | 'type'
> & {
  match?: NodeMatch<TNode>;
  type: TSelector & ([TNode] extends [never] ? never : unknown);
};

type PlateEditorStateNodes<V extends Value, TSchema> = Omit<
  EditorStateView<V>['nodes'],
  | 'above'
  | 'block'
  | 'entries'
  | 'find'
  | 'get'
  | 'levels'
  | 'next'
  | 'parent'
  | 'previous'
  | 'some'
  | 'toArray'
> & {
  above: (<const TSelector extends PlateNodeTypeSelector>(
    options: PlateAboveOptions<
      PlateElementForSelector<TSchema, TSelector>,
      TSelector
    >
  ) => NodeEntry<PlateElementForSelector<TSchema, TSelector>> | undefined) &
    EditorStateView<V>['nodes']['above'];
  block: (<const TSelector extends PlateNodeTypeSelector>(
    options: PlateBlockOptions<
      PlateElementForSelector<TSchema, TSelector>,
      TSelector
    >
  ) => NodeEntry<PlateElementForSelector<TSchema, TSelector>> | undefined) &
    EditorStateView<V>['nodes']['block'];
  entries: (<const TSelector extends PlateNodeTypeSelector>(
    options: PlateNodesReadOptions<
      PlateElementForSelector<TSchema, TSelector>,
      TSelector
    >
  ) => Generator<
    NodeEntry<PlateElementForSelector<TSchema, TSelector>>,
    void,
    undefined
  >) &
    EditorStateView<V>['nodes']['entries'];
  find: (<const TSelector extends PlateNodeTypeSelector>(
    options: PlateNodesReadOptions<
      PlateElementForSelector<TSchema, TSelector>,
      TSelector
    >
  ) => NodeEntry<PlateElementForSelector<TSchema, TSelector>> | undefined) &
    EditorStateView<V>['nodes']['find'];
  get: (<const TSelector extends PlateNodeTypeSelector>(
    at: NodeTarget,
    options: PlateNodeGetOptions<
      PlateElementForSelector<TSchema, TSelector>,
      TSelector
    >
  ) => NodeEntry<PlateElementForSelector<TSchema, TSelector>> | undefined) &
    EditorStateView<V>['nodes']['get'];
  levels: (<const TSelector extends PlateNodeTypeSelector>(
    options: PlateLevelsOptions<
      PlateElementForSelector<TSchema, TSelector>,
      TSelector
    >
  ) => Generator<
    NodeEntry<PlateElementForSelector<TSchema, TSelector>>,
    void,
    undefined
  >) &
    EditorStateView<V>['nodes']['levels'];
  next: (<const TSelector extends PlateNodeTypeSelector>(
    options: PlateNextOptions<
      PlateElementForSelector<TSchema, TSelector>,
      TSelector
    >
  ) => NodeEntry<PlateElementForSelector<TSchema, TSelector>> | undefined) &
    EditorStateView<V>['nodes']['next'];
  parent: (<const TSelector extends PlateNodeTypeSelector>(
    at: Parameters<EditorStateView<V>['nodes']['parent']>[0],
    options: PlateParentOptions<
      PlateElementForSelector<TSchema, TSelector>,
      TSelector
    >
  ) => NodeEntry<PlateElementForSelector<TSchema, TSelector>> | undefined) &
    EditorStateView<V>['nodes']['parent'];
  previous: (<const TSelector extends PlateNodeTypeSelector>(
    options: PlatePreviousOptions<
      PlateElementForSelector<TSchema, TSelector>,
      TSelector
    >
  ) => NodeEntry<PlateElementForSelector<TSchema, TSelector>> | undefined) &
    EditorStateView<V>['nodes']['previous'];
  some: (<const TSelector extends PlateNodeTypeSelector>(
    options: PlateNodesReadOptions<
      PlateElementForSelector<TSchema, TSelector>,
      TSelector
    >
  ) => boolean) &
    EditorStateView<V>['nodes']['some'];
  toArray: {
    <const TSelector extends PlateNodeTypeSelector>(
      options: PlateNodesReadOptions<
        PlateElementForSelector<TSchema, TSelector>,
        TSelector
      >
    ): ReadonlyArray<NodeEntry<PlateElementForSelector<TSchema, TSelector>>>;
    <const TSelector extends PlateNodeTypeSelector, R>(
      options: PlateNodesReadOptions<
        PlateElementForSelector<TSchema, TSelector>,
        TSelector
      >,
      map: (entry: NodeEntry<PlateElementForSelector<TSchema, TSelector>>) => R
    ): readonly R[];
  } & EditorStateView<V>['nodes']['toArray'];
};

type PlateSelectionBlockOptions<TNode extends Element, TSelector> = Omit<
  EditorSelectionBlockOptions,
  'match' | 'type'
> & {
  match?: NodeMatch<TNode>;
  type: TSelector & ([TNode] extends [never] ? never : unknown);
};

type PlateSelectionQueryMethod<TSchema, TMethod> = (<
  const TSelector extends PlateNodeTypeSelector,
>(
  options: PlateSelectionBlockOptions<
    PlateElementForSelector<TSchema, TSelector>,
    TSelector
  >
) => boolean) &
  TMethod;

type PlateSelectionQueries<TSelection, TSchema> = (TSelection extends (
  ...args: never[]
) => infer TResult
  ? () => TResult
  : {}) &
  Omit<
    TSelection,
    'isAcrossBlocks' | 'isAtBlockEnd' | 'isAtBlockStart' | 'isWithinBlock'
  > & {
    isAcrossBlocks: PlateSelectionQueryMethod<
      TSchema,
      TSelection extends { isAcrossBlocks: infer TMethod } ? TMethod : never
    >;
    isAtBlockEnd: PlateSelectionQueryMethod<
      TSchema,
      TSelection extends { isAtBlockEnd: infer TMethod } ? TMethod : never
    >;
    isAtBlockStart: PlateSelectionQueryMethod<
      TSchema,
      TSelection extends { isAtBlockStart: infer TMethod } ? TMethod : never
    >;
    isWithinBlock: PlateSelectionQueryMethod<
      TSchema,
      TSelection extends { isWithinBlock: infer TMethod } ? TMethod : never
    >;
  };

type MutationPluginGuard<TMutations, TPlugin> = [
  EditorMutationForPlugin<TMutations, TPlugin>,
] extends [never]
  ? never
  : unknown;

type PlateMutationSchemaCreate<TMutations> = (<
  const TPlugin extends PluginReference,
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
  Readonly<{
    type: EditorMutationForPlugin<TMutations, TPlugin>['type'];
  }> &
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

type PlateRawSchemaCreate = (<const TPlugin extends PluginReference>(
  plugin: TPlugin & NoInfer<RawElementPluginGuard<TPlugin>>,
  ...properties: RawEditorMutationForPlugin<TPlugin> extends infer TMutation extends
    EditorElementMutation
    ? {} extends TMutation['construction']
      ? [properties?: NoInfer<TMutation['construction']>]
      : [properties: NoInfer<TMutation['construction']>]
    : never
) => Element &
  Readonly<{ type: RawEditorMutationForPlugin<TPlugin>['type'] }> &
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

type PlateSchemaRead = {
  /** Whether an element participates in Plate's normal-flow block content. */
  isBlockContent: (element: Node) => boolean;
};

type PlateEditorStateSchemaApi<V extends Value, D> = PlateSchemaRead &
  (IsAny<D> extends true
    ? EditorStateSchemaApi<V>
    : D extends InternalEditorMutationProvider<infer TMutations>
      ? PlateMutationStateSchemaApi<V, TMutations>
      : PlateRawStateSchemaApi<V>);

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

type PlateEditorExtensions<
  V extends Value,
  D,
  S,
  TExtensions extends readonly unknown[],
> = readonly [...TExtensions, PlateInstalledExtension<V, D, S>];

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

type PlateTransactionPluginName<TPlugin> =
  TPlugin extends PluginReference<infer TName>
    ? TName
    : Extract<TPlugin, string>;

type PlateTransactionPluginDefinition<D, TPlugin> =
  true extends IsBroadPluginDefinition<D>
    ? OwnInferencePluginDefinition<TPlugin>
    : Extract<
        D,
        {
          name: PlateTransactionPluginName<TPlugin>;
        }
      >;

type PlateTransactionDescriptorPortalResult<TDefinition> =
  TDefinition extends AnyBasePluginDefinition
    ? Materialize<
        PluginRead<TDefinition> & Materialize<PlatePluginUpdate<TDefinition>>
      >
    : never;

type PlateTransactionPluginPortalResult<D, S, TPlugin> =
  PlateTransactionPluginName<TPlugin> extends infer TName extends string
    ? string extends TName
      ? object
      : PlateTransactionPluginDefinition<D, TPlugin> extends infer TDefinition
        ? [TDefinition] extends [never]
          ? never
          : TDefinition extends AnyBasePluginDefinition
            ? true extends IsBroadPluginDefinition<D>
              ? PlateTransactionDescriptorPortalResult<TDefinition>
              : Materialize<
                  PluginRead<TDefinition> & PluginUpdate<S, TDefinition>
                >
            : never
        : never
    : never;

type PlateTransactionPluginPortal<D, S = D> = <
  const TPlugin extends PluginReference | string,
>(
  plugin: TPlugin
) => PlateTransactionPluginPortalResult<D, S, TPlugin>;

type PlateTransactionPluginPortalSurface<
  D,
  S = D,
> = PlateTransactionPluginPortal<D, S> &
  ([Extract<D, { name: 'plugin' }>] extends [never]
    ? {}
    : PlateTransactionPluginPortalResult<D, S, 'plugin'>);

type PlateTransactionExtension<D, S = D> = {
  name: 'plate-transaction';
} & EditorExtensionTypeProvider<
  EditorExtensionCapabilities<{
    update: MergeCapabilityGroups<
      CoreEditorTransaction,
      InstalledPluginTransaction<D, S> & {
        plugin: PlateTransactionPluginPortalSurface<D, S>;
      }
    >;
  }>
>;

type WritablePropertyEntries<D> =
  D extends Readonly<{
    __pluginWritableProperties: infer TEntry;
  }>
    ? TEntry
    : never;

type ExactUnaliasedWritableEntry<TEntry> =
  TEntry extends Readonly<{
    key: infer TKey extends string;
    unaliased: true;
  }>
    ? TEntry & Readonly<{ key: TKey }>
    : never;

type PluginWritablePropertyEntry<D> = ExactUnaliasedWritableEntry<
  WritablePropertyEntries<D>
>;

type PluginWritablePropertyKey<D> =
  PluginWritablePropertyEntry<D> extends infer TEntry
    ? TEntry extends Readonly<{ key: infer TKey extends string }>
      ? TKey
      : never
    : never;

type ExactWritablePropertyEntry<TEntry> =
  TEntry extends Readonly<{
    key: infer TKey extends string;
  }>
    ? TEntry & Readonly<{ key: TKey }>
    : never;

type PluginExactWritablePropertyEntry<D> = ExactWritablePropertyEntry<
  WritablePropertyEntries<D>
>;

type PluginExactWritablePropertyKey<D> =
  PluginExactWritablePropertyEntry<D> extends infer TEntry
    ? TEntry extends Readonly<{ key: infer TKey extends string }>
      ? TKey
      : never
    : never;

type PluginExactWritablePropertyValue<D, TKey extends string> =
  PluginExactWritablePropertyEntry<D> extends infer TEntry
    ? TEntry extends Readonly<{
        key: infer TEntryKey extends string;
        value: infer TValue;
      }>
      ? TKey extends TEntryKey
        ? TValue
        : never
      : never
    : never;

/** `undefined` removes a property inside the same atomic node patch. */
type PluginWritablePropertyPatchValue<D, TKey extends string> =
  | PluginExactWritablePropertyValue<D, TKey>
  | undefined;

type PluginAliasedLocalPropertyKey<D> =
  WritablePropertyEntries<D> extends infer TEntry
    ? TEntry extends Readonly<{
        localId: infer TLocalId extends string;
        unaliased: false;
      }>
      ? TLocalId
      : never
    : never;

type PluginForbiddenWritablePropertyKey<D> = PluginAliasedLocalPropertyKey<D>;

type InvalidPluginWritablePropertyKey<D, TProps> =
  | Extract<PluginForbiddenWritablePropertyKey<D>, keyof TProps>
  | {
      [
        TKey in Extract<PluginExactWritablePropertyKey<D>, keyof TProps>
      ]: TProps[TKey] extends PluginWritablePropertyPatchValue<D, TKey>
        ? never
        : TKey;
    }[Extract<PluginExactWritablePropertyKey<D>, keyof TProps>];

type IsOpenPluginWritablePropertyPatch<TProps> = string extends keyof TProps
  ? true
  : false;

type HasRejectedPluginWritablePropertyIndex<TProps> =
  string extends keyof TProps
    ? true
    : number extends keyof TProps
      ? true
      : false;

type IsInvalidPluginWritablePropertyPatchMember<D, TProps> =
  true extends IsBroadPluginDefinition<D>
    ? false
    : true extends IsOpenPluginWritablePropertyPatch<TProps>
      ? false
      : true extends HasRejectedPluginWritablePropertyIndex<TProps>
        ? true
        : [InvalidPluginWritablePropertyKey<D, TProps>] extends [never]
          ? false
          : true;

type InvalidPluginWritablePropertyPatchMember<D, TProps> =
  IsAny<TProps> extends true
    ? never
    : TProps extends unknown
      ? true extends IsInvalidPluginWritablePropertyPatchMember<D, TProps>
        ? TProps
        : never
      : never;

type ValidatePluginWritablePropertyPatch<D, TProps> = [
  InvalidPluginWritablePropertyPatchMember<D, TProps>,
] extends [never]
  ? unknown
  : never;

type PluginWritablePropertyPatch<D> = {
  [
    TKey in PluginExactWritablePropertyKey<D>
  ]?: PluginWritablePropertyPatchValue<D, TKey>;
};

type PluginForbiddenWritablePropertyPatch<D> = {
  [TKey in PluginForbiddenWritablePropertyKey<D>]?: never;
};

type PlatePluginNodeSetProps<D> = Partial<Omit<Element, 'children'>> &
  PluginWritablePropertyPatch<D> &
  PluginForbiddenWritablePropertyPatch<D>;

type PlatePluginNodeSetOptions = Omit<NodeSetNodesOptions<any>, 'at'> & {
  at?: Descendant | Location | NodeKey | NodeSelection;
};

type PlateNodeSelectorOptions<TOptions, TNode extends Node, TSelector> = Omit<
  NonNullable<TOptions>,
  'match' | 'type'
> & {
  match?: NodeMatch<TNode>;
  type: TSelector & ([TNode] extends [never] ? never : unknown);
};

type PlateInsertSplitOptions<TNode extends Node, TSelector> = Omit<
  NonNullable<NodeInsertNodesOptions['split']>,
  'match' | 'type'
> & {
  match?: NodeMatch<TNode>;
  type: TSelector & ([TNode] extends [never] ? never : unknown);
};

type InvalidPlateElementSelectorItem<TItem> = TItem extends PluginReference
  ? [RawEditorMutationForPlugin<TItem>] extends [never]
    ? TItem
    : never
  : never;

type PlateElementSelectorGuard<TSelector> = [
  InvalidPlateElementSelectorItem<
    TSelector extends ReadonlyArray<infer TItem> ? TItem : TSelector
  >,
] extends [never]
  ? unknown
  : never;

type PlateDirectNodeSelectorOptions<
  TOptions,
  TNode extends Node,
  TSelector,
> = PlateNodeSelectorOptions<TOptions, TNode, TSelector> & {
  type: TSelector & NoInfer<PlateElementSelectorGuard<TSelector>>;
};

type PlateNodeSelectorSet<S> = <
  const TSelector extends PlateNodeTypeSelector,
  const TProps extends Partial<
    PlatePropertiesForSelector<S, NoInfer<TSelector>>
  >,
>(
  props: TProps,
  options: PlateNodeSelectorOptions<
    NodeSetNodesOptions<PlateElementForSelector<S, TSelector>>,
    PlateElementForSelector<S, TSelector>,
    TSelector
  >
) => void;

type PlateNodeSelectorUnset<S> = <
  const TSelector extends PlateNodeTypeSelector,
  const TKey extends Extract<
    keyof Omit<PlateElementForSelector<S, TSelector>, 'children' | 'type'>,
    string
  >,
>(
  property: TKey | readonly TKey[],
  options: PlateNodeSelectorOptions<
    EditorNodeUnsetOptions<PlateElementForSelector<S, TSelector>>,
    PlateElementForSelector<S, TSelector>,
    TSelector
  >
) => void;

type PlatePluginTransactionNodes<D, S = D> = Omit<
  EditorUpdateTransaction['nodes'],
  | keyof PlateEditorStateNodes<Value, S>
  | 'insert'
  | 'lift'
  | 'merge'
  | 'move'
  | 'remove'
  | 'set'
  | 'split'
  | 'unset'
  | 'unwrap'
  | 'wrap'
> & {
  insert: (<
    TNode extends Descendant,
    const TSelector extends PlateNodeTypeSelector,
  >(
    nodes: TNode | readonly TNode[],
    options: Omit<
      NonNullable<Parameters<EditorUpdateTransaction['nodes']['insert']>[1]>,
      'split'
    > & {
      split: PlateInsertSplitOptions<
        PlateElementForSelector<S, TSelector>,
        TSelector
      >;
    }
  ) => void) &
    (<TNode extends Descendant>(
      nodes: TNode | readonly TNode[],
      options?: PlateNodeInsertOptions
    ) => void) &
    EditorUpdateTransaction['nodes']['insert'];
  lift: (<const TSelector extends PlateNodeTypeSelector>(
    options: PlateNodeSelectorOptions<
      Parameters<EditorUpdateTransaction['nodes']['lift']>[0],
      PlateElementForSelector<S, TSelector>,
      TSelector
    >
  ) => void) &
    EditorUpdateTransaction['nodes']['lift'];
  merge: (<const TSelector extends PlateNodeTypeSelector>(
    options: PlateNodeSelectorOptions<
      Parameters<EditorUpdateTransaction['nodes']['merge']>[0],
      PlateElementForSelector<S, TSelector>,
      TSelector
    >
  ) => void) &
    EditorUpdateTransaction['nodes']['merge'];
  move: (<const TSelector extends PlateNodeTypeSelector>(
    options: PlateNodeSelectorOptions<
      Parameters<EditorUpdateTransaction['nodes']['move']>[0],
      PlateElementForSelector<S, TSelector>,
      TSelector
    >
  ) => void) &
    EditorUpdateTransaction['nodes']['move'];
  remove: (<const TSelector extends PlateNodeTypeSelector>(
    options: PlateNodeSelectorOptions<
      NodeRemoveNodesOptions<PlateElementForSelector<S, TSelector>>,
      PlateElementForSelector<S, TSelector>,
      TSelector
    >
  ) => void) &
    EditorUpdateTransaction['nodes']['remove'];
  set: PlateNodeSelectorSet<S> &
    (<const TProps extends PlatePluginNodeSetProps<D>>(
      props: TProps & ValidatePluginWritablePropertyPatch<D, TProps>,
      options?: PlatePluginNodeSetOptions
    ) => void);
  split: (<const TSelector extends PlateNodeTypeSelector>(
    options: PlateNodeSelectorOptions<
      Parameters<EditorUpdateTransaction['nodes']['split']>[0],
      PlateElementForSelector<S, TSelector>,
      TSelector
    >
  ) => void) &
    EditorUpdateTransaction['nodes']['split'];
  unset: PlateNodeSelectorUnset<S> & {
    <const TKey extends PluginWritablePropertyKey<D>>(
      property: TKey | readonly TKey[],
      options?: EditorNodeUnsetOptions<NodeIn<Value>>
    ): void;
    (
      property: SchemaPropertyHandle<string>,
      options?: EditorNodeUnsetOptions<NodeIn<Value>>
    ): void;
    <TKey extends string>(
      property: TKey | readonly TKey[],
      options?: EditorNodeUnsetOptions<NodeIn<Value>>
    ): void;
  };
  unwrap: (<const TSelector extends PlateNodeTypeSelector>(
    options: PlateNodeSelectorOptions<
      Parameters<EditorUpdateTransaction['nodes']['unwrap']>[0],
      PlateElementForSelector<S, TSelector>,
      TSelector
    >
  ) => void) &
    EditorUpdateTransaction['nodes']['unwrap'];
  wrap: (<const TSelector extends PlateNodeTypeSelector>(
    element: Element,
    options: PlateNodeSelectorOptions<
      Parameters<EditorUpdateTransaction['nodes']['wrap']>[1],
      PlateElementForSelector<S, TSelector>,
      TSelector
    >
  ) => void) &
    EditorUpdateTransaction['nodes']['wrap'];
} & PlateEditorStateNodes<Value, S>;

type WithPluginWritableNodes<TTransaction, D, S = D> = Omit<
  TTransaction,
  'nodes' | 'selection'
> &
  Readonly<{
    nodes: PlatePluginTransactionNodes<D, S>;
    selection: PlateSelectionQueries<
      EditorTransactionSelectionApi<EditorSelection>,
      S
    >;
  }>;

type WithPlateTransactionPluginPortal<TTransaction, D, S = D> = Omit<
  TTransaction,
  'plugin'
> &
  Readonly<{ plugin: PlateTransactionPluginPortalSurface<D, S> }>;

type PlatePluginTransactionForInstalledDefinitions<
  D,
  S = D,
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
> = WithPluginWritableNodes<
  WithPlateTransactionPluginPortal<
    EditorUpdateTransaction<
      V,
      readonly [...TExtensions, PlateTransactionExtension<D, S>]
    >,
    D,
    S
  >,
  D,
  S
>;

type PlateEditorTransactionBuilder<
  V extends Value,
  D,
  S = D,
  TExtensions extends readonly unknown[] = readonly [],
> = WithPluginWritableNodes<
  WithPlateTransactionPluginPortal<
    EditorTransactionSpecBuilder<
      V,
      readonly [...TExtensions, PlateTransactionExtension<D, S>]
    >,
    D,
    S
  >,
  D,
  S
>;

type PlateEditorStateView<
  V extends Value,
  D,
  S = D,
  TExtensions extends readonly unknown[] = readonly [],
> = Omit<
  EditorStateView<V, PlateEditorExtensions<V, D, S, TExtensions>>,
  'nodes' | 'selection' | 'transaction'
> & {
  nodes: PlateEditorStateNodes<V, S>;
  selection: PlateSelectionQueries<EditorStateSelectionApi<EditorSelection>, S>;
  transaction: ((
    fn: (
      transaction: PlateEditorTransactionBuilder<V, D, S, TExtensions>
    ) => void
  ) => TransactionSpec) & {
    extend: (
      base: TransactionSpec,
      fn: (
        transaction: PlateEditorTransactionBuilder<V, D, S, TExtensions>
      ) => void
    ) => TransactionSpec;
  };
};

/** Installed editor state visible while a plugin registers editor behavior. */
export type PlatePluginState<P extends AnyBasePluginDefinition> =
  PlateEditorStateView<
    Value,
    InstalledRuntimePluginDefinitions<P>,
    InstalledRuntimePluginDefinitions<P>
  >;

type PlateEditorRead<
  V extends Value,
  D,
  S = D,
  TExtensions extends readonly unknown[] = readonly [],
> = Omit<
  EditorReadMethods<V, PlateEditorExtensions<V, D, S, TExtensions>>,
  'nodes' | 'selection'
> &
  Readonly<{
    nodes: PlateEditorStateNodes<V, S>;
    selection: PlateSelectionQueries<
      EditorStateSelectionApi<EditorSelection>,
      S
    >;
  }> &
  (<T>(fn: (state: PlateEditorStateView<V, D, S, TExtensions>) => T) => T);

type PlateEditorNodeSelectorMethod<TMethod, S> = TMethod extends (
  ...args: any[]
) => void
  ? (<const TSelector extends PlateNodeTypeSelector>(
      options: PlateDirectNodeSelectorOptions<
        Parameters<TMethod>[0],
        PlateElementForSelector<S, TSelector>,
        TSelector
      >
    ) => void) &
      TMethod
  : never;

type PlateEditorInsertNodes<TMethod, S> = TMethod extends (
  ...args: any[]
) => void
  ? (<TNode extends Descendant, const TSelector extends PlateNodeTypeSelector>(
      nodes: TNode | readonly TNode[],
      options: Omit<NonNullable<Parameters<TMethod>[1]>, 'split'> & {
        split: PlateInsertSplitOptions<
          PlateElementForSelector<S, TSelector>,
          TSelector
        > & {
          type: TSelector & NoInfer<PlateElementSelectorGuard<TSelector>>;
        };
      }
    ) => void) &
      (<TNode extends Descendant>(
        nodes: TNode | readonly TNode[],
        options?: PlateNodeInsertOptions
      ) => void) &
      TMethod
  : never;

type PlateEditorWrapNodes<TMethod, S> = TMethod extends (...args: any[]) => void
  ? (<const TSelector extends PlateNodeTypeSelector>(
      element: Element,
      options: PlateDirectNodeSelectorOptions<
        Parameters<TMethod>[1],
        PlateElementForSelector<S, TSelector>,
        TSelector
      >
    ) => void) &
      TMethod
  : never;

type PlateEditorUpdateNodeMethods<
  V extends Value,
  D,
  S = D,
  TExtensions extends readonly unknown[] = readonly [],
> = EditorUpdateMethods<
  V,
  PlateEditorExtensions<V, D, S, TExtensions>
>['nodes'];

type PlateEditorUpdateNodes<
  V extends Value,
  D,
  S = D,
  TExtensions extends readonly unknown[] = readonly [],
> = Omit<
  PlateEditorUpdateNodeMethods<V, D, S, TExtensions>,
  | 'insert'
  | 'lift'
  | 'merge'
  | 'move'
  | 'remove'
  | 'set'
  | 'split'
  | 'unset'
  | 'unwrap'
  | 'wrap'
> & {
  insert: PlateEditorInsertNodes<
    PlateEditorUpdateNodeMethods<V, D, S, TExtensions>['insert'],
    InternalEditorApplicationSchemaProvider
  >;
  lift: PlateEditorNodeSelectorMethod<
    PlateEditorUpdateNodeMethods<V, D, S, TExtensions>['lift'],
    InternalEditorApplicationSchemaProvider
  >;
  merge: PlateEditorNodeSelectorMethod<
    PlateEditorUpdateNodeMethods<V, D, S, TExtensions>['merge'],
    InternalEditorApplicationSchemaProvider
  >;
  move: PlateEditorNodeSelectorMethod<
    PlateEditorUpdateNodeMethods<V, D, S, TExtensions>['move'],
    InternalEditorApplicationSchemaProvider
  >;
  remove: PlateEditorNodeSelectorMethod<
    PlateEditorUpdateNodeMethods<V, D, S, TExtensions>['remove'],
    InternalEditorApplicationSchemaProvider
  >;
  set: PlateNodeSelectorSet<S> &
    PlateEditorUpdateNodeMethods<V, D, S, TExtensions>['set'];
  split: PlateEditorNodeSelectorMethod<
    PlateEditorUpdateNodeMethods<V, D, S, TExtensions>['split'],
    InternalEditorApplicationSchemaProvider
  >;
  unset: PlateNodeSelectorUnset<S> &
    PlateEditorUpdateNodeMethods<V, D, S, TExtensions>['unset'];
  unwrap: PlateEditorNodeSelectorMethod<
    PlateEditorUpdateNodeMethods<V, D, S, TExtensions>['unwrap'],
    InternalEditorApplicationSchemaProvider
  >;
  wrap: PlateEditorWrapNodes<
    PlateEditorUpdateNodeMethods<V, D, S, TExtensions>['wrap'],
    InternalEditorApplicationSchemaProvider
  >;
};

type PlateEditorUpdateMethods<
  V extends Value,
  D,
  S = D,
  TExtensions extends readonly unknown[] = readonly [],
> = Omit<
  EditorUpdateMethods<V, PlateEditorExtensions<V, D, S, TExtensions>>,
  'nodes' | 'selection'
> & {
  nodes: PlateEditorUpdateNodes<V, D, S, TExtensions>;
  selection: EditorUpdateMethods<V, TExtensions>['selection'];
};

type PlateEditorUpdatePolicy<
  V extends Value,
  D,
  S = D,
  TExtensions extends readonly unknown[] = readonly [],
> = Readonly<
  Omit<EditorUpdatePolicy, 'history'> &
    ('history' extends keyof EditorInstalledUpdateGroups<
      V,
      PlateEditorExtensions<V, D, S, TExtensions>
    >
      ? Pick<EditorUpdatePolicy, 'history'>
      : { history?: never })
>;

type PlateEditorUpdateOverloads<
  V extends Value,
  D,
  S = D,
  TExtensions extends readonly unknown[] = readonly [],
> = {
  (
    fn: (
      transaction: PlatePluginTransactionForInstalledDefinitions<
        D,
        S,
        V,
        TExtensions
      >,
      context: EditorUpdateContext<
        PliteRuntimeBaseEditor<V, PlateEditorExtensions<V, D, S, TExtensions>>
      >
    ) => void
  ): void;
  (
    policy: PlateEditorUpdatePolicy<V, D, S, TExtensions>,
    fn: (
      transaction: PlatePluginTransactionForInstalledDefinitions<
        D,
        S,
        V,
        TExtensions
      >,
      context: EditorUpdateContext<
        PliteRuntimeBaseEditor<V, PlateEditorExtensions<V, D, S, TExtensions>>
      >
    ) => void
  ): void;
  (
    policy: PlateEditorUpdatePolicy<V, D, S, TExtensions>
  ): PlateEditorUpdateMethods<V, D, S, TExtensions>;
};

type PlateEditorUpdate<
  V extends Value,
  D,
  S = D,
  TExtensions extends readonly unknown[] = readonly [],
> = PlateEditorUpdateOverloads<V, D, S, TExtensions> &
  PlateEditorUpdateMethods<V, D, S, TExtensions>;

/** Dependency capabilities visible while a plugin registers editor behavior. */
type PlatePluginExtensionEditorForInstalledDefinitions<D> =
  PliteRuntimeBaseEditor<Value, readonly [PlatePluginDependencyExtension<D>]>;

export type PlatePluginExtensionEditor<P extends AnyBasePluginDefinition> =
  PlatePluginExtensionEditorForInstalledDefinitions<
    InstalledRuntimePluginDefinitions<P>
  >;

/**
 * Exact document value compiled from an installed Plate graph.
 *
 * @internal
 */
export type InternalPlateValueWithInstalledDefinitions<D> =
  true extends IsBroadPluginDefinition<InstalledSchemaDefinitionsOf<D>>
    ? Value
    : EditorValueFromExtensions<
        readonly [
          PlateSchemaInstalledExtension<InstalledSchemaDefinitionsOf<D>>,
        ]
      >;

/**
 * Exact element vocabulary compiled from an installed Plate graph.
 *
 * @internal
 */
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

/**
 * Exact text vocabulary compiled from an installed Plate graph.
 *
 * @internal
 */
export type InternalPlateTextWithInstalledDefinitions<D> =
  true extends IsBroadPluginDefinition<InstalledSchemaDefinitionsOf<D>>
    ? import('plitejs').Text
    : Extract<
        SchemaText<
          PlateSchemaSourceForInstalledDefinitions<
            InstalledSchemaDefinitionsOf<D>
          >
        >,
        import('plitejs').Text
      >;

export type PlatePluginTransaction<P extends AnyBasePluginDefinition> =
  PlatePluginTransactionForInstalledDefinitions<
    InstalledRuntimePluginDefinitions<P>
  >;

/** Installed state capabilities visible while a plugin constructs a read group. */
type PlatePluginReadStateForInstalledDefinitions<D> = PlateEditorStateView<
  Value,
  D,
  D
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

/** Read methods exposed directly by one plugin portal. */
export type PlatePluginRead<P extends AnyBasePluginDefinition> = PluginRead<
  Extract<OwnInferencePluginDefinition<P>, AnyBasePluginDefinition>
>;

type PlatePluginUpdateMethods<
  P extends AnyBasePluginDefinition,
  S = P,
> = Materialize<
  PluginUpdate<
    S extends InternalEditorMutationProvider<unknown>
      ? S
      : S extends InternalEditorApplicationSchemaProvider
        ? S
        : InternalEditorMutationProvider<RawEditorMutationsForPlugin<P>>,
    Extract<OwnInferencePluginDefinition<P>, AnyBasePluginDefinition>
  >
>;

/** One-shot update methods exposed directly by one plugin portal. */
export type PlatePluginUpdate<
  P extends AnyBasePluginDefinition,
  S = P,
> = PlatePluginUpdateMethods<P, S> &
  ((policy: EditorUpdatePolicy) => PlatePluginUpdateMethods<P, S>);

export type PlatePluginOwnUpdate<P extends AnyBasePluginDefinition> =
  PliteRuntimeBaseEditor<
    Value,
    readonly [PlateInstalledExtension<Value, AnyBasePluginDefinition>]
  >['update'] &
    PliteRuntimeBaseEditor<
      Value,
      readonly [PlateOwnInstalledExtension<P>]
    >['update'];

/**
 * Editor projection for definitions already lowered by `InferPlugins`.
 *
 * @internal
 */
export type InternalPliteEditorWithInstalledPlateDefinitions<
  V extends Value,
  D,
  S = D,
  TExtensions extends readonly unknown[] = readonly [],
> = {
  api: PlateEditorApi<V, D> &
    PliteRuntimeBaseEditor<
      V,
      PlateEditorExtensions<V, D, S, TExtensions>
    >['api'];
  extension: PlatePluginExtensionPortal<D> &
    PliteRuntimeBaseEditor<
      V,
      PlateEditorExtensions<V, D, S, TExtensions>
    >['extension'];
  read: PlateEditorRead<V, D, S, TExtensions> & {
    schema: PlateEditorStateSchemaApi<V, S>;
  };
  update: PlateEditorUpdate<V, D, S, TExtensions>;
} & EditorValueTypeProvider<() => V> &
  EditorStateViewProvider<() => PlateEditorStateView<V, D, S, TExtensions>> &
  EditorUpdateTransactionProvider<
    () => PlatePluginTransactionForInstalledDefinitions<D, S, V, TExtensions>
  > &
  PliteRuntimeBaseEditor<V, PlateEditorExtensions<V, D, S, TExtensions>>;

export type PliteEditorWithPlatePlugins<
  V extends Value,
  P extends AnyBasePluginDefinition,
> = InternalPliteEditorWithInstalledPlateDefinitions<
  V,
  InstalledRuntimePluginDefinitions<P>,
  InstalledRuntimePluginDefinitions<P>
>;
