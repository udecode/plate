import type { Value } from '../../facade';
import type {
  AnyBasePlugin,
  AnyBasePluginDefinition,
  AnyPluginBase,
  PluginReference,
} from '../../lib';
import { createPluginContext as createBaseContext } from '../../lib/plugin/createPluginContext.internal';
import type { InternalPluginDefinitionOf } from '../../lib/plugin/pluginDefinitionLookup.internal';
import type { InternalReactEditorWithInstalledPlugins } from '../editor/Editor';
import type {
  AnyResolvedPlugin,
  AnyPlugin,
  AnyPluginContext,
  PluginContext,
} from './PlatePlugin';

export function createPluginContext<
  V extends Value,
  E extends AnyBasePluginDefinition,
  P extends (AnyBasePlugin | AnyResolvedPlugin | AnyPlugin | AnyPluginBase) &
    PluginReference,
>(
  editor: InternalReactEditorWithInstalledPlugins<V, E>,
  plugin: P
): PluginContext<InternalPluginDefinitionOf<P>>;
export function createPluginContext<
  V extends Value,
  E extends AnyBasePluginDefinition,
>(
  editor: InternalReactEditorWithInstalledPlugins<V, E>,
  plugin:
    | AnyBasePlugin
    | AnyResolvedPlugin
    | AnyPlugin
    | AnyPluginBase
    | PluginReference
    | string
): AnyPluginContext;
export function createPluginContext(
  editor: object,
  plugin:
    | AnyBasePlugin
    | AnyResolvedPlugin
    | AnyPlugin
    | AnyPluginBase
    | PluginReference
    | string
): unknown {
  return Reflect.apply(createBaseContext, undefined, [editor, plugin]);
}
