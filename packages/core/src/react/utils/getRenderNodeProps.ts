import type { AnyObject } from '@udecode/utils';

import { findNodePath } from '@udecode/slate-react';
import { clsx } from 'clsx';

import type { PlateEditor } from '../editor';
import type { AnyEditorPlatePlugin } from '../plugin/PlatePlugin';
import type { PlateRenderNodeProps } from '../plugin/PlateRenderNodeProps';

import { getSlateClass } from '../../lib';
import { getPluginNodeProps } from '../../lib/utils/getPluginNodeProps';
import { pipeInjectNodeProps } from '../../lib/utils/pipeInjectNodeProps';
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
  props = getPluginNodeProps({
    attributes,
    plugin: plugin as any,
    props: props as any,
  });

  const { className } = props;

  let nodeProps = {
    ...props,
    ...(plugin ? (getEditorPlugin(editor, plugin) as any) : {}),
    className: clsx(getSlateClass(plugin?.node.type), className),
  };

  nodeProps = pipeInjectNodeProps(
    editor,
    nodeProps,
    (node) => findNodePath(editor, node)!
  ) as PlateRenderNodeProps;

  if (nodeProps.style && Object.keys(nodeProps.style).length === 0) {
    delete nodeProps.style;
  }

  return nodeProps;
};
