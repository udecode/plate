import { getElementDeserializer } from '@udecode/plate-common';
import {
  Deserialize,
  getPlatePluginOptions,
  getSlateClass,
} from '@udecode/plate-core';
import {
  ELEMENT_ALIGN_CENTER,
  ELEMENT_ALIGN_JUSTIFY,
  ELEMENT_ALIGN_RIGHT,
} from './defaults';

export const getAlignDeserialize = (): Deserialize => (editor) => {
  const align_center = getPlatePluginOptions(editor, ELEMENT_ALIGN_CENTER);
  const align_right = getPlatePluginOptions(editor, ELEMENT_ALIGN_RIGHT);
  const align_justify = getPlatePluginOptions(editor, ELEMENT_ALIGN_JUSTIFY);

  return {
    element: [
      ...getElementDeserializer({
        type: align_center.type,
        rules: [
          { className: getSlateClass(align_center.type) },
          {
            nodeNames: 'DIV',
            style: {
              textAlign: 'center',
            },
          },
        ],
        ...align_center.deserialize,
      }),
      ...getElementDeserializer({
        type: align_right.type,
        rules: [
          { className: getSlateClass(align_right.type) },
          {
            nodeNames: 'DIV',
            style: {
              textAlign: 'right',
            },
          },
        ],
        ...align_right.deserialize,
      }),
      ...getElementDeserializer({
        type: align_justify.type,
        rules: [
          { className: getSlateClass(align_justify.type) },
          {
            nodeNames: 'DIV',
            style: {
              textAlign: 'justify',
            },
          },
        ],
        ...align_justify.deserialize,
      }),
    ],
  };
};
