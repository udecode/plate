import type { Value } from '@platejs/plite';
import type { ReactEditor } from '@platejs/plite-react';

import type {
  AnyBasePlugin,
  AnyBasePluginDefinition,
  AnyResolvedBasePlugin,
  BaseEditor,
  InferName,
  InternalBaseEditorWithInstalledPlugins,
  PluginReference,
} from '../../lib';
import type { InternalPluginDefinitionOf } from '../../lib/plugin/pluginDefinitionLookup.internal';
import type {
  AnyEditorPlatePlugin,
  AnyPlatePlugin,
  AnyPlatePluginPortal,
  PlatePluginPortal,
} from '../plugin/PlatePlugin';

type PlatePluginPortalLookup<
  V extends Value,
  P extends AnyBasePluginDefinition,
> = {
  <
    TPlugin extends (
      | AnyBasePlugin
      | AnyEditorPlatePlugin
      | AnyPlatePlugin
      | AnyResolvedBasePlugin
    ) &
      PluginReference,
  >(
    plugin: TPlugin
  ): PlatePluginPortal<InternalPluginDefinitionOf<TPlugin>>;
  (pluginName: string): AnyPlatePluginPortal;
} & BaseEditor<V, P>['plugin'];

type PlateEditorBase<
  V extends Value,
  P extends AnyBasePluginDefinition,
> = BaseEditor<V, P>;

export type PlateEditor<
  V extends Value = any,
  P extends AnyBasePluginDefinition = AnyBasePluginDefinition,
> = Omit<
  PlateEditorBase<V, P>,
  'api' | 'extension' | 'plugin' | 'read' | 'update'
> & {
  readonly api: PlateEditorBase<V, P>['api'] & ReactEditor<V>['api'];
  extension: PlateEditorBase<V, P>['extension'] & ReactEditor<V>['extension'];
  plugin: PlatePluginPortalLookup<V, P>;
  read: PlateEditorBase<V, P>['read'] & ReactEditor<V>['read'];
  update: PlateEditorBase<V, P>['update'] & ReactEditor<V>['update'];
};

type InternalPlateEditorBase<
  V extends Value,
  D,
> = InternalBaseEditorWithInstalledPlugins<V, D>;

type InternalPlatePluginPortal<V extends Value, D> = {
  <
    TPlugin extends (
      | AnyBasePlugin
      | AnyEditorPlatePlugin
      | AnyPlatePlugin
      | AnyResolvedBasePlugin
    ) &
      PluginReference,
  >(
    plugin: TPlugin
  ): PlatePluginPortal<InternalPluginDefinitionOf<TPlugin>>;
  (pluginName: string): AnyPlatePluginPortal;
} & InternalBaseEditorWithInstalledPlugins<V, D>['plugin'];

/** @internal React editor whose plugin definition union is already lowered. */
export type InternalPlateEditorWithInstalledPlugins<V extends Value, D> = Omit<
  InternalPlateEditorBase<V, D>,
  'api' | 'extension' | 'plugin' | 'read' | 'update'
> & {
  readonly api: InternalPlateEditorBase<V, D>['api'] & ReactEditor<V>['api'];
  extension: InternalPlateEditorBase<V, D>['extension'] &
    ReactEditor<V>['extension'];
  plugin: InternalPlatePluginPortal<V, D>;
  read: InternalPlateEditorBase<V, D>['read'] & ReactEditor<V>['read'];
  update: InternalPlateEditorBase<V, D>['update'] & ReactEditor<V>['update'];
};

export type NameofPlugins<T extends AnyBasePluginDefinition> =
  | (string & {})
  | InferName<T>;
