import type {
  Editor as RuntimeBaseEditor,
  EditorSchemaContribution,
  EditorSchemaDerivedDefinition,
  EditorSchemaElement,
  EditorSchemaPlugin,
  EditorSchemaPluginProvider,
  EditorToggleBlockOptions,
  EditorNodeUnsetOptions,
  RuntimePluginReference,
  RuntimePluginCapabilities,
  EditorStateView,
  EditorStateViewProvider,
  EditorStateSchemaApi,
  RuntimePluginTypeProvider,
  EditorReadMethods,
  EditorInstalledUpdateGroups,
  EditorTransactionSpecBuilder,
  EditorUpdateTransaction,
  EditorUpdateTransactionProvider,
  EditorUpdateContext,
  EditorUpdateMethods,
  EditorUpdatePolicy,
  EditorValueTypeProvider,
  EditorValueFromPlugins,
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
  SchemaPluginsOf,
  SchemaTypesTarget,
  TransactionSpec,
  Value,
  EditorGenericMethod,
  EditorSchemaSourceProvider,
  RuntimePluginDependencyReferenceFor,
  RuntimePluginInstalledCapabilitiesOf,
} from '../../facade';
import type { UnionToIntersection } from '../../internal/types';
import type { AnyBasePlugin } from '../plugin/BasePlugin';
import type {
  AnyBasePluginDefinition,
  BasePluginDefinition,
  InferApi,
  InferDependencyDefinitions,
  InferDependencies,
  InferEnabled,
  InferRead,
  InferTargetPlugins,
  InferUpdate,
  PluginDependencySource,
  PluginDefinitionWitness,
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
import type { CorePluginDefinition } from '../plugins/getCorePlugins.internal';
import type {
  CoreEditorApi,
  CoreEditorRead,
  CoreEditorTransaction,
  CoreEditorUpdate,
} from './coreEditorCapabilityDefinition.internal';

export type BasePluginInput = PluginReference;

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
  TCapability extends Readonly<{
    api: infer TApi extends object;
  }>
    ? Readonly<{ api: TApi }>
    : {};

type InstalledCapabilityEnabled<TCapability> =
  TCapability extends Readonly<{
    enabled: infer TEnabled extends boolean;
  }>
    ? Readonly<{ enabled: TEnabled }>
    : {};

type InstalledCapabilityMarkValue<TCapability> =
  TCapability extends Readonly<{
    markValue: infer TMarkValue;
  }>
    ? Readonly<{ markValue: TMarkValue }>
    : {};

type InstalledCapabilityRead<TCapability> =
  TCapability extends Readonly<{
    read: infer TRead extends object;
  }>
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
  TCapability extends Readonly<{
    type: infer TType extends string;
  }>
    ? Readonly<{ type: TType }>
    : {};

type InstalledCapabilityUpdate<TCapability> =
  TCapability extends Readonly<{
    update: infer TUpdate extends object;
  }>
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

type DirectInstalledCapabilitiesOf<P> = RuntimePluginInstalledCapabilitiesOf<P>;

type RuntimeInstalledCapabilitiesOf<P> = [
  DirectInstalledCapabilitiesOf<P>,
] extends [never]
  ? RuntimePluginInstalledCapabilitiesOf<RuntimePluginDependencyReferenceFor<P>>
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
  RuntimeInstalledCapabilitiesOf<P>,
] extends [never]
  ? P extends Readonly<{ elementType: string }>
    ? D
    : never
  : NormalizeInstalledCapability<
      Extract<RuntimeInstalledCapabilitiesOf<P>, { name: D['name'] }>,
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
    ? [RuntimeInstalledCapabilitiesOf<P>] extends [never]
      ? InferDependencyDefinitions<
          Readonly<{
            dependencies: readonly [
              Extract<P, RuntimePluginReference | PluginReference>,
            ];
            name: 'dependency';
          }>
        >
      : NormalizeInstalledCapability<RuntimeInstalledCapabilitiesOf<P>>
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
        RuntimeInstalledCapabilitiesOf<P>
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
  RuntimeInstalledCapabilitiesOf<P>,
] extends [never]
  ? P extends Readonly<{ elementType: string }>
    ? CompactAuthoredRuntimePluginDefinition<D>
    : never
  : NormalizeInstalledRuntimeCapability<
      Extract<RuntimeInstalledCapabilitiesOf<P>, { name: D['name'] }>,
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
    ? [RuntimeInstalledCapabilitiesOf<P>] extends [never]
      ? InferenceIdentityOf<P>
      : NormalizeInstalledRuntimeCapability<RuntimeInstalledCapabilitiesOf<P>>
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
        RuntimeInstalledCapabilitiesOf<P>
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
  block: boolean;
  construction: object;
  properties: object;
  toggle?: boolean;
  type: string;
}>;

type ElementToggleUpdate = Readonly<{
  toggle: (options?: Omit<EditorToggleBlockOptions, 'wrap'>) => void;
}>;

type GeneratedElementForSelector<TMutations, TSelector> =
  TSelector extends ReadonlyArray<infer TItem>
    ? GeneratedElementForSelector<TMutations, TItem>
    : TSelector extends PluginReference
      ? ElementForMutation<EditorMutationForPlugin<TMutations, TSelector>>
      : TSelector extends string
        ? Element & { type: TSelector }
        : Element;

type ElementInsertNode<TSchema, TMutations, TSelector> = [TMutations] extends [
  never,
]
  ? ElementForSelector<TSchema, TSelector>
  : GeneratedElementForSelector<TMutations, TSelector>;

type ElementInsertOptions<
  TSchema,
  TSelector extends PluginNodeTypeSelector,
  TMutations = never,
> = Omit<NodeInsertNodesOptions<Element>, 'match' | 'split' | 'type'> &
  Pick<BlockInsertOptions, 'after' | 'replaceEmpty'> & {
    split?: Omit<
      NonNullable<NodeInsertNodesOptions<Element>['split']>,
      'match' | 'type'
    > & {
      match?: NodeMatch<
        ElementInsertNode<TSchema, TMutations, NoInfer<TSelector>>
      >;
      type: TSelector & NoInfer<ElementSelectorGuard<TSelector>>;
    };
  };

/** Inserts a new element, replacing a different empty block by default. */
type ElementInsert<
  TConstruction extends object,
  TSchema,
  TMutations = never,
> = EditorGenericMethod<
  <const TSelector extends PluginNodeTypeSelector>(
    ...args: {} extends TConstruction
      ? [
          properties?: TConstruction,
          options?: ElementInsertOptions<TSchema, TSelector, TMutations>,
        ]
      : [
          properties: TConstruction,
          options?: ElementInsertOptions<TSchema, TSelector, TMutations>,
        ]
  ) => void
>;

/** Reuses a matching empty block, or inserts with the standard block policy. */
type ElementUpsert<TConstruction extends object> = (
  ...args: {} extends TConstruction
    ? [properties?: TConstruction, options?: BlockUpsertOptions]
    : [properties: TConstruction, options?: BlockUpsertOptions]
) => void;

type GeneratedElementUpdate<
  TMutations,
  TPlugin extends AnyBasePluginDefinition,
> = TPlugin['name'] extends infer TName extends keyof TMutations
  ? TMutations[TName] extends infer TMutation extends EditorElementMutation
    ? Readonly<{
        insert: ElementInsert<
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
        (TMutation extends Readonly<{ block: false }>
          ? {}
          : Readonly<{
              upsert: ElementUpsert<TMutation['construction']>;
            }>) &
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
            SchemaSourceForInstalledDefinitions<
              InstalledSchemaDefinitionsOf<TSchemaDefinitions>
            >
          >
          ? Readonly<{
              insert: ElementInsert<
                SchemaElementConstructionPropertiesFor<
                  SchemaSourceForInstalledDefinitions<
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
                    SchemaSourceForInstalledDefinitions<
                      InstalledSchemaDefinitionsOf<TSchemaDefinitions>
                    >,
                    TType
                  >
                >,
                options?: Omit<NodeSetNodesOptions<Element>, 'match' | 'type'>
              ) => void;
            }> &
              (EditorDefinitionElementSupportsBlockInsertion<TPlugin> extends true
                ? Readonly<{
                    upsert: ElementUpsert<
                      SchemaElementConstructionPropertiesFor<
                        SchemaSourceForInstalledDefinitions<
                          InstalledSchemaDefinitionsOf<TSchemaDefinitions>
                        >,
                        TType
                      >
                    >;
                  }>
                : {}) &
              ('toggle' extends keyof InferUpdate<TPlugin>
                ? {}
                : {} extends SchemaElementConstructionPropertiesFor<
                      SchemaSourceForInstalledDefinitions<
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

type AuthoredUpdateKeys<
  D extends AnyBasePluginDefinition,
  TUpdate = InferUpdate<D>,
> = keyof TUpdate | ('insert' extends keyof TUpdate ? 'upsert' : never);

type PluginUpdateGroup<
  TSchemaDefinitions,
  D extends AnyBasePluginDefinition,
> = Omit<
  DefaultElementUpdate<
    TSchemaDefinitions,
    TSchemaDefinitions extends InternalEditorMutationProvider<unknown>
      ? D
      : SchemaPluginDefinitionForRuntimePlugin<TSchemaDefinitions, D>
  > &
    DefaultMarkUpdate<D>,
  AuthoredUpdateKeys<D>
> &
  InferUpdate<D>;

type InferUpdateGroup<D, TSchemaDefinitions = D> = [D] extends [never]
  ? never
  : D extends AnyBasePluginDefinition
    ? keyof PluginUpdateGroup<TSchemaDefinitions, D> extends never
      ? never
      : {
          readonly [K in ExactName<D>]: PluginUpdateGroup<
            TSchemaDefinitions,
            D
          >;
        }
    : never;

type InferTransactionGroup<D, TSchemaDefinitions = D> = [D] extends [never]
  ? never
  : D extends AnyBasePluginDefinition
    ? keyof (PluginRead<D> &
        PluginUpdateGroup<TSchemaDefinitions, D>) extends never
      ? never
      : {
          readonly [K in ExactName<D>]: PluginRead<D> &
            PluginUpdateGroup<TSchemaDefinitions, D>;
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

type SchemaElementSupportsBlockInsertion<TElement> = [TElement] extends [never]
  ? true
  : TElement extends Readonly<{ inline: true }>
    ? false
    : TElement extends Readonly<{
          void: 'inline' | 'markable-inline';
        }>
      ? false
      : true;

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

type EditorDefinitionElementSupportsBlockInsertion<
  D extends AnyBasePluginDefinition,
> = SchemaElementSupportsBlockInsertion<DirectPluginSchemaElement<D>>;

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

type RawSchemaDeclaration<D> =
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

type SchemaDefinition<D> = EditorSchemaDerivedDefinition<
  NonNullable<RawSchemaDeclaration<D>['elements']>,
  NonNullable<RawSchemaDeclaration<D>['properties']>,
  NonNullable<RawSchemaDeclaration<D>['groups']>,
  NonNullable<RawSchemaDeclaration<D>['roots']>,
  NonNullable<RawSchemaDeclaration<D>['contentRoots']>
>;

type SchemaPlugin<D> = EditorSchemaPlugin<SchemaDefinition<D>, 'plate'>;

type DependencySchemaProviders<TDependencies extends readonly unknown[]> = {
  readonly [
    TIndex in keyof TDependencies
  ]: TDependencies[TIndex] extends EditorSchemaPluginProvider<infer TSchema>
    ? EditorSchemaPluginProvider<TSchema>
    : never;
};

/**
 * Complete installed schema carried by one concrete descriptor.
 *
 * @internal
 */
export type InternalSchemaPluginsForPlugin<P extends AnyBasePluginDefinition> =
  SchemaPluginsOf<
    readonly [
      EditorSchemaPluginProvider<() => SchemaPlugin<P>>,
      ...DependencySchemaProviders<InferDependencies<P>>,
    ]
  >;

type SchemaSourceForInstalledDefinitions<D> = EditorSchemaSourceProvider<
  () => RawSchemaDeclaration<D>
>;

export type PlateSchemaSource<P> = SchemaSourceForInstalledDefinitions<
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
        SchemaSourceForInstalledDefinitions<TDefinitions>
      >
      ? SchemaElementPropertiesFor<
          SchemaSourceForInstalledDefinitions<TDefinitions>,
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
  SchemaSourceForInstalledDefinitions<
    MergeInstalledPluginDefinitions<
      CorePluginDefinition,
      InferPlugins<TPlugins>
    >
  >
>;

type EditorPropertyOwner<TPlugins extends readonly unknown[]> =
  MergeInstalledPluginDefinitions<
    CorePluginDefinition,
    InferPlugins<TPlugins>
  > extends { name: infer TName extends string }
    ? TName
    : never;

/** Exact property projections for offline declaration emission. */
export type EditorPropertyTypes<TPlugins extends readonly unknown[]> =
  Readonly<{
    elements: {
      readonly [
        TName in EditorPropertyOwner<TPlugins>
      ]: InternalEditorDefinitionElementProperties<TPlugins, TName>;
    };
    owners: {
      readonly [
        TName in EditorPropertyOwner<TPlugins>
      ]: InternalEditorDefinitionOwnedElementProperties<TPlugins, TName>;
    };
    text: InternalEditorDefinitionTextProperties<TPlugins>;
  }>;

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
    ? TType extends SchemaElementTypes<SchemaSourceForInstalledDefinitions<D>>
      ? Readonly<{
          block: EditorDefinitionElementSupportsBlockInsertion<D>;
          construction: SchemaElementConstructionPropertiesFor<
            SchemaSourceForInstalledDefinitions<D>,
            TType
          >;
          properties: SchemaElementPropertiesFor<
            SchemaSourceForInstalledDefinitions<D>,
            TType
          >;
          toggle: 'toggle' extends keyof InferUpdate<D>
            ? false
            : {} extends SchemaElementConstructionPropertiesFor<
                  SchemaSourceForInstalledDefinitions<D>,
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

type ElementForMutation<TMutation> = TMutation extends EditorElementMutation
  ? Element & Readonly<{ type: TMutation['type'] }> & TMutation['properties']
  : never;

type ElementForPlugin<TSchema, TPlugin> = [TSchema] extends [
  InternalEditorMutationProvider<infer TMutations>,
]
  ? ElementForMutation<EditorMutationForPlugin<TMutations, TPlugin>>
  : [TSchema] extends [InternalEditorApplicationSchemaProvider]
    ? Element
    : ElementForMutation<RawEditorMutationForPlugin<TPlugin>>;

type PropertiesForMutation<TMutation> = TMutation extends EditorElementMutation
  ? TMutation['properties']
  : Readonly<Record<string, unknown>>;

type PropertiesForPlugin<TSchema, TPlugin> = [TSchema] extends [
  InternalEditorMutationProvider<infer TMutations>,
]
  ? PropertiesForMutation<EditorMutationForPlugin<TMutations, TPlugin>>
  : [TSchema] extends [InternalEditorApplicationSchemaProvider]
    ? Readonly<Record<string, unknown>>
    : PropertiesForMutation<RawEditorMutationForPlugin<TPlugin>>;

type PluginNodeTypeSelector =
  | PluginReference
  | string
  | ReadonlyArray<PluginReference | string>;

/** Broad insertion options for package APIs that forward a stored selector. */
export type NodeInsertOptions = Omit<
  NodeInsertNodesOptions<Node, NodeTypeSelector | undefined>,
  'split'
> & {
  split?: Omit<
    NonNullable<
      NodeInsertNodesOptions<Node, NodeTypeSelector | undefined>['split']
    >,
    'type'
  > & {
    type?: PluginNodeTypeSelector;
  };
};

/**
 * Placement options for feature commands that insert whole blocks.
 *
 * Without `at`, insertion uses `after` or the current block as its source. A
 * different empty editable block is replaced, a matching empty block gets a
 * sibling, and content or structural blocks are preserved before the new
 * block. `at` is an exact insertion location. `replaceEmpty` explicitly
 * overrides the semantic empty-block choice for `insert`.
 */
export type BlockInsertOptions = NodeInsertOptions & {
  /** Insert after this block target; omit `at` when using `after`. */
  after?: NodeTarget;
  /** Replace an empty editable source when inserting after a block. */
  replaceEmpty?: boolean;
};

/**
 * Placement options for a block upsert. A matching empty editable block is
 * reused; every other source follows the standard semantic insertion policy.
 */
export type BlockUpsertOptions = Omit<
  BlockInsertOptions,
  'at' | 'replaceEmpty'
>;

type ElementForSelector<TSchema, TSelector> =
  TSelector extends ReadonlyArray<infer TItem>
    ? ElementForSelector<TSchema, TItem>
    : TSelector extends string
      ? Element & { type: TSelector }
      : TSelector extends PluginReference
        ? ElementForPlugin<TSchema, TSelector>
        : never;

type PropertiesForSelector<TSchema, TSelector> =
  TSelector extends ReadonlyArray<infer TItem>
    ? PropertiesForSelector<TSchema, TItem>
    : TSelector extends PluginReference
      ? PropertiesForPlugin<TSchema, TSelector>
      : Readonly<Record<string, unknown>>;

type NodesReadOptions<TNode extends Node, TSelector> = Omit<
  EditorNodesReadOptions<TNode>,
  'match' | 'type'
> & {
  match?: NodeMatch<TNode>;
  type: TSelector & ([TNode] extends [never] ? never : unknown);
};

type NodeGetOptions<TNode extends Node, TSelector> = Omit<
  EditorNodeGetOptions<TNode>,
  'match' | 'type'
> & {
  match?: NodeMatch<TNode>;
  type: TSelector & ([TNode] extends [never] ? never : unknown);
};

type AboveOptions<TNode extends Element, TSelector> = Omit<
  EditorAboveOptions<TNode>,
  'match' | 'type'
> & {
  match?: NodeMatch<TNode>;
  type: TSelector & ([TNode] extends [never] ? never : unknown);
};

type BlockOptions<TNode extends Element, TSelector> = Omit<
  EditorBlockOptions<TNode>,
  'match' | 'type'
> & {
  match?: NodeMatch<TNode>;
  type: TSelector & ([TNode] extends [never] ? never : unknown);
};

type LevelsOptions<TNode extends Node, TSelector> = Omit<
  EditorLevelsOptions<TNode>,
  'match' | 'type'
> & {
  match?: NodeMatch<TNode>;
  type: TSelector & ([TNode] extends [never] ? never : unknown);
};

type NextOptions<TNode extends Element, TSelector> = Omit<
  EditorNextOptions<TNode>,
  'match' | 'type'
> & {
  match?: NodeMatch<TNode>;
  type: TSelector & ([TNode] extends [never] ? never : unknown);
};

type PreviousOptions<TNode extends Node, TSelector> = Omit<
  EditorPreviousOptions<TNode>,
  'match' | 'type'
> & {
  match?: NodeMatch<TNode>;
  type: TSelector & ([TNode] extends [never] ? never : unknown);
};

type ParentOptions<TNode extends Element, TSelector> = Omit<
  EditorParentOptions<TNode>,
  'match' | 'type'
> & {
  match?: NodeMatch<TNode>;
  type: TSelector & ([TNode] extends [never] ? never : unknown);
};

type PluginEditorStateNodes<V extends Value, TSchema> = Omit<
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
  above: (<const TSelector extends PluginNodeTypeSelector>(
    options: AboveOptions<ElementForSelector<TSchema, TSelector>, TSelector>
  ) => NodeEntry<ElementForSelector<TSchema, TSelector>> | undefined) &
    EditorStateView<V>['nodes']['above'];
  block: (<const TSelector extends PluginNodeTypeSelector>(
    options: BlockOptions<ElementForSelector<TSchema, TSelector>, TSelector>
  ) => NodeEntry<ElementForSelector<TSchema, TSelector>> | undefined) &
    EditorStateView<V>['nodes']['block'];
  entries: (<const TSelector extends PluginNodeTypeSelector>(
    options: NodesReadOptions<ElementForSelector<TSchema, TSelector>, TSelector>
  ) => Generator<
    NodeEntry<ElementForSelector<TSchema, TSelector>>,
    void,
    undefined
  >) &
    EditorStateView<V>['nodes']['entries'];
  find: (<const TSelector extends PluginNodeTypeSelector>(
    options: NodesReadOptions<ElementForSelector<TSchema, TSelector>, TSelector>
  ) => NodeEntry<ElementForSelector<TSchema, TSelector>> | undefined) &
    EditorStateView<V>['nodes']['find'];
  get: (<const TSelector extends PluginNodeTypeSelector>(
    at: NodeTarget,
    options: NodeGetOptions<ElementForSelector<TSchema, TSelector>, TSelector>
  ) => NodeEntry<ElementForSelector<TSchema, TSelector>> | undefined) &
    EditorStateView<V>['nodes']['get'];
  levels: (<const TSelector extends PluginNodeTypeSelector>(
    options: LevelsOptions<ElementForSelector<TSchema, TSelector>, TSelector>
  ) => Generator<
    NodeEntry<ElementForSelector<TSchema, TSelector>>,
    void,
    undefined
  >) &
    EditorStateView<V>['nodes']['levels'];
  next: (<const TSelector extends PluginNodeTypeSelector>(
    options: NextOptions<ElementForSelector<TSchema, TSelector>, TSelector>
  ) => NodeEntry<ElementForSelector<TSchema, TSelector>> | undefined) &
    EditorStateView<V>['nodes']['next'];
  parent: (<const TSelector extends PluginNodeTypeSelector>(
    at: Parameters<EditorStateView<V>['nodes']['parent']>[0],
    options: ParentOptions<ElementForSelector<TSchema, TSelector>, TSelector>
  ) => NodeEntry<ElementForSelector<TSchema, TSelector>> | undefined) &
    EditorStateView<V>['nodes']['parent'];
  previous: (<const TSelector extends PluginNodeTypeSelector>(
    options: PreviousOptions<ElementForSelector<TSchema, TSelector>, TSelector>
  ) => NodeEntry<ElementForSelector<TSchema, TSelector>> | undefined) &
    EditorStateView<V>['nodes']['previous'];
  some: (<const TSelector extends PluginNodeTypeSelector>(
    options: NodesReadOptions<ElementForSelector<TSchema, TSelector>, TSelector>
  ) => boolean) &
    EditorStateView<V>['nodes']['some'];
  toArray: {
    <const TSelector extends PluginNodeTypeSelector>(
      options: NodesReadOptions<
        ElementForSelector<TSchema, TSelector>,
        TSelector
      >
    ): ReadonlyArray<NodeEntry<ElementForSelector<TSchema, TSelector>>>;
    <const TSelector extends PluginNodeTypeSelector, R>(
      options: NodesReadOptions<
        ElementForSelector<TSchema, TSelector>,
        TSelector
      >,
      map: (entry: NodeEntry<ElementForSelector<TSchema, TSelector>>) => R
    ): readonly R[];
  } & EditorStateView<V>['nodes']['toArray'];
};

type SelectionBlockOptions<TNode extends Element, TSelector> = Omit<
  EditorSelectionBlockOptions,
  'match' | 'type'
> & {
  match?: NodeMatch<TNode>;
  type: TSelector & ([TNode] extends [never] ? never : unknown);
};

type SelectionQueryMethod<TSchema, TMethod> = (<
  const TSelector extends PluginNodeTypeSelector,
>(
  options: SelectionBlockOptions<
    ElementForSelector<TSchema, TSelector>,
    TSelector
  >
) => boolean) &
  TMethod;

type SelectionQueries<TSelection, TSchema> = (TSelection extends (
  ...args: never[]
) => infer TResult
  ? () => TResult
  : {}) &
  Omit<
    TSelection,
    'isAcrossBlocks' | 'isAtBlockEnd' | 'isAtBlockStart' | 'isWithinBlock'
  > & {
    isAcrossBlocks: SelectionQueryMethod<
      TSchema,
      TSelection extends { isAcrossBlocks: infer TMethod } ? TMethod : never
    >;
    isAtBlockEnd: SelectionQueryMethod<
      TSchema,
      TSelection extends { isAtBlockEnd: infer TMethod } ? TMethod : never
    >;
    isAtBlockStart: SelectionQueryMethod<
      TSchema,
      TSelection extends { isAtBlockStart: infer TMethod } ? TMethod : never
    >;
    isWithinBlock: SelectionQueryMethod<
      TSchema,
      TSelection extends { isWithinBlock: infer TMethod } ? TMethod : never
    >;
  };

type MutationPluginGuard<TMutations, TPlugin> = [
  EditorMutationForPlugin<TMutations, TPlugin>,
] extends [never]
  ? never
  : unknown;

type MutationSchemaCreate<TMutations> = (<
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

type MutationSchemaElement<TMutations> = (<
  const TPlugin extends PluginReference,
>(
  plugin: TPlugin & NoInfer<MutationPluginGuard<TMutations, TPlugin>>
) => EditorSchemaElement | null) &
  EditorStateSchemaApi['element'];

type MutationSchemaAllowsElementType<TMutations> = (<
  const TParent extends PluginReference,
  const TChild extends PluginReference,
>(
  parent: TParent & NoInfer<MutationPluginGuard<TMutations, TParent>>,
  child: TChild & NoInfer<MutationPluginGuard<TMutations, TChild>>
) => boolean) &
  EditorStateSchemaApi['allowsElementType'];

type MutationSchemaIsElementTypeInGroup<TMutations> = (<
  const TPlugin extends PluginReference,
>(
  plugin: TPlugin & NoInfer<MutationPluginGuard<TMutations, TPlugin>>,
  group: string
) => boolean) &
  EditorStateSchemaApi['isElementTypeInGroup'];

type MutationStateSchemaApi<
  V extends Value,
  TMutations,
> = keyof TMutations extends never
  ? EditorStateSchemaApi<V>
  : Omit<
      EditorStateSchemaApi<V>,
      'allowsElementType' | 'create' | 'element' | 'isElementTypeInGroup'
    > & {
      allowsElementType: MutationSchemaAllowsElementType<TMutations>;
      create: MutationSchemaCreate<TMutations>;
      element: MutationSchemaElement<TMutations>;
      isElementTypeInGroup: MutationSchemaIsElementTypeInGroup<TMutations>;
    };

type RawSchemaCreate = (<const TPlugin extends PluginReference>(
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

type RawSchemaElement = (<const TPlugin extends PluginReference>(
  plugin: TPlugin & NoInfer<RawElementPluginGuard<TPlugin>>
) => EditorSchemaElement | null) &
  EditorStateSchemaApi['element'];

type RawSchemaAllowsElementType = (<
  const TParent extends PluginReference,
  const TChild extends PluginReference,
>(
  parent: TParent & NoInfer<RawElementPluginGuard<TParent>>,
  child: TChild & NoInfer<RawElementPluginGuard<TChild>>
) => boolean) &
  EditorStateSchemaApi['allowsElementType'];

type RawSchemaIsElementTypeInGroup = (<const TPlugin extends PluginReference>(
  plugin: TPlugin & NoInfer<RawElementPluginGuard<TPlugin>>,
  group: string
) => boolean) &
  EditorStateSchemaApi['isElementTypeInGroup'];

type RawStateSchemaApi<V extends Value> = Omit<
  EditorStateSchemaApi<V>,
  'allowsElementType' | 'create' | 'element' | 'isElementTypeInGroup'
> & {
  allowsElementType: RawSchemaAllowsElementType;
  create: RawSchemaCreate;
  element: RawSchemaElement;
  isElementTypeInGroup: RawSchemaIsElementTypeInGroup;
};

type SchemaRead = {
  /** Whether an element participates in Plate's normal-flow block content. */
  isBlockContent: (element: Node) => boolean;
};

type PluginEditorStateSchemaApi<V extends Value, D> = SchemaRead &
  (IsAny<D> extends true
    ? EditorStateSchemaApi<V>
    : D extends InternalEditorMutationProvider<infer TMutations>
      ? MutationStateSchemaApi<V, TMutations>
      : RawStateSchemaApi<V>);

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

type PluginEditorApi<V extends Value, D> = Readonly<
  SpecializeCoreEditorApi<
    MergeCapabilityGroups<CoreEditorApi, InstalledPluginApi<D>>,
    V
  >
>;

type InstalledPlateSchemaPlugin<D> = {
  name: 'plate';
} & EditorSchemaPluginProvider<() => SchemaPlugin<D>>;

type InstalledPlatePlugin<V extends Value, D, S = D> = Readonly<{
  name: 'plate';
}> &
  RuntimePluginTypeProvider<
    RuntimePluginCapabilities<{
      api: PluginEditorApi<V, D>;
      read: MergeCapabilityGroups<CoreEditorRead, InstalledPluginRead<D>>;
      update: MergeCapabilityGroups<
        CoreEditorUpdate,
        InstalledPluginUpdate<D, S>
      >;
    }>
  >;

type PluginRuntimePlugins<
  V extends Value,
  D,
  S,
  TRuntimePlugins extends readonly unknown[],
> = readonly [...TRuntimePlugins, InstalledPlatePlugin<V, D, S>];

type AuthoredTransactionPluginDefinition<TPlugin> =
  TPlugin extends PluginDefinitionWitness<
    infer TDefinition extends AnyBasePluginDefinition
  >
    ? TDefinition
    : OwnInferencePluginDefinition<TPlugin>;

type AuthoredTransactionPluginGroup<TPlugin> =
  AuthoredTransactionPluginDefinition<TPlugin> extends infer TDefinition
    ? [TDefinition] extends [never]
      ? never
      : TDefinition extends AnyBasePluginDefinition
        ? Materialize<
            PluginRead<TDefinition> & Materialize<PluginUpdate<TDefinition>>
          >
        : never
    : never;

// oxlint-disable-next-line anti-slop/no-unsafe-dictionary-type -- Widened names intentionally cross an untyped runtime plugin boundary.
type DynamicTransactionPluginGroup = Record<string, any>;

type TransactionPluginPortal = {
  <const TPlugin extends PluginReference>(
    plugin: TPlugin
  ): AuthoredTransactionPluginGroup<TPlugin>;
  // oxlint-disable-next-line anti-slop/no-unsafe-dictionary-type -- Widened names intentionally cross an untyped runtime plugin boundary.
  (name: string): DynamicTransactionPluginGroup;
};

type ExactInstalledTransactionNames<D> = D extends AnyBasePluginDefinition
  ? ExactName<D>
  : never;

type KnownTransactionPluginPortal<TGroups> =
  Extract<keyof TGroups, string> extends never
    ? {}
    : <const TName extends Extract<keyof TGroups, string>>(
        name: TName
      ) => TGroups[TName];

type TransactionPluginPortalSurface<D, S = D> = KnownTransactionPluginPortal<
  InstalledPluginTransaction<D, S>
> &
  TransactionPluginPortal &
  (InstalledPluginTransaction<D, S> extends infer TGroups
    ? 'plugin' extends ExactInstalledTransactionNames<D>
      ? 'plugin' extends keyof TGroups
        ? TGroups['plugin']
        : {}
      : {}
    : {});

type PlateTransactionPlugin<D, S = D> = {
  name: 'plate-transaction';
} & RuntimePluginTypeProvider<
  RuntimePluginCapabilities<{
    update: MergeCapabilityGroups<
      CoreEditorTransaction,
      InstalledPluginTransaction<D, S>
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

type PluginNodeSetProps<D> = Partial<Omit<Element, 'children'>> &
  PluginWritablePropertyPatch<D> &
  PluginForbiddenWritablePropertyPatch<D>;

type PluginNodeSetOptions = Omit<NodeSetNodesOptions<any>, 'at'> & {
  at?: Descendant | Location | NodeKey | NodeSelection;
};

type NodeSelectorOptions<TOptions, TNode extends Node, TSelector> = Omit<
  NonNullable<TOptions>,
  'match' | 'type'
> & {
  match?: NodeMatch<TNode>;
  type: TSelector & ([TNode] extends [never] ? never : unknown);
};

type InsertSplitOptions<TNode extends Node, TSelector> = Omit<
  NonNullable<NodeInsertNodesOptions['split']>,
  'match' | 'type'
> & {
  match?: NodeMatch<TNode>;
  type: TSelector & ([TNode] extends [never] ? never : unknown);
};

type InvalidElementSelectorItem<TItem> = TItem extends PluginReference
  ? [RawEditorMutationForPlugin<TItem>] extends [never]
    ? TItem
    : never
  : never;

type ElementSelectorGuard<TSelector> = [
  InvalidElementSelectorItem<
    TSelector extends ReadonlyArray<infer TItem> ? TItem : TSelector
  >,
] extends [never]
  ? unknown
  : never;

type DirectNodeSelectorOptions<
  TOptions,
  TNode extends Node,
  TSelector,
> = NodeSelectorOptions<TOptions, TNode, TSelector> & {
  type: TSelector & NoInfer<ElementSelectorGuard<TSelector>>;
};

type NodeSelectorSet<S> = <
  const TSelector extends PluginNodeTypeSelector,
  const TProps extends Partial<PropertiesForSelector<S, NoInfer<TSelector>>>,
>(
  props: TProps,
  options: NodeSelectorOptions<
    NodeSetNodesOptions<ElementForSelector<S, TSelector>>,
    ElementForSelector<S, TSelector>,
    TSelector
  >
) => void;

type NodeSelectorUnset<S> = <
  const TSelector extends PluginNodeTypeSelector,
  const TKey extends Extract<
    keyof Omit<ElementForSelector<S, TSelector>, 'children' | 'type'>,
    string
  >,
>(
  property: TKey | readonly TKey[],
  options: NodeSelectorOptions<
    EditorNodeUnsetOptions<ElementForSelector<S, TSelector>>,
    ElementForSelector<S, TSelector>,
    TSelector
  >
) => void;

type PluginTransactionNodes<D, S = D> = Omit<
  EditorUpdateTransaction['nodes'],
  | keyof PluginEditorStateNodes<Value, S>
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
    const TSelector extends PluginNodeTypeSelector,
  >(
    nodes: TNode | readonly TNode[],
    options: Omit<
      NonNullable<Parameters<EditorUpdateTransaction['nodes']['insert']>[1]>,
      'split'
    > & {
      split: InsertSplitOptions<ElementForSelector<S, TSelector>, TSelector>;
    }
  ) => void) &
    (<TNode extends Descendant>(
      nodes: TNode | readonly TNode[],
      options?: NodeInsertOptions
    ) => void) &
    EditorUpdateTransaction['nodes']['insert'];
  lift: (<const TSelector extends PluginNodeTypeSelector>(
    options: NodeSelectorOptions<
      Parameters<EditorUpdateTransaction['nodes']['lift']>[0],
      ElementForSelector<S, TSelector>,
      TSelector
    >
  ) => void) &
    EditorUpdateTransaction['nodes']['lift'];
  merge: (<const TSelector extends PluginNodeTypeSelector>(
    options: NodeSelectorOptions<
      Parameters<EditorUpdateTransaction['nodes']['merge']>[0],
      ElementForSelector<S, TSelector>,
      TSelector
    >
  ) => void) &
    EditorUpdateTransaction['nodes']['merge'];
  move: (<const TSelector extends PluginNodeTypeSelector>(
    options: NodeSelectorOptions<
      Parameters<EditorUpdateTransaction['nodes']['move']>[0],
      ElementForSelector<S, TSelector>,
      TSelector
    >
  ) => void) &
    EditorUpdateTransaction['nodes']['move'];
  remove: (<const TSelector extends PluginNodeTypeSelector>(
    options: NodeSelectorOptions<
      NodeRemoveNodesOptions<ElementForSelector<S, TSelector>>,
      ElementForSelector<S, TSelector>,
      TSelector
    >
  ) => void) &
    EditorUpdateTransaction['nodes']['remove'];
  set: NodeSelectorSet<S> &
    (<const TProps extends PluginNodeSetProps<D>>(
      props: TProps & ValidatePluginWritablePropertyPatch<D, TProps>,
      options?: PluginNodeSetOptions
    ) => void);
  split: (<const TSelector extends PluginNodeTypeSelector>(
    options: NodeSelectorOptions<
      Parameters<EditorUpdateTransaction['nodes']['split']>[0],
      ElementForSelector<S, TSelector>,
      TSelector
    >
  ) => void) &
    EditorUpdateTransaction['nodes']['split'];
  unset: NodeSelectorUnset<S> & {
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
  unwrap: (<const TSelector extends PluginNodeTypeSelector>(
    options: NodeSelectorOptions<
      Parameters<EditorUpdateTransaction['nodes']['unwrap']>[0],
      ElementForSelector<S, TSelector>,
      TSelector
    >
  ) => void) &
    EditorUpdateTransaction['nodes']['unwrap'];
  wrap: (<const TSelector extends PluginNodeTypeSelector>(
    element: Element,
    options: NodeSelectorOptions<
      Parameters<EditorUpdateTransaction['nodes']['wrap']>[1],
      ElementForSelector<S, TSelector>,
      TSelector
    >
  ) => void) &
    EditorUpdateTransaction['nodes']['wrap'];
} & PluginEditorStateNodes<Value, S>;

type WithPluginWritableNodes<TTransaction, D, S = D> = Omit<
  TTransaction,
  'nodes' | 'selection'
> &
  Readonly<{
    nodes: PluginTransactionNodes<D, S>;
    selection: SelectionQueries<
      EditorTransactionSelectionApi<EditorSelection>,
      S
    >;
  }>;

type PluginTransactionForInstalledDefinitions<
  D,
  S = D,
  V extends Value = Value,
  TRuntimePlugins extends readonly unknown[] = readonly [],
> = WithPluginWritableNodes<
  Omit<
    EditorUpdateTransaction<
      V,
      readonly [...TRuntimePlugins, PlateTransactionPlugin<D, S>]
    >,
    'plugin'
  > &
    Readonly<{ plugin: TransactionPluginPortalSurface<D, S> }>,
  D,
  S
>;

type PluginEditorTransactionBuilder<
  V extends Value,
  D,
  S = D,
  TRuntimePlugins extends readonly unknown[] = readonly [],
> = WithPluginWritableNodes<
  Omit<
    EditorTransactionSpecBuilder<
      V,
      readonly [...TRuntimePlugins, PlateTransactionPlugin<D, S>]
    >,
    'plugin'
  > &
    Readonly<{ plugin: TransactionPluginPortalSurface<D, S> }>,
  D,
  S
>;

type PluginEditorStateView<
  V extends Value,
  D,
  S = D,
  TRuntimePlugins extends readonly unknown[] = readonly [],
> = Omit<
  EditorStateView<V, PluginRuntimePlugins<V, D, S, TRuntimePlugins>>,
  'nodes' | 'selection' | 'transaction'
> & {
  nodes: PluginEditorStateNodes<V, S>;
  selection: SelectionQueries<EditorStateSelectionApi<EditorSelection>, S>;
  transaction: ((
    fn: (
      transaction: PluginEditorTransactionBuilder<V, D, S, TRuntimePlugins>
    ) => void
  ) => TransactionSpec) & {
    extend: (
      base: TransactionSpec,
      fn: (
        transaction: PluginEditorTransactionBuilder<V, D, S, TRuntimePlugins>
      ) => void
    ) => TransactionSpec;
  };
};

/** Installed editor state visible while a plugin registers editor behavior. */
export type PluginState<P extends AnyBasePluginDefinition> =
  PluginEditorStateView<
    Value,
    InstalledRuntimePluginDefinitions<P>,
    InstalledRuntimePluginDefinitions<P>
  >;

type PluginEditorRead<
  V extends Value,
  D,
  S = D,
  TRuntimePlugins extends readonly unknown[] = readonly [],
> = Omit<
  EditorReadMethods<V, PluginRuntimePlugins<V, D, S, TRuntimePlugins>>,
  'nodes' | 'selection'
> &
  Readonly<{
    nodes: PluginEditorStateNodes<V, S>;
    selection: SelectionQueries<EditorStateSelectionApi<EditorSelection>, S>;
  }> &
  (<T>(fn: (state: PluginEditorStateView<V, D, S, TRuntimePlugins>) => T) => T);

type PluginEditorNodeSelectorMethod<TMethod, S> = TMethod extends (
  ...args: any[]
) => void
  ? (<const TSelector extends PluginNodeTypeSelector>(
      options: DirectNodeSelectorOptions<
        Parameters<TMethod>[0],
        ElementForSelector<S, TSelector>,
        TSelector
      >
    ) => void) &
      TMethod
  : never;

type PluginEditorInsertNodes<TMethod, S> = TMethod extends (
  ...args: any[]
) => void
  ? (<TNode extends Descendant, const TSelector extends PluginNodeTypeSelector>(
      nodes: TNode | readonly TNode[],
      options: Omit<NonNullable<Parameters<TMethod>[1]>, 'split'> & {
        split: InsertSplitOptions<
          ElementForSelector<S, TSelector>,
          TSelector
        > & {
          type: TSelector & NoInfer<ElementSelectorGuard<TSelector>>;
        };
      }
    ) => void) &
      (<TNode extends Descendant>(
        nodes: TNode | readonly TNode[],
        options?: NodeInsertOptions
      ) => void) &
      TMethod
  : never;

type PluginEditorWrapNodes<TMethod, S> = TMethod extends (
  ...args: any[]
) => void
  ? (<const TSelector extends PluginNodeTypeSelector>(
      element: Element,
      options: DirectNodeSelectorOptions<
        Parameters<TMethod>[1],
        ElementForSelector<S, TSelector>,
        TSelector
      >
    ) => void) &
      TMethod
  : never;

type PluginEditorUpdateNodeMethods<
  V extends Value,
  D,
  S = D,
  TRuntimePlugins extends readonly unknown[] = readonly [],
> = EditorUpdateMethods<
  V,
  PluginRuntimePlugins<V, D, S, TRuntimePlugins>
>['nodes'];

type PluginEditorUpdateNodes<
  V extends Value,
  D,
  S = D,
  TRuntimePlugins extends readonly unknown[] = readonly [],
> = Omit<
  PluginEditorUpdateNodeMethods<V, D, S, TRuntimePlugins>,
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
  insert: PluginEditorInsertNodes<
    PluginEditorUpdateNodeMethods<V, D, S, TRuntimePlugins>['insert'],
    InternalEditorApplicationSchemaProvider
  >;
  lift: PluginEditorNodeSelectorMethod<
    PluginEditorUpdateNodeMethods<V, D, S, TRuntimePlugins>['lift'],
    InternalEditorApplicationSchemaProvider
  >;
  merge: PluginEditorNodeSelectorMethod<
    PluginEditorUpdateNodeMethods<V, D, S, TRuntimePlugins>['merge'],
    InternalEditorApplicationSchemaProvider
  >;
  move: PluginEditorNodeSelectorMethod<
    PluginEditorUpdateNodeMethods<V, D, S, TRuntimePlugins>['move'],
    InternalEditorApplicationSchemaProvider
  >;
  remove: PluginEditorNodeSelectorMethod<
    PluginEditorUpdateNodeMethods<V, D, S, TRuntimePlugins>['remove'],
    InternalEditorApplicationSchemaProvider
  >;
  set: NodeSelectorSet<S> &
    PluginEditorUpdateNodeMethods<V, D, S, TRuntimePlugins>['set'];
  split: PluginEditorNodeSelectorMethod<
    PluginEditorUpdateNodeMethods<V, D, S, TRuntimePlugins>['split'],
    InternalEditorApplicationSchemaProvider
  >;
  unset: NodeSelectorUnset<S> &
    PluginEditorUpdateNodeMethods<V, D, S, TRuntimePlugins>['unset'];
  unwrap: PluginEditorNodeSelectorMethod<
    PluginEditorUpdateNodeMethods<V, D, S, TRuntimePlugins>['unwrap'],
    InternalEditorApplicationSchemaProvider
  >;
  wrap: PluginEditorWrapNodes<
    PluginEditorUpdateNodeMethods<V, D, S, TRuntimePlugins>['wrap'],
    InternalEditorApplicationSchemaProvider
  >;
};

type PluginEditorUpdateMethods<
  V extends Value,
  D,
  S = D,
  TRuntimePlugins extends readonly unknown[] = readonly [],
> = Omit<
  EditorUpdateMethods<V, PluginRuntimePlugins<V, D, S, TRuntimePlugins>>,
  'nodes' | 'selection'
> & {
  nodes: PluginEditorUpdateNodes<V, D, S, TRuntimePlugins>;
  selection: EditorUpdateMethods<V, TRuntimePlugins>['selection'];
};

type PluginEditorUpdatePolicy<
  V extends Value,
  D,
  S = D,
  TRuntimePlugins extends readonly unknown[] = readonly [],
> = Readonly<
  Omit<EditorUpdatePolicy, 'history'> &
    ('history' extends keyof EditorInstalledUpdateGroups<
      V,
      PluginRuntimePlugins<V, D, S, TRuntimePlugins>
    >
      ? Pick<EditorUpdatePolicy, 'history'>
      : { history?: never })
>;

type PluginEditorUpdateOverloads<
  V extends Value,
  D,
  S = D,
  TRuntimePlugins extends readonly unknown[] = readonly [],
> = {
  (
    fn: (
      transaction: PluginTransactionForInstalledDefinitions<
        D,
        S,
        V,
        TRuntimePlugins
      >,
      context: EditorUpdateContext<
        RuntimeBaseEditor<V, PluginRuntimePlugins<V, D, S, TRuntimePlugins>>
      >
    ) => void
  ): void;
  (
    policy: PluginEditorUpdatePolicy<V, D, S, TRuntimePlugins>,
    fn: (
      transaction: PluginTransactionForInstalledDefinitions<
        D,
        S,
        V,
        TRuntimePlugins
      >,
      context: EditorUpdateContext<
        RuntimeBaseEditor<V, PluginRuntimePlugins<V, D, S, TRuntimePlugins>>
      >
    ) => void
  ): void;
  (
    policy: PluginEditorUpdatePolicy<V, D, S, TRuntimePlugins>
  ): PluginEditorUpdateMethods<V, D, S, TRuntimePlugins>;
};

type PluginEditorUpdate<
  V extends Value,
  D,
  S = D,
  TRuntimePlugins extends readonly unknown[] = readonly [],
> = PluginEditorUpdateOverloads<V, D, S, TRuntimePlugins> &
  PluginEditorUpdateMethods<V, D, S, TRuntimePlugins>;

/**
 * Exact document value compiled from an installed Plate graph.
 *
 * @internal
 */
export type InternalPlateValueWithInstalledDefinitions<D> =
  true extends IsBroadPluginDefinition<InstalledSchemaDefinitionsOf<D>>
    ? Value
    : EditorValueFromPlugins<
        readonly [InstalledPlateSchemaPlugin<InstalledSchemaDefinitionsOf<D>>]
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
          SchemaSourceForInstalledDefinitions<InstalledSchemaDefinitionsOf<D>>
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
    ? import('../../facade').Text
    : Extract<
        SchemaText<
          SchemaSourceForInstalledDefinitions<InstalledSchemaDefinitionsOf<D>>
        >,
        import('../../facade').Text
      >;

export type PluginTransaction<
  P extends AnyBasePluginDefinition = BasePluginDefinition,
> =
  true extends IsBroadPluginDefinition<P>
    ? Omit<
        PluginTransactionForInstalledDefinitions<
          InstalledRuntimePluginDefinitions<P>,
          InstalledPluginDefinition<P>
        >,
        'plugin'
      > &
        Readonly<{ plugin: TransactionPluginPortal }>
    : PluginTransactionForInstalledDefinitions<
        InstalledRuntimePluginDefinitions<P>,
        InstalledPluginDefinition<P>
      >;

/** Installed state capabilities visible while a plugin constructs a read group. */
type PluginReadStateForInstalledDefinitions<D> = PluginEditorStateView<
  Value,
  D,
  D
>;

export type PluginReadState<P extends AnyBasePluginDefinition> =
  PluginReadStateForInstalledDefinitions<InstalledRuntimePluginDefinitions<P>>;

type OwnInstalledPlatePlugin<P> = {
  name: 'plate';
} & RuntimePluginTypeProvider<
  RuntimePluginCapabilities<{
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
export type PluginReadCapability<P extends AnyBasePluginDefinition> =
  PluginRead<Extract<OwnInferencePluginDefinition<P>, AnyBasePluginDefinition>>;

type PluginUpdateMethods<
  P extends AnyBasePluginDefinition,
  S = P,
> = Materialize<
  PluginUpdateGroup<
    S extends InternalEditorMutationProvider<unknown>
      ? S
      : S extends InternalEditorApplicationSchemaProvider
        ? S
        : InternalEditorMutationProvider<RawEditorMutationsForPlugin<P>>,
    Extract<OwnInferencePluginDefinition<P>, AnyBasePluginDefinition>
  >
>;

/** One-shot update methods exposed directly by one plugin portal. */
export type PluginUpdate<
  P extends AnyBasePluginDefinition,
  S = P,
> = PluginUpdateMethods<P, S> &
  ((policy: EditorUpdatePolicy) => PluginUpdateMethods<P, S>);

export type PluginOwnUpdate<P extends AnyBasePluginDefinition> =
  RuntimeBaseEditor<
    Value,
    readonly [InstalledPlatePlugin<Value, AnyBasePluginDefinition>]
  >['update'] &
    RuntimeBaseEditor<Value, readonly [OwnInstalledPlatePlugin<P>]>['update'];

/**
 * Editor projection for definitions already lowered by `InferPlugins`.
 *
 * @internal
 */
export type InternalEditorWithInstalledPluginDefinitions<
  V extends Value,
  D,
  S = D,
  TRuntimePlugins extends readonly unknown[] = readonly [],
> = {
  api: PluginEditorApi<V, D> &
    RuntimeBaseEditor<V, PluginRuntimePlugins<V, D, S, TRuntimePlugins>>['api'];
  plugin: RuntimeBaseEditor<
    V,
    PluginRuntimePlugins<V, D, S, TRuntimePlugins>
  >['plugin'];
  read: PluginEditorRead<V, D, S, TRuntimePlugins> & {
    schema: PluginEditorStateSchemaApi<V, S>;
  };
  update: PluginEditorUpdate<V, D, S, TRuntimePlugins>;
} & EditorValueTypeProvider<() => V> &
  EditorStateViewProvider<
    () => PluginEditorStateView<V, D, S, TRuntimePlugins>
  > &
  EditorUpdateTransactionProvider<
    () => PluginTransactionForInstalledDefinitions<D, S, V, TRuntimePlugins>
  > &
  RuntimeBaseEditor<V, PluginRuntimePlugins<V, D, S, TRuntimePlugins>>;

export type EditorWithPlugins<
  V extends Value,
  P extends AnyBasePluginDefinition,
> = InternalEditorWithInstalledPluginDefinitions<
  V,
  InstalledRuntimePluginDefinitions<P>,
  InstalledRuntimePluginDefinitions<P>
>;
