import { getCompiledPlatePlugin } from '../../../internal/plugin/compilePlateModel';
import { getEditorViewStore } from '../../../internal/plugin/pluginStore';
import type {
  DefinitionOf,
  InferPluginViewState,
  PluginReference,
} from '../../../lib';
import { useZustandSelector } from '../../internal/useZustandSelector';
import { useEditor } from './useEditor';

/**
 * Select from a plugin's view store for the nearest editor's view. A write in
 * another view runs no selector here.
 *
 * @example
 *   const open = useViewStore(DetailsPlugin, (state) => state.openKeys.has(key));
 */
export const useViewStore = <P extends PluginReference, U>(
  plugin: P,
  selector: (state: InferPluginViewState<DefinitionOf<P>>) => U
): U => {
  const editor = useEditor();
  const compiledPlugin = editor.plugin(plugin).installed
    ? getCompiledPlatePlugin(editor, plugin.name)
    : undefined;

  if (!compiledPlugin) {
    throw new Error(`Plate plugin "${plugin.name}" is not installed.`);
  }

  return useZustandSelector(
    getEditorViewStore(editor, compiledPlugin).base.store,
    selector as (state: object) => U
  );
};
