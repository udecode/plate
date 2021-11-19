import { ListStyleType } from '@udecode/plate-indent-list';

export const getTextListStyleType = (
  text: string
): ListStyleType | undefined => {
  // text.match(/^\d+\s*[-\\.)]?\s+/)?.[0];
  if (text.match(/^\d+[\\.]/)?.[0]) {
    return ListStyleType.Decimal;
  }

  if (text.match(/^[a-z]+\./)?.[0]) {
    return ListStyleType.LowerAlpha;
  }
};
