import { ListStyleType } from '@udecode/plate-indent-list';

export const getTextListStyleType = (
  text: string
): ListStyleType | undefined => {
  text = text.trimStart();

  if (text.match(/^\d+[.\\]/)?.[0]) {
    if (text[0] === '0') {
      return ListStyleType.DecimalLeadingZero;
    }

    return ListStyleType.Decimal;
  }

  if (text.match(/^[cdilmvx]+\./)?.[0]) {
    return ListStyleType.LowerRoman;
  }

  if (text.match(/^[a-z]+\./)?.[0]) {
    return ListStyleType.LowerAlpha;
  }

  if (text.match(/^[CDILMVX]+\./)?.[0]) {
    return ListStyleType.UpperRoman;
  }

  if (text.match(/^[A-Z]+\./)?.[0]) {
    return ListStyleType.UpperAlpha;
  }
};
