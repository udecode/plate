import type { Value } from '@platejs/plite';

import type {
  AnyBasePluginDefinition,
  InferName,
  PluginReference,
} from '../plugin/PluginDefinition';
import type { InternalPluginDefinitionOf } from '../plugin/pluginDefinitionLookup.internal';
import type {
  AnyBasePlugin,
  AnyBasePluginPortal,
  AnyResolvedBasePlugin,
  BasePluginPortal,
} from '../plugin/BasePlugin';
import type {
  CoreEditorCapabilityDefinition,
  CoreNodePluginName,
} from './coreEditorCapabilityDefinition.internal';
import type {
  InternalPliteEditorWithInstalledPlateDefinitions,
  PliteEditorWithPlatePlugins,
} from './pluginRuntimeTypes';

export type {
  BasePluginInput,
  InferPlugins,
  MergeInstalledPluginDefinitions,
} from './pluginRuntimeTypes';

export type PlateSchemaIdentity = Readonly<{
  id: string;
  version: number;
}>;

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

type PlatePluginRuntime = {
  plugin: GetBasePluginPortal;
};

type GetBasePluginPortal = {
  <P extends (AnyBasePlugin | AnyResolvedBasePlugin) & PluginReference>(
    plugin: P
  ): BasePluginPortal<InternalPluginDefinitionOf<P>>;
  (pluginName: string): AnyBasePluginPortal;
};

export type NameofPlugins<T extends AnyBasePluginDefinition> =
  | (string & {})
  | InferName<CoreEditorCapabilityDefinition | T>;

export type NameofNodePlugins<T extends AnyBasePluginDefinition> =
  | (string & {})
  | CoreNodePluginName
  | InferName<T>;

export type BaseEditor<
  V extends Value = Value,
  P extends AnyBasePluginDefinition = AnyBasePluginDefinition,
> = PliteEditorWithPlatePlugins<V, P> & PlateEditorRuntime & PlatePluginRuntime;

/** @internal Editor whose plugin definition union is already lowered. */
export type InternalBaseEditorWithInstalledPlugins<
  V extends Value,
  D,
> = InternalPliteEditorWithInstalledPlateDefinitions<V, D> &
  PlateEditorRuntime &
  PlatePluginRuntime;
