import {
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
  ELEMENT_PARAGRAPH,
} from '@udecode/plate';
import { MyPlatePlugin } from 'examples-next/src/lib/plate/typescript/plateTypes';

export const lineHeightPlugin: Partial<MyPlatePlugin> = {
  inject: {
    props: {
      defaultNodeValue: 1.5,
      validNodeValues: [1, 1.2, 1.5, 2, 3],
      validTypes: [
        ELEMENT_PARAGRAPH,
        ELEMENT_H1,
        ELEMENT_H2,
        ELEMENT_H3,
        ELEMENT_H4,
        ELEMENT_H5,
        ELEMENT_H6,
      ],
    },
  },
};
