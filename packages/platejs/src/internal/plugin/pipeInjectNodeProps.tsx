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
import type { PlateRuntime } from './plateRuntime';
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
  readOnly = false,
  rendering?: Pick<PlateRuntime, 'plugins' | 'pluginCache'>
) => {
  let attributes: TNodeProps['attributes'] & GetInjectNodePropsReturnType =
    nodeProps.attributes;

  (rendering ?? getPlateRuntime(editor)).pluginCache.inject.nodeProps.forEach(
    (name) => {
      const plugin = (rendering?.plugins[name] ??
        getCompiledPlatePlugin(editor, name)) as unknown as AnyPluginBase;

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
    }
  );

  return { ...nodeProps, attributes };
};
