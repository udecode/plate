import type { Value } from '@platejs/plite';
import type { ReactEditor } from '@platejs/plite-react';

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
import type {
  GeneratedEditorMutations,
  GeneratedEditorValue,
} from '../../internal/editor/generatedEditorTypes';
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

/** @internal Lower a configured plugin input into the installed Plate graph. */
export type InferPlateEditorPlugins<TPlugins> =
  NormalizePlatePluginInput<TPlugins>[number] extends never
    ? PlateInstalledRuntimeCorePlugin
    : MergePlateEditorRuntimePlugins<
        InferEditorRuntimePlugins<NormalizePlatePluginInput<TPlugins>>
      >;

/** @internal Lower schema definitions separately from runtime capabilities. */
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

/** @internal React editor whose plugin definition union is already lowered. */
export type InternalPlateEditorWithInstalledPlugins<
  V extends Value,
  D,
  S = D,
> = PlateEditorReference &
  InternalPlateEditorBase<V, D, S> & {
    readonly api: InternalBaseEditorWithInstalledPlugins<V, D, S>['api'] &
      ReactEditor<V>['api'];
    extension: InternalBaseEditorWithInstalledPlugins<V, D, S>['extension'] &
      ReactEditor<V>['extension'];
    plugin: InternalPlatePluginPortal<S>;
    read: InternalBaseEditorWithInstalledPlugins<V, D, S>['read'] &
      ReactEditor<V>['read'];
    update: InternalBaseEditorWithInstalledPlugins<V, D, S>['update'] &
      ReactEditor<V>['update'];
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
