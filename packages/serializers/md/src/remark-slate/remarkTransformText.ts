import { TText, Value } from '@udecode/plate-core';
import { remarkDefaultTextRules } from './remarkDefaultTextRules';
import { MdastNode, RemarkPluginOptions } from './types';

export const remarkTransformText = <V extends Value>(
  node: MdastNode,
  options: RemarkPluginOptions<V>,
  inheritedMarkProps: { [key: string]: boolean } = {}
): TText | TText[] => {
  const { editor, textRules } = options;

  const { type, value, children } = node;
  const textRule = textRules[type!] || remarkDefaultTextRules.text;

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
