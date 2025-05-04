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
  attributes: nodeAttributes,
  editor,
  node,
  plugin,
  props: _props,
}: {
  editor: SlateEditor;
  props: SlateRenderNodeProps;
  attributes?: AnyObject;
  node?: TElement | TText;
  plugin?: AnyEditorPlugin;
}): SlateRenderNodeProps => {
  const { attributes: slateAttributes, ...props } = _props;
  let attributes = {
    ...slateAttributes,
    ...props,
    ...(plugin ? (getEditorPlugin(editor, plugin) as any) : {}),
  };

  const { className } = props;

  attributes = {
    ...getPluginNodeProps({
      attributes: nodeAttributes,
      node,
      plugin,
      props: attributes,
    }),
    className: clsx(getSlateClass(plugin?.node.type), className) || undefined,
  };

  attributes = pipeInjectNodeProps(
    editor,
    attributes,
    (node) => editor.api.findPath(node)!
  );

  if (attributes.style && Object.keys(attributes.style).length === 0) {
    delete attributes.style;
  }

  return attributes;
};
