import type { Path, TElement, TText } from '@udecode/slate';

import clsx from 'clsx';

import type { SlateEditor } from '../../lib/editor';

import { pluginInjectNodeProps } from './pluginInjectNodeProps';

/** Inject plugin props, editor. */
export const pipeInjectNodeProps = (
  editor: SlateEditor,
  nodeProps: any,
  getElementPath: (node: TElement | TText) => Path
) => {
  editor.pluginList.forEach((plugin) => {
    if (plugin.inject.nodeProps) {
      const newAttributes = pluginInjectNodeProps(
        editor,
        plugin,
        nodeProps,
        getElementPath
      );

      if (!newAttributes) return;

      const attributes = nodeProps.attributes;

      nodeProps.attributes = {
        ...attributes,
        ...newAttributes,
        className:
          clsx(attributes?.className, newAttributes.className) || undefined,
        style: {
          ...attributes?.style,
          ...newAttributes.style,
        },
      };
    }
  });

  return nodeProps;
};
