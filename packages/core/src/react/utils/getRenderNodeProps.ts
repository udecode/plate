import type { AnyObject } from '@udecode/utils';

import { clsx } from 'clsx';

import type { PlateEditor } from '../editor';
import type { AnyEditorPlatePlugin } from '../plugin/PlatePlugin';
import type { PlateRenderNodeProps } from '../plugin/PlateRenderNodeProps';

import { pipeInjectNodeProps } from '../../internal/plugin/pipeInjectNodeProps';
import { getSlateClass } from '../../lib';
import { getPluginNodeProps } from '../../lib/utils/getPluginNodeProps';
import { getEditorPlugin } from '../plugin';

/**
 * Override node props with plugin props. Allowed properties in
 * `props.element.attributes` are passed as `nodeProps`. Extend the class name
 * with the node type.
 */
export const getRenderNodeProps = ({
  attributes,
  editor,
  plugin,
  props,
}: {
  editor: PlateEditor;
  props: PlateRenderNodeProps;
  attributes?: AnyObject;
  plugin?: AnyEditorPlatePlugin;
}): PlateRenderNodeProps => {
  let nodeProps = {
    ...props,
    ...(plugin ? (getEditorPlugin(editor, plugin) as any) : {}),
  };

  const { className } = props;

  nodeProps = {
    ...getPluginNodeProps({
      attributes,
      plugin: plugin as any,
      props: nodeProps as any,
    }),
    className: clsx(getSlateClass(plugin?.node.type), className),
  };

  nodeProps = pipeInjectNodeProps(
    editor,
    nodeProps,
    (node) => editor.api.findPath(node)!
  ) as PlateRenderNodeProps;

  if (nodeProps.style && Object.keys(nodeProps.style).length === 0) {
    delete nodeProps.style;
  }

  return nodeProps;
};
