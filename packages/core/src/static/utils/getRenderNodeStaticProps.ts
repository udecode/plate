import type { Path } from '@platejs/plite';
import type { AnyObject } from '@udecode/utils';
import type React from 'react';

import clsx from 'clsx';

import type { PliteRenderNodeProps } from '../types';

import { pipeInjectNodeProps } from '../../internal/plugin/pipeInjectNodeProps';
import {
  type AnyResolvedBasePlugin,
  type BaseEditor,
  type GetInjectNodePropsOptions,
  getPluginNodeProps,
  getPluginNodeClass,
} from '../../lib';
import { createPluginContext } from '../../lib/plugin/createPluginContext.internal';

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
  editor: BaseEditor;
  props: TProps;
  /** Pre-computed path to avoid expensive node path lookup */
  path?: Path;
  plugin?: AnyResolvedBasePlugin;
}): TProps & { attributes: AnyObject } & (
    | PliteRenderNodeProps
    | { api: BaseEditor['api']; editor: BaseEditor }
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
          getPluginNodeClass(plugin?.type),
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
