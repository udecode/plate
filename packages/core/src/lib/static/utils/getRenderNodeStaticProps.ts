import type { TElement, TText } from '@udecode/slate';
import type { AnyObject } from '@udecode/utils';

import clsx from 'clsx';

import type { SlateEditor } from '../../editor';
import type { SlateRenderNodeProps } from '../types';

import { pipeInjectNodeProps } from '../../../internal/plugin/pipeInjectNodeProps';
import { type AnyEditorPlugin, getEditorPlugin } from '../../plugin';
import { getSlateClass } from '../../utils';
import { getPluginNodeProps } from '../../utils/getPluginNodeProps';

export const getRenderNodeStaticProps = ({
  attributes,
  editor,
  node,
  plugin,
  props,
}: {
  editor: SlateEditor;
  props: SlateRenderNodeProps;
  attributes?: AnyObject;
  node?: TElement | TText;
  plugin?: AnyEditorPlugin;
}): SlateRenderNodeProps => {
  let nodeProps = {
    ...props,
    ...(plugin ? (getEditorPlugin(editor, plugin) as any) : {}),
  };

  const { className } = props;

  nodeProps = {
    ...getPluginNodeProps({
      attributes,
      node,
      plugin,
      props: nodeProps,
    }),
    className: clsx(getSlateClass(plugin?.node.type), className),
  };

  nodeProps = pipeInjectNodeProps(
    editor,
    nodeProps,
    (node) => editor.api.findPath(node)!
  );

  if (nodeProps.style && Object.keys(nodeProps.style).length === 0) {
    delete nodeProps.style;
  }

  return nodeProps;
};
