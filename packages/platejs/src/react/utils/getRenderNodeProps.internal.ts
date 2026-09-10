import { clsx } from 'clsx';
import type React from 'react';

import { getPlateRuntime } from '../../internal/plugin/compilePlateModel';
import { getPluginRenderAttributes } from '../../internal/plugin/getPluginRenderAttributes';
import { pipeInjectNodeProps } from '../../internal/plugin/pipeInjectNodeProps';
import {
  type AnyBasePlugin,
  type GetInjectNodePropsOptions,
  getPluginNodeClass,
} from '../../lib';
import type { AnyObject } from '../../lib/types/AnyObject';
import type { Editor } from '../editor';
import { createPluginContext } from '../plugin/createPluginContext.internal';
import type { AnyResolvedPlatePlugin } from '../plugin/PlatePlugin';

/**
 * Merge explicitly projected plugin props and extend the class name with the
 * node type.
 */
type RenderNodePropsInput = GetInjectNodePropsOptions & {
  attributes: AnyObject;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

const deleteUndefinedAttributes = (attributes: AnyObject) => {
  Object.keys(attributes).forEach((key) => {
    if (attributes[key] === undefined) {
      delete attributes[key];
    }
  });
};

export const getRenderNodeProps = <TProps extends RenderNodePropsInput>({
  disableInjectNodeProps,
  editor,
  plugin,
  pluginContext,
  props,
  readOnly,
}: {
  editor: Editor;
  props: TProps;
  disableInjectNodeProps?: boolean;
  plugin?: AnyBasePlugin | AnyResolvedPlatePlugin;
  pluginContext?: AnyObject;
  readOnly?: boolean;
}) => {
  const injectionNames = props.element
    ? getPlateRuntime(editor).pluginCache.inject.nodeProps.element
    : props.text
      ? getPlateRuntime(editor).pluginCache.inject.nodeProps.text
      : [];
  const hasInjectNodeProps =
    !disableInjectNodeProps && injectionNames.length > 0;
  const canSkipPluginAttributes =
    !hasInjectNodeProps && !plugin?.render.attributes;
  const resolvedPluginContext = pluginContext
    ? pluginContext
    : plugin
      ? {
          ...createPluginContext(editor, plugin),
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

  if (canSkipPluginAttributes) {
    newProps = {
      ...newProps,
      attributes: {
        ...props.attributes,
        className:
          clsx(
            getPluginNodeClass(plugin?.name),
            props.attributes?.className,
            className
          ) || undefined,
      },
    };

    if (Object.keys(newProps.attributes?.style ?? {}).length === 0) {
      delete newProps.attributes.style;
    }

    deleteUndefinedAttributes(newProps.attributes);

    return newProps;
  }

  const pluginProps = getPluginRenderAttributes({
    plugin,
    props: newProps,
  });

  newProps = {
    ...pluginProps,
    attributes: {
      ...pluginProps.attributes,
      className:
        clsx(
          getPluginNodeClass(plugin?.name),
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

  if (Object.keys(newProps.attributes?.style ?? {}).length === 0) {
    delete newProps.attributes.style;
  }

  deleteUndefinedAttributes(newProps.attributes);

  return newProps;
};
