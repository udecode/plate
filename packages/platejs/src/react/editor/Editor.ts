import type {
  RuntimePluginPortal,
  RuntimePluginReference,
  Value,
} from '../../facade';
import type { GeneratedEditorMutations } from '../../internal/editor/generatedEditorTypes';
import type {
  AnyBasePlugin,
  AnyBasePluginDefinition,
  AnyPluginBase,
  BasePluginInput,
  InferPlugins,
  InferEditorRuntimePlugins,
  InternalEditorMutationProvider,
  InternalInstalledSchemaMutationProvider,
  InternalBaseEditorWithInstalledPlugins,
  MergeInstalledPluginDefinitions,
  PluginReference,
} from '../../lib';
import type { CoreEditorApi } from '../../lib/editor/coreEditorCapabilityDefinition.internal';
import type { InternalPluginDefinitionOf } from '../../lib/plugin/pluginDefinitionLookup.internal';
import type {
  CorePluginDefinition,
  CorePlugins,
} from '../../lib/plugins/getCorePlugins.internal';
import type { ReactApi } from '../plite-react';
import type {
  AnyResolvedPlugin,
  AnyPlugin,
  DynamicPluginPortal,
  PluginPortal,
} from '../plugin/PlatePlugin';
import type { ReactCorePlugins } from './getPlateCorePlugins.internal';

declare const reactEditorReference: unique symbol;

/** Nominal identity shared by every Plate editor specialization. */
export type EditorReference = Readonly<{
  [reactEditorReference]: true;
}>;

type InternalReactEditorBase<
  V extends Value,
  D,
  S,
  TRuntimePlugins extends readonly unknown[],
> = Omit<
  InternalBaseEditorWithInstalledPlugins<V, D, S, TRuntimePlugins>,
  'plugin'
>;

type PortalFor<TPlugin, S> = [InternalPluginDefinitionOf<TPlugin>] extends [
  never,
]
  ? DynamicPluginPortal
  : PluginPortal<
      Extract<InternalPluginDefinitionOf<TPlugin>, AnyBasePluginDefinition>,
      S
    >;

type InternalPluginPortal<V extends Value, S> = {
  <TPlugin extends PluginReference>(plugin: TPlugin): PortalFor<TPlugin, S>;
  (
    plugin: AnyResolvedPlugin | AnyPlugin | AnyBasePlugin | AnyPluginBase
  ): DynamicPluginPortal;
  <const TPlugin extends RuntimePluginReference>(
    plugin: TPlugin
  ): RuntimePluginPortal<TPlugin, V>;
};

type NormalizePluginInput<TPlugins> =
  TPlugins extends readonly BasePluginInput[]
    ? TPlugins
    : TPlugins extends BasePluginInput
      ? readonly [TPlugins]
      : readonly [];

type InstalledRuntimeCorePlugin = MergeInstalledPluginDefinitions<
  InferEditorRuntimePlugins<CorePlugins>,
  InferEditorRuntimePlugins<ReactCorePlugins>
>;

type PlateInstalledSchemaCorePlugin = MergeInstalledPluginDefinitions<
  CorePluginDefinition,
  InferPlugins<ReactCorePlugins>
>;

type MergeEditorRuntimePlugins<D> = MergeInstalledPluginDefinitions<
  InstalledRuntimeCorePlugin,
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
export type InferEditorPlugins<TPlugins> =
  NormalizePluginInput<TPlugins>[number] extends never
    ? InstalledRuntimeCorePlugin
    : MergeEditorRuntimePlugins<
        InferEditorRuntimePlugins<NormalizePluginInput<TPlugins>>
      >;

/**
 * Lower schema definitions separately from runtime capabilities.
 *
 * @internal
 */
export type InferPlateEditorSchemaPlugins<TPlugins> =
  NormalizePluginInput<TPlugins>[number] extends never
    ? PlateInstalledSchemaCorePlugin
    : MergePlateEditorSchemaPlugins<
        InferPlugins<NormalizePluginInput<TPlugins>>
      >;

export type InternalReactEditorMutationProvider<
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
export type InternalReactEditorWithInstalledPlugins<
  V extends Value,
  D,
  S = D,
  TRuntimePlugins extends readonly unknown[] = readonly [],
> = EditorReference &
  InternalReactEditorBase<V, D, S, TRuntimePlugins> & {
    readonly api: InternalBaseEditorWithInstalledPlugins<
      V,
      D,
      S,
      TRuntimePlugins
    >['api'] &
      CoreEditorApi<V> & {
        react: ReactApi;
      };
    plugin: InternalPluginPortal<V, S>;
  };

/** Editor selected by value, runtime plugins, Plate plugins, and schema. */
export type Editor<
  V extends Value = never,
  TRuntimePlugins extends readonly unknown[] = never,
  TPlugins = never,
  TSchema = undefined,
> = [TPlugins] extends [never]
  ? [V] extends [never]
    ? InternalReactEditorWithInstalledPlugins<
        any,
        AnyBasePluginDefinition,
        AnyBasePluginDefinition,
        readonly RuntimePluginReference[]
      >
    : InternalReactEditorWithInstalledPlugins<
        V,
        AnyBasePluginDefinition,
        AnyBasePluginDefinition,
        [TRuntimePlugins] extends [never]
          ? readonly RuntimePluginReference[]
          : TRuntimePlugins
      >
  : InferEditorPlugins<TPlugins> extends infer D
    ? InternalReactEditorWithInstalledPlugins<
        [V] extends [never] ? Value : V,
        D,
        InternalReactEditorMutationProvider<TPlugins, D, TSchema>,
        [TRuntimePlugins] extends [never] ? readonly [] : TRuntimePlugins
      >
    : never;
