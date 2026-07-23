import type { AnyObject } from '@udecode/utils';
import type React from 'react';

import { clsx } from 'clsx';

import type { PlateEditor } from '../editor';
import type { AnyEditorPlatePlugin } from '../plugin/PlatePlugin';

import { pipeInjectNodeProps } from '../../internal/plugin/pipeInjectNodeProps';
import { getPlateRuntime } from '../../internal/plugin/compilePlateModel';
import {
  type AnyBasePlugin,
  type GetInjectNodePropsOptions,
  getPluginNodeClass,
} from '../../lib';
import { getPluginNodeProps } from '../../lib/utils/getPluginNodeProps';
import { getEditorPlugin } from '../plugin';

/**
 * Override node props with plugin props. Allowed properties in
 * `props.element.attributes` are passed into `props.attributes`. Extend the
 * class name with the node type.
 */
type RenderNodePropsInput = GetInjectNodePropsOptions & {
  attributes: AnyObject;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export const getRenderNodeProps = <TProps extends RenderNodePropsInput>({
  attributes: nodeAttributes,
  disableInjectNodeProps,
  editor,
  plugin,
  pluginContext,
  props,
  readOnly,
}: {
  editor: PlateEditor;
  props: TProps;
  attributes?: AnyObject;
  disableInjectNodeProps?: boolean;
  plugin?: AnyBasePlugin | AnyEditorPlatePlugin;
  pluginContext?: AnyObject;
  readOnly?: boolean;
}) => {
  const hasInjectNodeProps =
    !disableInjectNodeProps &&
    getPlateRuntime(editor).pluginCache.inject.nodeProps.length > 0;
  const canSkipPluginNodeProps =
    !hasInjectNodeProps &&
    !plugin?.render.nodeProps &&
    !plugin?.host.dangerouslyAllowAttributes?.length;
  const resolvedPluginContext = pluginContext
    ? pluginContext
    : plugin
      ? {
          ...getEditorPlugin(editor, plugin),
          api: editor.api,
        }
      : {
          api: editor.api,
          editor,
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
        ...props.attributes,
        className:
          clsx(
            getPluginNodeClass(plugin?.type),
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
    plugin,
    props: newProps,
  });

  newProps = {
    ...pluginProps,
    attributes: {
      ...pluginProps.attributes,
      className:
        clsx(
          getPluginNodeClass(plugin?.type),
          pluginProps.attributes?.className,
          className
        ) || undefined,
    },
  };

  if (hasInjectNodeProps) {
    newProps = pipeInjectNodeProps(
      editor,
      newProps,
      (node) => editor.read.nodes.path(node),
      readOnly
    );
  }

  if (
    newProps.attributes?.style &&
    Object.keys(newProps.attributes.style).length === 0
  ) {
    newProps.attributes.style = undefined;
  }

  return newProps;
};
