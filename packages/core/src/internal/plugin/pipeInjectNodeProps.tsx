import type { Element, Path, Text } from '@platejs/plite';

import clsx from 'clsx';

import type { BaseEditor } from '../../lib/editor';
import type {
  AnyResolvedBasePlugin,
  GetInjectNodePropsOptions,
  GetInjectNodePropsReturnType,
} from '../../lib/plugin';

import { isEditOnly } from './isEditOnlyDisabled';
import { pluginInjectNodeProps } from './pluginInjectNodeProps';
import { getCompiledPlatePlugin, getPlateRuntime } from './compilePlateModel';

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

  getPlateRuntime(editor).pluginCache.inject.nodeProps.forEach((pluginName) => {
    const plugin = getCompiledPlatePlugin(
      editor,
      pluginName
    ) as unknown as AnyResolvedBasePlugin;

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
