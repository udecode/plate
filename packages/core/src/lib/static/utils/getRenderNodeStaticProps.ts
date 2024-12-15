import type { AnyObject } from '@udecode/utils';

import { findNodePath } from '@udecode/slate';
import clsx from 'clsx';

import type { SlateEditor } from '../../editor';
import type { PlateRenderNodeStaticProps } from '../types';

import { type AnyEditorPlugin, getEditorPlugin } from '../../plugin';
import { getSlateClass, pipeInjectNodeProps } from '../../utils';
import { getPluginNodeProps } from '../../utils/getPluginNodeProps';

export const getRenderNodeStaticProps = ({
  attributes,
  editor,
  plugin,
  props,
}: {
  editor: SlateEditor;
  props: PlateRenderNodeStaticProps;
  attributes?: AnyObject;
  plugin?: AnyEditorPlugin;
}): PlateRenderNodeStaticProps => {
  props = getPluginNodeProps({
    attributes,
    plugin,
    props,
  });

  const { className } = props;

  let nodeProps = {
    ...props,
    ...(plugin ? (getEditorPlugin(editor, plugin) as any) : {}),
    className: clsx(getSlateClass(plugin?.node.type), className),
  };

  nodeProps = pipeInjectNodeProps(
    editor,
    nodeProps,
    (node) => findNodePath(editor, node)!
  );

  if (nodeProps.style && Object.keys(nodeProps.style).length === 0) {
    delete nodeProps.style;
  }

  return nodeProps;
};
