import type { AnyObject } from '@udecode/utils';

import { clsx } from 'clsx';

import type { PlateHTMLProps } from '../components';
import type { PlateEditor } from '../editor';
import type { AnyEditorPlatePlugin } from '../plugin/PlatePlugin';

import { pipeInjectNodeProps } from '../../internal/plugin/pipeInjectNodeProps';
import { getSlateClass } from '../../lib';
import { getPluginNodeProps } from '../../lib/utils/getPluginNodeProps';
import { getEditorPlugin } from '../plugin';

/**
 * Override node props with plugin props. Allowed properties in
 * `props.element.attributes` are passed into `props.attributes`. Extend the
 * class name with the node type.
 */
export const getRenderNodeProps = ({
  attributes: nodeAttributes,
  disableInjectNodeProps,
  editor,
  plugin,
  pluginContext,
  props,
  readOnly,
}: {
  editor: PlateEditor;
  props: PlateHTMLProps;
  attributes?: AnyObject;
  disableInjectNodeProps?: boolean;
  plugin?: AnyEditorPlatePlugin;
  pluginContext?: AnyObject;
  readOnly?: boolean;
}): PlateHTMLProps => {
  const hasInjectNodeProps =
    !disableInjectNodeProps &&
    editor.meta.pluginCache.inject.nodeProps.length > 0;
  const canSkipPluginNodeProps =
    !hasInjectNodeProps &&
    !plugin?.node.props &&
    !plugin?.node.dangerouslyAllowAttributes?.length;
  const resolvedPluginContext = pluginContext
    ? pluginContext
    : plugin
      ? (getEditorPlugin(editor, plugin) as any)
      : {
          api: editor.api,
          editor,
          tf: editor.transforms,
        };
  const { className } = props;

  let newProps = {
    ...props,
    ...resolvedPluginContext,
  };

  if (canSkipPluginNodeProps) {
    newProps = {
      ...newProps,
      attributes: {
        ...(props.attributes as any),
        className:
          clsx(
            getSlateClass(plugin?.node.type),
            props.attributes?.className,
            className
          ) || undefined,
      },
    };

    if (
      newProps.attributes?.style &&
      Object.keys(newProps.attributes.style).length === 0
    ) {
      newProps.attributes.style = undefined;
    }

    return newProps;
  }

  const pluginProps = getPluginNodeProps({
    attributes: nodeAttributes,
    plugin: plugin as any,
    props: newProps as any,
  });

  newProps = {
    ...pluginProps,
    attributes: {
      ...pluginProps.attributes,
      className:
        clsx(
          getSlateClass(plugin?.node.type),
          pluginProps.attributes?.className,
          className
        ) || undefined,
    },
  };

  if (hasInjectNodeProps) {
    newProps = pipeInjectNodeProps(
      editor,
      newProps,
      (node) => editor.api.findPath(node)!,
      readOnly
    ) as PlateHTMLProps;
  }

  if (
    newProps.attributes?.style &&
    Object.keys(newProps.attributes.style).length === 0
  ) {
    newProps.attributes.style = undefined;
  }

  return newProps;
};
