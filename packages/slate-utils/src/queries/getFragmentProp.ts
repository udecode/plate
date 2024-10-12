import { type TElement, type TText, getNodeTexts } from '@udecode/slate';

export type GetFragmentPropOptions = {
  key?: string;
  defaultValue?: string;
  getProp?: (node: TElement | TText) => any;
  mode?: 'all' | 'block' | 'text';
};

export function getFragmentProp(
  fragment: TElement[],
  { key, defaultValue, getProp, mode = 'block' }: GetFragmentPropOptions = {}
): string | undefined {
  if (fragment.length === 0) return defaultValue;

  const getNodeValue =
    getProp ??
    ((node) => {
      return node[key!]!;
    });

  let value: string | undefined;

  for (const node of fragment) {
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
      const textEntries = Array.from(getNodeTexts(node));

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
