import { TElement, TText } from '@udecode/plate-common';
import { ELEMENT_LI, ELEMENT_LIC, ELEMENT_UL } from '@udecode/plate-list';

export const createList = (
  items: string[],
  { splitSeparator = '`' }: { splitSeparator?: string } = {}
): TElement[] => {
  const children: TElement[] = items.map((item) => {
    const texts = item.split(splitSeparator);
    const marks: TText[] = texts.map((text, index) => {
      const res: any = { text };
      if (index % 2 === 1) {
        res.code = true;
      }
      return res;
    });

    return {
      type: ELEMENT_LI,
      children: [
        {
          type: ELEMENT_LIC,
          children: marks,
        },
      ],
    };
  });

  return [
    {
      type: ELEMENT_UL,
      children,
    },
  ];
};
