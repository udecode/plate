import type { PlateEditor } from '../editor';

import { pluginInjectProps } from './pluginInjectProps';

/** Inject plugin props, editor. */
export const pipeInjectProps = (editor: PlateEditor, nodeProps: any) => {
  editor.pluginList.forEach((plugin) => {
    if (plugin.inject.props) {
      const props = pluginInjectProps(editor, plugin, nodeProps);

      if (props) {
        nodeProps = {
          ...nodeProps,
          ...props,
        };
      }
    }
  });

  return { ...nodeProps, editor };
};
