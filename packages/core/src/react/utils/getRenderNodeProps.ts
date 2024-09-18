import type { AnyObject } from '@udecode/utils';

import { clsx } from 'clsx';
import { pick } from 'lodash';

import type { PlateEditor } from '../editor';
import type { AnyEditorPlatePlugin } from '../plugin/PlatePlugin';
import type { PlateRenderNodeProps } from '../plugin/PlateRenderNodeProps';

import { getSlateClass } from '../../lib';
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
  plugin: AnyEditorPlatePlugin;
  props: PlateRenderNodeProps;
  attributes?: AnyObject;
}): PlateRenderNodeProps => {
  let newProps: AnyObject = {};

  if (plugin.node.props) {
    newProps =
      (typeof plugin.node.props === 'function'
        ? plugin.node.props(props as any)
        : plugin.node.props) ?? {};
  }
  if (!newProps.nodeProps && attributes) {
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

  return {
    ...props,
    className: clsx(getSlateClass(plugin.node.type), className),
    ...(getEditorPlugin(editor, plugin) as any),
  };
};
