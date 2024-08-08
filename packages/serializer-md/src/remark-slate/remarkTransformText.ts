import type { TText } from '@udecode/plate-common/server';

import type { MdastNode, RemarkPluginOptions } from './types';

import { remarkDefaultTextRules } from './remarkDefaultTextRules';

export const remarkTransformText = (
  node: MdastNode,
  options: RemarkPluginOptions,
  inheritedMarkProps: Record<string, boolean> = {}
): TText | TText[] => {
  const { editor, textRules } = options;

  const { children, type, value } = node;
  const textRule = (textRules as any)[type!] || remarkDefaultTextRules.text;

  const { mark, transform = (text: string) => text } = textRule;

  const markProps = mark
    ? {
        ...inheritedMarkProps,
        [mark({ editor })]: true,
      }
    : inheritedMarkProps;

  const childTextNodes =
    children?.flatMap((child) =>
      remarkTransformText(child, options, markProps)
    ) || [];

  const currentTextNodes =
    value || childTextNodes.length === 0
      ? [{ text: transform(value || ''), ...markProps } as TText]
      : [];

  return [...currentTextNodes, ...childTextNodes];
};
