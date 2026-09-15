import type {
  RuntimePluginPortal,
  RuntimePluginReference,
  Value,
} from '../../facade';
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
import type { CorePlugins } from '../plugins/getCorePlugins.internal';
import type {
  BasePluginInput,
  InternalEditorWithInstalledPluginDefinitions,
  EditorWithPlugins,
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

type PluginEditorRuntime = {
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

type BasePortalFor<P, S> = [InternalPluginDefinitionOf<P>] extends [never]
  ? DynamicBasePluginPortal
  : BasePluginPortal<
      Extract<InternalPluginDefinitionOf<P>, AnyBasePluginDefinition>,
      S
    >;

type GetBasePluginPortal<V extends Value, S> = {
  <P extends PluginReference>(plugin: P): BasePortalFor<P, S>;
  (
    plugin: AnyBasePlugin | AnyPluginBase | PluginReference
  ): DynamicBasePluginPortal;
  <const TPlugin extends RuntimePluginReference>(
    plugin: TPlugin
  ): RuntimePluginPortal<TPlugin, V>;
};

type PluginRuntime<V extends Value, S> = {
  plugin: GetBasePluginPortal<V, S>;
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
export type InternalBaseEditorWithPlugins<
  V extends Value,
  P extends AnyBasePluginDefinition,
> = Omit<EditorWithPlugins<V, P>, 'plugin'> &
  PluginEditorRuntime &
  PluginRuntime<V, P>;

/** Editor selected by value, runtime plugins, Plate plugins, and schema. */
export type Editor<
  V extends Value = never,
  TRuntimePlugins extends readonly unknown[] = never,
  TPlugins = never,
  TSchema = undefined,
> = [TPlugins] extends [never]
  ? [V] extends [never]
    ? InternalBaseEditorWithInstalledPlugins<
        any,
        AnyBasePluginDefinition,
        AnyBasePluginDefinition,
        readonly RuntimePluginReference[]
      >
    : InternalBaseEditorWithInstalledPlugins<
        V,
        AnyBasePluginDefinition,
        AnyBasePluginDefinition,
        [TRuntimePlugins] extends [never]
          ? readonly RuntimePluginReference[]
          : TRuntimePlugins
      >
  : InferBaseEditorPlugins<TPlugins> extends infer D
    ? InternalBaseEditorWithInstalledPlugins<
        [V] extends [never] ? Value : V,
        D,
        InternalBaseEditorMutationProvider<TPlugins, D, TSchema>,
        [TRuntimePlugins] extends [never] ? readonly [] : TRuntimePlugins
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
  TRuntimePlugins extends readonly unknown[] = readonly [],
> = Omit<
  InternalEditorWithInstalledPluginDefinitions<V, D, S, TRuntimePlugins>,
  'plugin'
> &
  PluginEditorRuntime &
  PluginRuntime<V, S>;
