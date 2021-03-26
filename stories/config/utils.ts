import {
  ELEMENT_LI,
  ELEMENT_PARAGRAPH,
  ELEMENT_UL,
  SlateDocumentDescendant,
  SlateDocumentFragment,
} from '@udecode/slate-plugins';
import { Text } from 'slate';
import { options } from './pluginOptions';

export const createParagraph = (text: string, mark?: string) => {
  const leaf = { text };
  if (mark) {
    leaf[mark] = true;
  }

  return {
    type: options[ELEMENT_PARAGRAPH].type,
    children: [leaf],
  };
};
export const createList = (
  items: string[],
  { splitSeparator = '`' }: { splitSeparator?: string } = {}
): SlateDocumentFragment => {
  const children = items.map(
    (item): SlateDocumentDescendant => {
      const texts = item.split(splitSeparator);
      const marks: Text[] = texts.map((text, index) => {
        const res: any = { text };
        if (index % 2 === 1) {
          res.code = true;
        }
        return res;
      });

      return {
        type: options[ELEMENT_LI].type,
        children: [
          {
            type: options[ELEMENT_PARAGRAPH].type,
            children: marks,
          },
        ],
      } as any;
    }
  ) as SlateDocumentFragment;

  return [
    {
      type: options[ELEMENT_UL].type,
      children,
    },
  ];
};

export const getNodesWithRandomId = (nodes: any[]) => {
  let _id = 10000;
  nodes.forEach((node) => {
    const children = node.children as any[];
    children?.forEach((block) => {
      block.id = _id;
      _id++;
    });
  });

  return nodes;
};
