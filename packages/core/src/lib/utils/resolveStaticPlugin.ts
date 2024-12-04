import type { SlateEditor, StaticComponents } from '../editor';
import type { SlatePlugin } from '../plugin';

export const resolveStaticPlugin = (
  editor: SlateEditor,
  staticComponents: StaticComponents
) => {
  editor.staticComponents = staticComponents;

  editor.pluginList.forEach((plugin: SlatePlugin) => {
    const component = staticComponents[plugin.key];

    if (component) {
      plugin.node.staticComponent = component;
    }
  });
};
