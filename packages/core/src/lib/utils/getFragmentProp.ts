import { type Node, NodeApi } from '@platejs/plite';

export type FragmentPropMode = 'all' | 'block' | 'text';

export type GetFragmentPropOptions<TValue = unknown> = {
  defaultValue?: TValue;
  getProp?: (node: Node) => TValue | undefined;
  key?: string;
  mode?: FragmentPropMode;
};

export const getFragmentProp = <TValue = unknown>(
  nodes: readonly Node[],
  {
    defaultValue,
    getProp,
    key,
    mode = 'block',
  }: GetFragmentPropOptions<TValue> = {}
): TValue | undefined => {
  if (nodes.length === 0) return defaultValue;

  const getNodeValue =
    getProp ??
    ((node: Node) =>
      key
        ? ((node as Record<string, unknown>)[key] as TValue | undefined)
        : undefined);

  let value: TValue | undefined;

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
      for (const [text] of NodeApi.texts(node)) {
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
};
