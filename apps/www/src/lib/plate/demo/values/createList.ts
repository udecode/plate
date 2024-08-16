import type { TElement, TText } from '@udecode/plate-common';

import {
  ListItemContentPlugin,
  ListItemPlugin,
  ListUnorderedPlugin,
} from '@udecode/plate-list';

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
      children: [
        {
          children: marks,
          type: ListItemContentPlugin.key,
        },
      ],
      type: ListItemPlugin.key,
    };
  });

  return [
    {
      children,
      type: ListUnorderedPlugin.key,
    },
  ];
};
