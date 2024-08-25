import type { SlateEditor } from '../editor';

import { pluginInjectNodeProps } from './pluginInjectNodeProps';

/** Inject plugin props, editor. */
export const pipeInjectNodeProps = (editor: SlateEditor, nodeProps: any) => {
  editor.pluginList.forEach((plugin) => {
    if (plugin.inject.nodeProps) {
      const props = pluginInjectNodeProps(editor, plugin, nodeProps);

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
