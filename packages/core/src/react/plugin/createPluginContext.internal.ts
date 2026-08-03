import type { Value } from '@platejs/plite';

import type { InternalPlateEditorWithInstalledPlugins } from '../editor/PlateEditor';
import type {
  AnyResolvedPlatePlugin,
  AnyPlatePlugin,
  AnyPlatePluginContext,
  AnyPlatePluginPortal,
  PlatePluginContext,
  PlatePluginPortal,
} from './PlatePlugin';

import type {
  AnyBasePlugin,
  AnyBasePluginDefinition,
  AnyPluginBase,
  PluginReference,
} from '../../lib';
import {
  createPluginContext as createBaseContext,
  createPluginPortal as createBasePortal,
} from '../../lib/plugin/createPluginContext.internal';
import type { InternalPluginDefinitionOf } from '../../lib/plugin/pluginDefinitionLookup.internal';

export function createPluginContext<
  V extends Value,
  E extends AnyBasePluginDefinition,
  P extends (
    | AnyBasePlugin
    | AnyResolvedPlatePlugin
    | AnyPlatePlugin
    | AnyPluginBase
  ) &
    PluginReference,
>(
  editor: InternalPlateEditorWithInstalledPlugins<V, E>,
  plugin: P
): PlatePluginContext<InternalPluginDefinitionOf<P>>;
export function createPluginContext<
  V extends Value,
  E extends AnyBasePluginDefinition,
>(
  editor: InternalPlateEditorWithInstalledPlugins<V, E>,
  plugin:
    | AnyBasePlugin
    | AnyResolvedPlatePlugin
    | AnyPlatePlugin
    | AnyPluginBase
    | PluginReference
    | string
): AnyPlatePluginContext;
export function createPluginContext(
  editor: object,
  plugin:
    | AnyBasePlugin
    | AnyResolvedPlatePlugin
    | AnyPlatePlugin
    | AnyPluginBase
    | PluginReference
    | string
): unknown {
  return Reflect.apply(createBaseContext, undefined, [editor, plugin]);
}

export function createPluginPortal<
  V extends Value,
  E extends AnyBasePluginDefinition,
  P extends (
    | AnyBasePlugin
    | AnyResolvedPlatePlugin
    | AnyPlatePlugin
    | AnyPluginBase
  ) &
    PluginReference,
>(
  editor: InternalPlateEditorWithInstalledPlugins<V, E>,
  plugin: P
): PlatePluginPortal<InternalPluginDefinitionOf<P>>;
export function createPluginPortal<
  V extends Value,
  E extends AnyBasePluginDefinition,
>(
  editor: InternalPlateEditorWithInstalledPlugins<V, E>,
  plugin:
    | AnyBasePlugin
    | AnyResolvedPlatePlugin
    | AnyPlatePlugin
    | AnyPluginBase
    | PluginReference
    | string
): AnyPlatePluginPortal;
export function createPluginPortal(
  editor: object,
  plugin:
    | AnyBasePlugin
    | AnyResolvedPlatePlugin
    | AnyPlatePlugin
    | AnyPluginBase
    | PluginReference
    | string
): unknown {
  return Reflect.apply(createBasePortal, undefined, [editor, plugin]);
}
