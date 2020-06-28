import { DeserializeHtml } from '../../common';
import { AlignDeserializeOptions, ALIGN_CENTER, ALIGN_LEFT, ALIGN_RIGHT } from './types';

const getNodeDeserializer = (
  type: string,
  { createNode, tagNames }: { createNode: Function; tagNames: string[] }
) => {
  const deserializer = {
    [type]: createNode,
  };
  return tagNames.reduce((obj: any, tagName: string) => {
    obj[tagName] = createNode;
    return obj;
  }, deserializer);
};

const getElementDeserializer = (
  type: string,
  {
    createElement = () => ({ type }),
    tagNames = [],
  }: { createElement?: Function; tagNames: string[] }
) => getNodeDeserializer(type, { createNode: createElement, tagNames });

export const deserializeAlign = ({
  typeAlignLeft = ALIGN_LEFT,
  typeAlignCenter = ALIGN_CENTER,
  typeAlignRight = ALIGN_RIGHT,
}: AlignDeserializeOptions = {}): DeserializeHtml => ({
  element: {
    ...getElementDeserializer(typeAlignLeft, { tagNames: ['DIV'] }),
    ...getElementDeserializer(typeAlignRight, { tagNames: ['DIV'] }),
    ...getElementDeserializer(typeAlignCenter, { tagNames: ['DIV'] }),
  },
});
