import type { Value } from '@platejs/plite';

import type {
  AnyBasePluginDefinition,
  PluginReference,
} from '../plugin/PluginDefinition';
import type { InternalPluginDefinitionOf } from '../plugin/pluginDefinitionLookup.internal';
import type {
  AnyBasePlugin,
  AnyPluginBase,
  BasePluginPortal,
  DynamicBasePluginPortal,
} from '../plugin/BasePlugin';
import type {
  BasePluginInput,
  InternalPliteEditorWithInstalledPlateDefinitions,
  PliteEditorWithPlatePlugins,
  InferEditorRuntimePlugins,
  InternalEditorMutationProvider,
  InternalInstalledSchemaMutationProvider,
  MergeInstalledPluginDefinitions,
} from './pluginRuntimeTypes';
import type {
  GeneratedEditorMutations,
  GeneratedEditorValue,
} from '../../internal/editor/generatedEditorTypes';
import type { CorePlugins } from '../plugins/getCorePlugins';

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

type GetBasePluginPortal<S> = {
  <P extends (AnyBasePlugin | AnyPluginBase) & PluginReference>(
    plugin: P
  ): BasePluginPortal<InternalPluginDefinitionOf<P>, S>;
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

/** @internal Base runtime projected from one authored plugin definition. */
export type InternalBaseEditorWithPlatePlugins<
  V extends Value,
  P extends AnyBasePluginDefinition,
> = PliteEditorWithPlatePlugins<V, P> &
  PlateEditorRuntime &
  PlatePluginRuntime<P>;

export type BaseEditor<TPlugins = never, TSchema = undefined> = [
  TPlugins,
] extends [never]
  ? InternalBaseEditorWithInstalledPlugins<
      any,
      AnyBasePluginDefinition,
      AnyBasePluginDefinition
    >
  : InferBaseEditorPlugins<TPlugins> extends infer D
    ? InternalBaseEditorWithInstalledPlugins<
        GeneratedEditorValue<TPlugins>,
        D,
        InternalBaseEditorMutationProvider<TPlugins, D, TSchema>
      >
    : never;

/** @internal Editor whose plugin definition union is already lowered. */
export type InternalBaseEditorWithInstalledPlugins<
  V extends Value,
  D,
  S = D,
> = InternalPliteEditorWithInstalledPlateDefinitions<V, D, S> &
  PlateEditorRuntime &
  PlatePluginRuntime<S>;
