import type { AnyObject } from '@udecode/utils';
import type { Path } from 'slate';

import { findNode } from '@udecode/slate';
import clsx from 'clsx';

import type { SlateEditor } from '../../editor';
import type { StaticElementProps } from '../type';

import { type SlatePlugin, getEditorPlugin } from '../../plugin';
import { getSlateClass, pipeInjectNodeProps } from '../../utils';
import { getPluginNodeProps } from '../../utils/getPluginNodeProps';

export const getRenderStaticNodeProps = ({
  attributes,
  editor,
  plugin,
  props,
}: {
  editor: SlateEditor;
  props: StaticElementProps;
  attributes?: AnyObject;
  plugin?: SlatePlugin;
}): StaticElementProps => {
  props = getPluginNodeProps(props, plugin, attributes);

  const { className } = props;

  let nodeProps = {
    ...props,
    ...(plugin ? getEditorPlugin(editor, plugin) : {}),
    className: clsx(getSlateClass(plugin?.node.type), className),
  };

  nodeProps = pipeInjectNodeProps(
    editor,
    nodeProps,
    (node) => findNode(editor, { match: (n) => n === node })?.[1] as Path
  );

  if (nodeProps.style && Object.keys(nodeProps.style).length === 0) {
    delete nodeProps.style;
  }

  return nodeProps;
};
