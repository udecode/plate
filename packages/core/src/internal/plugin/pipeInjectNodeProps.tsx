import type { Element, Path, Text } from '@platejs/plite';
import { clsx } from 'clsx';

import type { BaseEditor } from '../../lib/editor';
import type {
  AnyPluginBase,
  GetInjectNodePropsOptions,
  GetInjectNodePropsReturnType,
} from '../../lib/plugin';
import { getCompiledPlatePlugin, getPlateRuntime } from './compilePlateModel';
import { isEditOnly } from './isEditOnlyDisabled';
import { pluginInjectNodeProps } from './pluginInjectNodeProps';

/** Inject plugin props, editor. */
export const pipeInjectNodeProps = <
  TNodeProps extends GetInjectNodePropsOptions & {
    attributes: GetInjectNodePropsReturnType;
  },
>(
  editor: BaseEditor,
  nodeProps: TNodeProps,
  getElementPath: (node: Element | Text) => Path | undefined,
  readOnly = false
) => {
  let attributes: TNodeProps['attributes'] & GetInjectNodePropsReturnType =
    nodeProps.attributes;

  getPlateRuntime(editor).pluginCache.inject.nodeProps.forEach((name) => {
    const plugin = getCompiledPlatePlugin(
      editor,
      name
    ) as unknown as AnyPluginBase;

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

    attributes = {
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

  return { ...nodeProps, attributes };
};
