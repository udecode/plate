import type { AnyObject } from '@udecode/utils';

import { clsx } from 'clsx';
import pick from 'lodash/pick.js';

import type { PlateEditor } from '../editor';
import type { AnyEditorPlatePlugin } from '../plugin/PlatePlugin';
import type { PlateRenderNodeProps } from '../plugin/PlateRenderNodeProps';

import { getSlateClass, pipeInjectNodeProps } from '../../lib';
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
  let newProps: AnyObject = {};

  if (plugin?.node.props) {
    newProps =
      (typeof plugin.node.props === 'function'
        ? plugin.node.props(props as any)
        : plugin.node.props) ?? {};
  }
  if (!newProps.nodeProps && attributes && plugin) {
    /**
     * WARNING: Improper use of `dangerouslyAllowAttributes` WILL make your
     * application vulnerable to cross-site scripting (XSS) or information
     * exposure attacks.
     *
     * @see {@link BasePluginNode.dangerouslyAllowAttributes}
     */
    newProps.nodeProps = pick(
      attributes,
      plugin.node.dangerouslyAllowAttributes ?? []
    );
  }

  props = { ...props, ...newProps };

  if (props.nodeProps) {
    // remove attributes values that are undefined
    Object.keys(props.nodeProps).forEach((key) => {
      if (props.nodeProps?.[key] === undefined) {
        delete props.nodeProps?.[key];
      }
    });
  }

  const { className } = props;

  let nodeProps = {
    ...props,
    ...(plugin ? (getEditorPlugin(editor, plugin) as any) : {}),
    className: clsx(getSlateClass(plugin?.node.type), className),
  };

  nodeProps = pipeInjectNodeProps(editor, nodeProps) as PlateRenderNodeProps;

  if (nodeProps.style && Object.keys(nodeProps.style).length === 0) {
    delete nodeProps.style;
  }

  return nodeProps;
};
