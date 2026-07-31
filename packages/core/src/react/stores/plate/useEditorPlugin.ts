import React from 'react';

import type {
  AnyBasePlugin,
  AnyResolvedBasePlugin,
  PluginReference,
} from '../../../lib';
import type { InternalPluginDefinitionOf } from '../../../lib/plugin/pluginDefinitionLookup.internal';

import type {
  AnyEditorPlatePlugin,
  AnyPlatePlugin,
  AnyPlatePluginContext,
  PlatePluginContext,
} from '../../plugin';
import { createPluginContext } from '../../plugin/createPluginContext.internal';
import { useEditor } from './createPlateStore';

/** Get editor and plugin context. */
export function useEditorPlugin<
  P extends (
    | AnyBasePlugin
    | AnyEditorPlatePlugin
    | AnyPlatePlugin
    | AnyResolvedBasePlugin
  ) &
    PluginReference,
>(p: P, id?: string): PlatePluginContext<InternalPluginDefinitionOf<P>>;
export function useEditorPlugin(
  pluginName: string,
  id?: string
): AnyPlatePluginContext;
export function useEditorPlugin(
  plugin:
    | AnyBasePlugin
    | AnyEditorPlatePlugin
    | AnyPlatePlugin
    | AnyResolvedBasePlugin
    | string,
  id?: string
): unknown {
  const editor = useEditor({ id });

  return React.useMemo(
    () => createPluginContext(editor, plugin),
    [editor, plugin]
  );
}
