import type { Element, Path, Text } from '@platejs/plite';

import clsx from 'clsx';

import type { BasePlateEditor } from '../../lib/editor';

import { isEditOnly } from './isEditOnlyDisabled';
import { pluginInjectNodeProps } from './pluginInjectNodeProps';

/** Inject plugin props, editor. */
export const pipeInjectNodeProps = (
  editor: BasePlateEditor,
  nodeProps: any,
  getElementPath: (node: Element | Text) => Path,
  readOnly = false
) => {
  editor.meta.pluginCache.inject.nodeProps.forEach((key) => {
    const plugin = editor.getPlugin({ key });

    const newAttributes = pluginInjectNodeProps(
      editor,
      plugin,
      nodeProps,
      getElementPath
    );

    // Since `inject.nodeProps` can have hooks, we can't return early.
    if (isEditOnly(readOnly, plugin, 'inject')) {
      return;
    }

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
  });

  return nodeProps;
};
