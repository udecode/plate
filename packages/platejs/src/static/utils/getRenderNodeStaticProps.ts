import { clsx } from 'clsx';
import type React from 'react';

import type { Path } from '../../facade';
import { pipeInjectNodeProps } from '../../internal/plugin/pipeInjectNodeProps';
import {
  type AnyPluginBase,
  type AnyBasePluginPortal,
  type Editor,
  type GetInjectNodePropsOptions,
  getPluginNodeProps,
  getPluginNodeClass,
} from '../../lib';
import { createPluginContext } from '../../lib/plugin/createPluginContext.internal';
import type { AnyObject } from '../../lib/types/AnyObject';
import type { PliteRenderNodeProps } from '../types';

type StaticNodePropsInput = Partial<PliteRenderNodeProps> &
  GetInjectNodePropsOptions &
  Record<string, unknown> & {
    attributes?: AnyObject;
    children: React.ReactNode;
    className?: string;
    nodeProps?: AnyObject;
    style?: React.CSSProperties;
  };

export const getRenderNodeStaticProps = <TProps extends StaticNodePropsInput>({
  editor,
  path,
  plugin,
  props,
}: {
  editor: Editor;
  props: TProps;
  /** Pre-computed path to avoid expensive node path lookup */
  path?: Path;
  plugin?: AnyBasePluginPortal | AnyPluginBase;
}): TProps & { attributes: AnyObject } & (
    | PliteRenderNodeProps<any>
    | { api: Editor['api']; editor: Editor }
  ) => {
  const contextProps = {
    ...props,
    ...(plugin
      ? createPluginContext(editor, plugin.name)
      : {
          api: editor.api,
          editor,
        }),
  };

  const { className } = props;

  const pluginProps = getPluginNodeProps({
    plugin,
    props: contextProps,
  });

  const mergedProps = {
    ...pluginProps,
    attributes: {
      ...pluginProps.attributes,
      className:
        clsx(
          getPluginNodeClass(plugin?.name),
          pluginProps.attributes.className,
          className
        ) || undefined,
    },
  };

  const newProps = pipeInjectNodeProps(
    editor,
    mergedProps,
    path ? () => path : (node) => editor.read.nodes.path(node)
  );

  if (newProps.style && Object.keys(newProps.style).length === 0) {
    newProps.style = undefined;
  }

  return newProps;
};
