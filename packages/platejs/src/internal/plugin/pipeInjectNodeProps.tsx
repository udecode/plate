import { clsx } from 'clsx';

import type { Element, Path, Text } from '../../facade';
import type { Editor } from '../../lib/editor';
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
  editor: Editor,
  nodeProps: TNodeProps,
  getElementPath: (node: Element | Text) => Path | undefined,
  readOnly = false
) => {
  let attributes: TNodeProps['attributes'] & GetInjectNodePropsReturnType =
    nodeProps.attributes;

  const injectionNames = nodeProps.element
    ? getPlateRuntime(editor).pluginCache.inject.nodeProps.element
    : nodeProps.text
      ? getPlateRuntime(editor).pluginCache.inject.nodeProps.text
      : [];

  injectionNames.forEach((name) => {
    const plugin = getCompiledPlatePlugin(
      editor,
      name
    ) as unknown as AnyPluginBase;

    if (isEditOnly(readOnly, plugin, 'inject')) return;

    const newAttributes = pluginInjectNodeProps(
      editor,
      plugin,
      nodeProps,
      getElementPath
    );

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
