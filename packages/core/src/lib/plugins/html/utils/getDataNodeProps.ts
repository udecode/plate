import type { SlateEditor } from '../../../editor';

import { type AnyEditorPlugin, getEditorPlugin } from '../../../plugin';
import { isSlateLeaf, isSlatePluginNode } from '../../../static';

const getDefaultNodeProps = ({
  element,
  type,
}: {
  element: HTMLElement;
  type: string;
}) => {
  if (!isSlatePluginNode(element, type) && !isSlateLeaf(element)) return;

  const dataAttributes: Record<string, any> = {};

  // Get all data-slate-* attributes from dataset
  Object.entries(element.dataset).forEach(([key, value]) => {
    if (
      key.startsWith('slate') &&
      value &&
      // Ignore slate default attributes
      !['slateInline', 'slateLeaf', 'slateNode', 'slateVoid'].includes(key)
    ) {
      // Remove 'slate' prefix and convert to camelCase
      const attributeKey = key.slice(5).charAt(0).toLowerCase() + key.slice(6);

      // Parse value if it's a boolean or number string

      if (value === undefined) return;

      let parsedValue: any = value;

      if (value === 'true') parsedValue = true;
      else if (value === 'false') parsedValue = false;
      else if (!Number.isNaN(Number(value))) parsedValue = Number(value);

      dataAttributes[attributeKey] = parsedValue;
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

  const disableDefaultNodeProps =
    plugin.parsers.html?.deserializer?.disableDefaultNodeProps ?? false;

  const defaultNodeProps = disableDefaultNodeProps
    ? {}
    : getDefaultNodeProps({
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
