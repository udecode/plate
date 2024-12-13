import type { TElement, TText } from '@udecode/slate';
import type { Path } from 'slate';

import clsx from 'clsx';

import type { SlateEditor } from '../editor';

import { pluginInjectNodeProps } from './pluginInjectNodeProps';

/** Inject plugin props, editor. */
export const pipeInjectNodeProps = (
  editor: SlateEditor,
  nodeProps: any,
  getElementPath: (node: TElement | TText) => Path
) => {
  editor.pluginList.forEach((plugin) => {
    if (plugin.inject.nodeProps) {
      const newProps = pluginInjectNodeProps(
        editor,
        plugin,
        nodeProps,
        getElementPath
      );

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
