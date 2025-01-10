import { type EditorPropOptions, NodeApi } from '../../interfaces';

export function prop({
  key,
  defaultValue,
  getProp,
  mode = 'block',
  nodes,
}: EditorPropOptions): string | undefined {
  if (nodes.length === 0) return defaultValue;

  const getNodeValue =
    getProp ??
    ((node) => {
      return node[key!]!;
    });

  let value: string | undefined;

  for (const node of nodes) {
    if (mode === 'block' || mode === 'all') {
      const nodeValue = getNodeValue(node);

      if (nodeValue !== undefined) {
        if (value === undefined) {
          value = nodeValue;
        } else if (value !== nodeValue) {
          return;
        }
        if (mode === 'block') continue;
      } else if (mode === 'block') {
        return defaultValue;
      }
    }
    if (mode === 'text' || mode === 'all') {
      const textEntries = Array.from(NodeApi.texts(node));

      for (const [text] of textEntries) {
        const textValue = getNodeValue(text);

        if (textValue !== undefined) {
          if (value === undefined) {
            value = textValue;
          } else if (value !== textValue) {
            return;
          }
        } else if (mode === 'text') {
          return defaultValue;
        }
      }
    }
  }

  return value;
}
