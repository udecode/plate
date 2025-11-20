import type { TElement, TText } from '@platejs/slate';
import type { AnyObject } from '@udecode/utils';

import clsx from 'clsx';

import type { SlateRenderNodeProps } from '../types';

import { pipeInjectNodeProps } from '../../internal/plugin/pipeInjectNodeProps';
import {
  type AnyEditorPlugin,
  type SlateEditor,
  getEditorPlugin,
  getPluginNodeProps,
  getSlateClass,
} from '../../lib';

export const getRenderNodeStaticProps = ({
  attributes: nodeAttributes,
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
  let newProps = {
    ...props,
    ...(plugin
      ? (getEditorPlugin(editor, plugin) as any)
      : {
          api: editor.api,
          editor,
          tf: editor.transforms,
        }),
  };

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
      className: clsx(getSlateClass(plugin?.node.type), className) || undefined,
    },
  };

  newProps = pipeInjectNodeProps(
    editor,
    newProps,
    (node) => editor.api.findPath(node)!
  );

  if (newProps.style && Object.keys(newProps.style).length === 0) {
    newProps.style = undefined;
  }

  return newProps;
};
