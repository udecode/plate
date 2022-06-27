import { ELEMENT_PARAGRAPH, TText } from '@udecode/plate';

export const createElement = (
  text = '',
  {
    type = ELEMENT_PARAGRAPH,
    mark,
  }: {
    type?: string;
    mark?: string;
  } = {}
) => {
  const leaf: TText = { text };
  if (mark) {
    leaf[mark] = true;
  }

  return {
    type,
    children: [leaf],
  };
};
