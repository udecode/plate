import clsx from 'clsx';

import type { SlateEditor } from '../editor';

import { pluginInjectNodeProps } from './pluginInjectNodeProps';

/** Inject plugin props, editor. */
export const pipeInjectNodeProps = (editor: SlateEditor, nodeProps: any) => {
  editor.pluginList.forEach((plugin) => {
    if (plugin.inject.nodeProps) {
      const newProps = pluginInjectNodeProps(editor, plugin, nodeProps);

      if (!newProps) return;

      nodeProps = {
        ...nodeProps,
        ...newProps,
        className: clsx(nodeProps.className, newProps.className),
        style: {
          ...nodeProps.style,
          ...newProps.style,
        },
      };
    }
  });

  return nodeProps;
};
