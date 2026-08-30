import type { Value } from 'plitejs';

import type { GeneratedEditorMutations } from '../../internal/editor/generatedEditorTypes';
import type {
  AnyBasePlugin,
  AnyPluginBase,
  BasePluginPortal,
  DynamicBasePluginPortal,
} from '../plugin/BasePlugin';
import type {
  AnyBasePluginDefinition,
  PluginReference,
} from '../plugin/PluginDefinition';
import type { InternalPluginDefinitionOf } from '../plugin/pluginDefinitionLookup.internal';
import type { CorePlugins } from '../plugins/getCorePlugins';
import type {
  BasePluginInput,
  InternalPliteEditorWithInstalledPlateDefinitions,
  PliteEditorWithPlatePlugins,
  InferEditorRuntimePlugins,
  InternalEditorMutationProvider,
  InternalInstalledSchemaMutationProvider,
  MergeInstalledPluginDefinitions,
} from './pluginRuntimeTypes';

export type {
  BasePluginInput,
  InferPlugins,
  InferEditorRuntimePlugins,
  InferRuntimePlugins,
  MergeInstalledPluginDefinitions,
} from './pluginRuntimeTypes';

type PlateEditorRuntime = {
  runtime: {
    /**
     * Current user ID for collaborative features (e.g., Yjs). Used to identify
     * the creator of elements like combobox inputs.
     */
    userId?: string | null;
    /** Whether initial value transformation is currently running. */
    isNormalizing?: boolean;
  };
};

type PlatePluginRuntime<S> = {
  plugin: GetBasePluginPortal<S>;
};

type BasePortalFor<P, S> = [InternalPluginDefinitionOf<P>] extends [never]
  ? DynamicBasePluginPortal
  : BasePluginPortal<
      Extract<InternalPluginDefinitionOf<P>, AnyBasePluginDefinition>,
      S
    >;

type GetBasePluginPortal<S> = {
  <P extends (AnyBasePlugin | AnyPluginBase) & PluginReference>(
    plugin: P
  ): BasePortalFor<P, S>;
  (
    plugin: AnyBasePlugin | AnyPluginBase | PluginReference | string
  ): DynamicBasePluginPortal;
};

type NormalizeBasePluginInput<TPlugins> =
  TPlugins extends readonly BasePluginInput[]
    ? TPlugins
    : TPlugins extends BasePluginInput
      ? readonly [TPlugins]
      : readonly [];

export type InferBaseEditorPlugins<TPlugins> = MergeInstalledPluginDefinitions<
  InferEditorRuntimePlugins<CorePlugins>,
  InferEditorRuntimePlugins<NormalizeBasePluginInput<TPlugins>>
>;

export type InternalBaseEditorMutationProvider<
  TPlugins,
  TRuntime,
  TSchema = undefined,
> = [GeneratedEditorMutations<TPlugins>] extends [never]
  ? InternalInstalledSchemaMutationProvider<TRuntime, TSchema>
  : InternalEditorMutationProvider<GeneratedEditorMutations<TPlugins>>;

/**
 * Base runtime projected from one authored plugin definition.
 *
 * @internal
 */
export type InternalBaseEditorWithPlatePlugins<
  V extends Value,
  P extends AnyBasePluginDefinition,
> = PliteEditorWithPlatePlugins<V, P> &
  PlateEditorRuntime &
  PlatePluginRuntime<P>;

/** Editor selected by value, low-level extensions, Plate plugins, and schema. */
export type Editor<
  V extends Value = never,
  TExtensions extends readonly unknown[] = never,
  TPlugins = never,
  TSchema = undefined,
> = [TPlugins] extends [never]
  ? [V] extends [never]
    ? InternalBaseEditorWithInstalledPlugins<
        any,
        AnyBasePluginDefinition,
        AnyBasePluginDefinition
      >
    : InternalBaseEditorWithInstalledPlugins<
        V,
        AnyBasePluginDefinition,
        AnyBasePluginDefinition,
        [TExtensions] extends [never] ? readonly [] : TExtensions
      >
  : InferBaseEditorPlugins<TPlugins> extends infer D
    ? InternalBaseEditorWithInstalledPlugins<
        [V] extends [never] ? Value : V,
        D,
        InternalBaseEditorMutationProvider<TPlugins, D, TSchema>,
        [TExtensions] extends [never] ? readonly [] : TExtensions
      >
    : never;

/**
 * Editor whose plugin definition union is already lowered.
 *
 * @internal
 */
export type InternalBaseEditorWithInstalledPlugins<
  V extends Value,
  D,
  S = D,
  TExtensions extends readonly unknown[] = readonly [],
> = InternalPliteEditorWithInstalledPlateDefinitions<V, D, S, TExtensions> &
  PlateEditorRuntime &
  PlatePluginRuntime<S>;
