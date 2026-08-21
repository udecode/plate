import React from 'react';

import type {
  AnyBasePlugin,
  AnyPluginBase,
  PluginReference,
} from '../../../lib';
import type { InternalPluginDefinitionOf } from '../../../lib/plugin/pluginDefinitionLookup.internal';
import type {
  AnyResolvedPlatePlugin,
  AnyPlatePlugin,
  AnyPlatePluginPortal,
  PlatePluginPortal,
} from '../../plugin';
import { createPluginPortal } from '../../plugin/createPluginContext.internal';
import { useEditor } from './createPlateStore';

/** Get an installed plugin's consumer portal. */
export function useEditorPlugin<
  P extends (
    | AnyBasePlugin
    | AnyResolvedPlatePlugin
    | AnyPlatePlugin
    | AnyPluginBase
  ) &
    PluginReference,
>(p: P, id?: string): PlatePluginPortal<InternalPluginDefinitionOf<P>>;
export function useEditorPlugin(
  plugin:
    | AnyBasePlugin
    | AnyResolvedPlatePlugin
    | AnyPlatePlugin
    | AnyPluginBase
    | PluginReference
    | string,
  id?: string
): AnyPlatePluginPortal;
export function useEditorPlugin(
  plugin:
    | AnyBasePlugin
    | AnyResolvedPlatePlugin
    | AnyPlatePlugin
    | AnyPluginBase
    | PluginReference
    | string,
  id?: string
): unknown {
  const editor = useEditor({ id });

  return React.useMemo(
    () => createPluginPortal(editor, plugin),
    [editor, plugin]
  );
}
