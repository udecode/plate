import type { SlateEditor } from '../../../editor';

import { type AnyEditorPlugin, getEditorPlugin } from '../../../plugin';
import { isSlatePluginElement } from '../../../static';

const getDefaultNodeProps = ({
  element,
  type,
}: {
  element: HTMLElement;
  type: string;
}) => {
  if (!isSlatePluginElement(element, type)) return;

  const dataAttributes: Record<string, any> = {};

  // Get all data-slate-* attributes from dataset
  Object.entries(element.dataset).forEach(([key, value]) => {
    if (
      key.startsWith('slate') &&
      value &&
      // Ignore slate default attributes
      !['slateInline', 'slateNode', 'slateVoid'].includes(key)
    ) {
      // Remove 'slate' prefix and convert to camelCase
      const attributeKey = key.slice(5).charAt(0).toLowerCase() + key.slice(6);

      // Parse value if it's a boolean or number string

      //eslint-disable-next-line
      if (value === undefined) return;

      dataAttributes[attributeKey] = value;
    }
  });

  if (Object.keys(dataAttributes).length > 0) {
    return dataAttributes;
  }
};

export const getDataNodeProps = ({
  editor,
  element,
  plugin,
}: {
  editor: SlateEditor;
  element: HTMLElement;
  plugin: AnyEditorPlugin;
}) => {
  const toNodeProps = plugin.parsers.html?.deserializer?.toNodeProps;
  const isElement = plugin.node.isElement;

  if (!isElement) return {};

  const defaultNodeProps = getDefaultNodeProps({
    ...(getEditorPlugin(editor, plugin) as any),
    element,
  });

  if (!toNodeProps) return defaultNodeProps;

  const customNodeProps =
    toNodeProps({
      ...(getEditorPlugin(editor, plugin) as any),
      element,
    }) ?? {};

  return {
    ...defaultNodeProps,
    ...customNodeProps,
  };
};
