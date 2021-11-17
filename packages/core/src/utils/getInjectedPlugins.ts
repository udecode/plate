import { PlateEditor } from '../types/PlateEditor';
import { WithPlatePlugin } from '../types/plugins/PlatePlugin';
import { PlatePluginInjectedPlugin } from '../types/plugins/PlatePluginInjectedPlugin';

export const getInjectedPlugins = <T = {}, P = {}>(
  editor: PlateEditor<T>,
  plugin: WithPlatePlugin<T, P>
) => {
  const injectPlugins: PlatePluginInjectedPlugin[] = [];

  editor.plugins.forEach((p) => {
    const injected = p.injectPlugin?.(editor, plugin as WithPlatePlugin<T>);

    if (injected) {
      injectPlugins.push(injected);
    }
  });

  return injectPlugins;
};
