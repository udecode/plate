import type { AnyObject } from '@udecode/utils';

import { clsx } from 'clsx';

import type { PlateEditor } from '../editor';
import type { AnyEditorPlatePlugin } from '../plugin/PlatePlugin';
import type { PlateRenderNodeProps } from '../plugin/PlateRenderNodeProps';

import { getSlateClass } from '../../lib';
import { getEditorPlugin } from '../plugin';

/**
 * Override node props with plugin props. `props.element.attributes` are passed
 * as `nodeProps`. Extend the class name with the node type.
 */
export const getRenderNodeProps = ({
  attributes,
  editor,
  nodeProps,
  plugin,
}: {
  attributes?: AnyObject;
  editor: PlateEditor;
  nodeProps: PlateRenderNodeProps;
  plugin: AnyEditorPlatePlugin;
}): PlateRenderNodeProps => {
  let newProps: AnyObject = {};

  if (plugin.props) {
    newProps =
      (typeof plugin.props === 'function'
        ? plugin.props(nodeProps as any)
        : plugin.props) ?? {};
  }
  if (!newProps.nodeProps && attributes) {
    newProps.nodeProps = attributes;
  }

  nodeProps = { ...nodeProps, ...newProps };

  if (nodeProps.nodeProps) {
    // remove attributes values that are undefined
    Object.keys(nodeProps.nodeProps).forEach((key) => {
      if (nodeProps.nodeProps?.[key] === undefined) {
        delete nodeProps.nodeProps?.[key];
      }
    });
  }

  const { className } = nodeProps;

  return {
    ...nodeProps,
    className: clsx(getSlateClass(plugin.type), className),
    ...(getEditorPlugin(editor, plugin) as any),
  };
};
