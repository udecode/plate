import type { Value } from '../../facade';
import type { GeneratedEditorMutations } from '../../internal/editor/generatedEditorTypes';
import type {
  AnyBasePlugin,
  AnyBasePluginDefinition,
  AnyPluginBase,
  BasePluginPortal,
  BasePluginInput,
  CorePluginDefinition,
  CorePlugins,
  InferPlugins,
  InferEditorRuntimePlugins,
  InternalEditorMutationProvider,
  InternalInstalledSchemaMutationProvider,
  InternalBaseEditorWithInstalledPlugins,
  MergeInstalledPluginDefinitions,
  DynamicBasePluginPortal,
  PluginReference,
} from '../../lib';
import type { CoreEditorApi } from '../../lib/editor/coreEditorCapabilityDefinition.internal';
import type { InternalPluginDefinitionOf } from '../../lib/plugin/pluginDefinitionLookup.internal';
import type { ReactApi } from '../plite-react';
import type {
  AnyResolvedPlatePlugin,
  AnyPlatePlugin,
  DynamicPlatePluginPortal,
  PlatePluginPortal,
} from '../plugin/PlatePlugin';
import type { PlateCorePlugins } from './getPlateCorePlugins';

declare const plateEditorReference: unique symbol;

/** Nominal identity shared by every Plate editor specialization. */
export type EditorReference = Readonly<{
  [plateEditorReference]: true;
}>;

type InternalPlateEditorBase<
  V extends Value,
  D,
  S,
  TExtensions extends readonly unknown[],
> = Omit<
  InternalBaseEditorWithInstalledPlugins<V, D, S, TExtensions>,
  'plugin'
>;

type PlatePortalFor<TPlugin, S> = [
  InternalPluginDefinitionOf<TPlugin>,
] extends [never]
  ? DynamicPlatePluginPortal
  : PlatePluginPortal<
      Extract<InternalPluginDefinitionOf<TPlugin>, AnyBasePluginDefinition>,
      S
    >;

type BasePortalFor<TPlugin, S> = [InternalPluginDefinitionOf<TPlugin>] extends [
  never,
]
  ? DynamicBasePluginPortal
  : BasePluginPortal<
      Extract<InternalPluginDefinitionOf<TPlugin>, AnyBasePluginDefinition>,
      S
    >;

type InternalPlatePluginPortal<S> = {
  <TPlugin extends (AnyResolvedPlatePlugin | AnyPlatePlugin) & PluginReference>(
    plugin: TPlugin
  ): PlatePortalFor<TPlugin, S>;
  <TPlugin extends (AnyBasePlugin | AnyPluginBase) & PluginReference>(
    plugin: TPlugin
  ): BasePortalFor<TPlugin, S>;
  (
    plugin: AnyBasePlugin | AnyPluginBase | PluginReference | string
  ): DynamicPlatePluginPortal;
};

type NormalizePlatePluginInput<TPlugins> =
  TPlugins extends readonly BasePluginInput[]
    ? TPlugins
    : TPlugins extends BasePluginInput
      ? readonly [TPlugins]
      : readonly [];

type PlateInstalledRuntimeCorePlugin = MergeInstalledPluginDefinitions<
  InferEditorRuntimePlugins<CorePlugins>,
  InferEditorRuntimePlugins<PlateCorePlugins>
>;

type PlateInstalledSchemaCorePlugin = MergeInstalledPluginDefinitions<
  CorePluginDefinition,
  InferPlugins<PlateCorePlugins>
>;

type MergePlateEditorRuntimePlugins<D> = MergeInstalledPluginDefinitions<
  PlateInstalledRuntimeCorePlugin,
  D
>;

type MergePlateEditorSchemaPlugins<D> = MergeInstalledPluginDefinitions<
  PlateInstalledSchemaCorePlugin,
  D
>;

/**
 * Lower a configured plugin input into the installed Plate graph.
 *
 * @internal
 */
export type InferPlateEditorPlugins<TPlugins> =
  NormalizePlatePluginInput<TPlugins>[number] extends never
    ? PlateInstalledRuntimeCorePlugin
    : MergePlateEditorRuntimePlugins<
        InferEditorRuntimePlugins<NormalizePlatePluginInput<TPlugins>>
      >;

/**
 * Lower schema definitions separately from runtime capabilities.
 *
 * @internal
 */
export type InferPlateEditorSchemaPlugins<TPlugins> =
  NormalizePlatePluginInput<TPlugins>[number] extends never
    ? PlateInstalledSchemaCorePlugin
    : MergePlateEditorSchemaPlugins<
        InferPlugins<NormalizePlatePluginInput<TPlugins>>
      >;

export type InternalPlateEditorMutationProvider<
  TPlugins,
  TRuntime,
  TSchema = undefined,
> = [GeneratedEditorMutations<TPlugins>] extends [never]
  ? InternalInstalledSchemaMutationProvider<TRuntime, TSchema>
  : InternalEditorMutationProvider<GeneratedEditorMutations<TPlugins>>;

/**
 * React editor whose plugin definition union is already lowered.
 *
 * @internal
 */
export type InternalPlateEditorWithInstalledPlugins<
  V extends Value,
  D,
  S = D,
  TExtensions extends readonly unknown[] = readonly [],
> = EditorReference &
  InternalPlateEditorBase<V, D, S, TExtensions> & {
    readonly api: InternalBaseEditorWithInstalledPlugins<
      V,
      D,
      S,
      TExtensions
    >['api'] &
      CoreEditorApi<V> & {
        react: ReactApi;
      };
    plugin: InternalPlatePluginPortal<S>;
  };

/** Editor selected by value, low-level extensions, Plate plugins, and schema. */
export type Editor<
  V extends Value = never,
  TExtensions extends readonly unknown[] = never,
  TPlugins = never,
  TSchema = undefined,
> = [TPlugins] extends [never]
  ? [V] extends [never]
    ? InternalPlateEditorWithInstalledPlugins<
        any,
        AnyBasePluginDefinition,
        AnyBasePluginDefinition
      >
    : InternalPlateEditorWithInstalledPlugins<
        V,
        AnyBasePluginDefinition,
        AnyBasePluginDefinition,
        [TExtensions] extends [never] ? readonly [] : TExtensions
      >
  : InferPlateEditorPlugins<TPlugins> extends infer D
    ? InternalPlateEditorWithInstalledPlugins<
        [V] extends [never] ? Value : V,
        D,
        InternalPlateEditorMutationProvider<TPlugins, D, TSchema>,
        [TExtensions] extends [never] ? readonly [] : TExtensions
      >
    : never;
