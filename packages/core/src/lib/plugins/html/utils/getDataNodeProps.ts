import { isLeaf } from '@platejs/plite-dom/internal';

import type { BaseEditor } from '../../../editor';

import { type AnyBasePlugin, getBasePlugin } from '../../../plugin';
import { isPluginNodeClass } from '../../../utils/pluginNodeClass';

const getDefaultNodeProps = ({
  element,
  type,
}: {
  element: HTMLElement;
  type: string;
}) => {
  if (!isPluginNodeClass(element, type) && !isLeaf(element)) return;

  const dataAttributes: Record<string, any> = {};

  Object.entries(element.dataset).forEach(([key, value]) => {
    if (
      key.startsWith('plite') &&
      value &&
      !['pliteInline', 'pliteLeaf', 'pliteNode', 'pliteVoid'].includes(key)
    ) {
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
  editor: BaseEditor;
  element: HTMLElement;
  plugin: AnyBasePlugin;
}) => {
  const toNodeProps = plugin.parsers.html?.deserializer?.toNodeProps;

  const disableDefaultNodeProps =
    plugin.parsers.html?.deserializer?.disableDefaultNodeProps ?? false;

  const defaultNodeProps = disableDefaultNodeProps
    ? {}
    : getDefaultNodeProps({
        ...(getBasePlugin as any)(editor, plugin),
        element,
      });

  if (!toNodeProps) return defaultNodeProps;

  const customNodeProps =
    toNodeProps({
      ...(getBasePlugin as any)(editor, plugin),
      element,
    }) ?? {};

  return {
    ...defaultNodeProps,
    ...customNodeProps,
  };
};
