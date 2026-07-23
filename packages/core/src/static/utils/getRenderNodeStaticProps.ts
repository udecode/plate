import type { Element, Path, Text } from '@platejs/plite';
import type { AnyObject } from '@udecode/utils';
import type React from 'react';

import clsx from 'clsx';

import type { PliteRenderNodeProps } from '../types';

import { pipeInjectNodeProps } from '../../internal/plugin/pipeInjectNodeProps';
import {
  type AnyBasePlugin,
  type BaseEditor,
  type GetInjectNodePropsOptions,
  getEditorPlugin,
  getPluginNodeProps,
  getPluginNodeClass,
} from '../../lib';

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
  attributes: nodeAttributes,
  editor,
  node,
  path,
  plugin,
  props,
}: {
  editor: BaseEditor;
  props: TProps;
  attributes?: AnyObject;
  node?: Element | Text;
  /** Pre-computed path to avoid expensive node path lookup */
  path?: Path;
  plugin?: AnyBasePlugin;
}): TProps & { attributes: AnyObject } & (
    | PliteRenderNodeProps
    | { api: BaseEditor['api']; editor: BaseEditor }
  ) => {
  const contextProps = {
    ...props,
    ...(plugin
      ? getEditorPlugin(editor, plugin)
      : {
          api: editor.api,
          editor,
        }),
  };

  const { className } = props;

  const pluginProps = getPluginNodeProps({
    attributes: nodeAttributes,
    node,
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
