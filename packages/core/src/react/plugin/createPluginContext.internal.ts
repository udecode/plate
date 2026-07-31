import type { Value } from '@platejs/plite';

import type { PlateEditor } from '../editor';
import type {
  AnyEditorPlatePlugin,
  AnyPlatePlugin,
  AnyPlatePluginContext,
  PlatePluginContext,
} from './PlatePlugin';

import type {
  AnyBasePlugin,
  AnyBasePluginDefinition,
  AnyResolvedBasePlugin,
  PluginReference,
} from '../../lib';
import { createPluginContext as createBasePluginContext } from '../../lib/plugin/createPluginContext.internal';
import type { InternalPluginDefinitionOf } from '../../lib/plugin/pluginDefinitionLookup.internal';

export function createPluginContext<
  V extends Value,
  E extends AnyBasePluginDefinition,
  P extends (
    | AnyBasePlugin
    | AnyEditorPlatePlugin
    | AnyPlatePlugin
    | AnyResolvedBasePlugin
  ) &
    PluginReference,
>(
  editor: PlateEditor<V, E>,
  plugin: P
): PlatePluginContext<InternalPluginDefinitionOf<P>>;
export function createPluginContext(
  editor: PlateEditor<any, any>,
  plugin:
    | AnyBasePlugin
    | AnyEditorPlatePlugin
    | AnyPlatePlugin
    | AnyResolvedBasePlugin
    | string
): AnyPlatePluginContext;
export function createPluginContext(
  editor: object,
  plugin:
    | AnyBasePlugin
    | AnyEditorPlatePlugin
    | AnyPlatePlugin
    | AnyResolvedBasePlugin
    | string
): unknown {
  return Reflect.apply(createBasePluginContext, undefined, [editor, plugin]);
}
