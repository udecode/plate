import type { Value } from '@platejs/plite';
import type { ReactApi } from '@platejs/plite-react';

import type {
  GeneratedEditorMutations,
  GeneratedEditorValue,
} from '../../internal/editor/generatedEditorTypes';
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
  PluginReference,
} from '../../lib';
import type { CoreEditorApi } from '../../lib/editor/coreEditorCapabilityDefinition.internal';
import type { InternalPluginDefinitionOf } from '../../lib/plugin/pluginDefinitionLookup.internal';
import type {
  AnyResolvedPlatePlugin,
  AnyPlatePlugin,
  DynamicPlatePluginPortal,
  PlatePluginPortal,
} from '../plugin/PlatePlugin';
import type { PlateCorePlugins } from './getPlateCorePlugins';

declare const plateEditorReference: unique symbol;

/** Nominal identity shared by every Plate editor specialization. */
export type PlateEditorReference = Readonly<{
  [plateEditorReference]: true;
}>;

type InternalPlateEditorBase<V extends Value, D, S> = Omit<
  InternalBaseEditorWithInstalledPlugins<V, D, S>,
  'plugin'
>;

type InternalPlatePluginPortal<S> = {
  <TPlugin extends (AnyResolvedPlatePlugin | AnyPlatePlugin) & PluginReference>(
    plugin: TPlugin
  ): PlatePluginPortal<InternalPluginDefinitionOf<TPlugin>, S>;
  <TPlugin extends (AnyBasePlugin | AnyPluginBase) & PluginReference>(
    plugin: TPlugin
  ): BasePluginPortal<InternalPluginDefinitionOf<TPlugin>, S>;
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
> = PlateEditorReference &
  InternalPlateEditorBase<V, D, S> & {
    readonly api: InternalBaseEditorWithInstalledPlugins<V, D, S>['api'] &
      CoreEditorApi<V> & {
        react: ReactApi;
      };
    plugin: InternalPlatePluginPortal<S>;
  };

/** Plate editor inferred directly from its public plugin tuple. */
export type PlateEditor<TPlugins = never, TSchema = undefined> = [
  TPlugins,
] extends [never]
  ? InternalPlateEditorWithInstalledPlugins<
      any,
      AnyBasePluginDefinition,
      AnyBasePluginDefinition
    >
  : InferPlateEditorPlugins<TPlugins> extends infer D
    ? InternalPlateEditorWithInstalledPlugins<
        GeneratedEditorValue<TPlugins>,
        D,
        InternalPlateEditorMutationProvider<TPlugins, D, TSchema>
      >
    : never;
