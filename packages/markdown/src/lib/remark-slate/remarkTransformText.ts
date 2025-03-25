import type { TText } from '@udecode/plate';

import type {
  MdastNode,
  MdastTextType,
  RemarkPluginOptions,
  RemarkTextRule,
} from './types';

import { getRemarkDefaultTextRules } from './remarkDefaultTextRules';
import { remarkTextTypes } from './remarkTextTypes';

export const remarkTransformText = (
  node: MdastNode,
  options: RemarkPluginOptions,
  inheritedMarkProps: Record<string, boolean> = {}
): TText | TText[] => {
  const { editor, textRules } = options;
  const defaultTextRules = getRemarkDefaultTextRules(editor);

  const { children, type, value } = node;

  // Ensure we only process text types
  if (!type || !remarkTextTypes.includes(type)) {
    return [{ text: '' }];
  }

  const textRule = ((textRules as any)[type] ||
    defaultTextRules[type as MdastTextType] ||
    defaultTextRules.text) as RemarkTextRule;

  // Get marks from the current node's transform
  const transformResult = textRule.transform(node, options);
  const currentMarks = Object.entries(transformResult)
    .filter((entry): entry is [string, boolean] => {
      const [key, value] = entry;
      return key !== 'text' && typeof value === 'boolean';
    })
    .reduce<Record<string, boolean>>((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});

  // Process children first
  const childTextNodes =
    children?.flatMap((child) =>
      remarkTransformText(child, options, {
        ...inheritedMarkProps,
        ...(type === 'text' ? {} : currentMarks),
      })
    ) || [];

  // If we have children or no value, return just the processed children
  if (childTextNodes.length > 0 || !value) {
    return childTextNodes;
  }

  // Otherwise, return a single text node with the value and marks
  return [
    {
      text: transformResult.text,
      ...currentMarks,
      ...inheritedMarkProps,
    },
  ];
};
