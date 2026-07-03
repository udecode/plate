import type { Element, Path, Text } from '@platejs/plite';
import type { AnyObject } from '@udecode/utils';
import type React from 'react';

import clsx from 'clsx';

import type { PliteRenderNodeProps } from '../types';

import { pipeInjectNodeProps } from '../../internal/plugin/pipeInjectNodeProps';
import {
  type AnyBasePlugin,
  type BaseEditor,
  getEditorPlugin,
  getPluginNodeProps,
  getPluginNodeClass,
} from '../../lib';

type StaticNodePropsInput = Partial<PliteRenderNodeProps> &
  Record<string, unknown> & {
    attributes?: AnyObject;
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
}): TProps & PliteRenderNodeProps => {
  let newProps = {
    ...props,
    ...(plugin
      ? getEditorPlugin(editor, plugin)
      : {
          api: editor.api,
          editor,
        }),
  } as TProps & PliteRenderNodeProps;

  const { className } = props;

  const pluginProps = getPluginNodeProps({
    attributes: nodeAttributes,
    node,
    plugin,
    props: newProps,
  });

  newProps = {
    ...pluginProps,
    attributes: {
      ...pluginProps.attributes,
      className:
        clsx(getPluginNodeClass(plugin?.node.type), className) || undefined,
    },
  } as TProps & PliteRenderNodeProps;

  newProps = pipeInjectNodeProps(
    editor,
    newProps,
    path ? () => path : (node) => editor.read.nodes.pathOf(node)!
  ) as TProps & PliteRenderNodeProps;

  if (newProps.style && Object.keys(newProps.style).length === 0) {
    newProps.style = undefined;
  }

  return newProps;
};
