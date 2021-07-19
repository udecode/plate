import { getElementDeserializer } from '@udecode/plate-common';
import { Deserialize, getPlatePluginOptions } from '@udecode/plate-core';
import {
  DEFAULT_HEADING_LEVEL,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
} from './defaults';
import { HeadingPluginOptions } from './types';

export const getHeadingDeserialize = ({
  levels = DEFAULT_HEADING_LEVEL,
}: HeadingPluginOptions = {}): Deserialize => (editor) => {
  const h1 = getPlatePluginOptions(editor, ELEMENT_H1);
  const h2 = getPlatePluginOptions(editor, ELEMENT_H2);
  const h3 = getPlatePluginOptions(editor, ELEMENT_H3);
  const h4 = getPlatePluginOptions(editor, ELEMENT_H4);
  const h5 = getPlatePluginOptions(editor, ELEMENT_H5);
  const h6 = getPlatePluginOptions(editor, ELEMENT_H6);

  let deserializers = getElementDeserializer({
    type: h1.type,
    rules: [{ nodeNames: 'H1' }],
    ...h1.deserialize,
  });

  if (levels >= 2)
    deserializers = [
      ...deserializers,
      ...getElementDeserializer({
        type: h2.type,
        rules: [{ nodeNames: 'H2' }],
        ...h2.deserialize,
      }),
    ];
  if (levels >= 3)
    deserializers = [
      ...deserializers,
      ...getElementDeserializer({
        type: h3.type,
        rules: [{ nodeNames: 'H3' }],
        ...h3.deserialize,
      }),
    ];
  if (levels >= 4)
    deserializers = [
      ...deserializers,
      ...getElementDeserializer({
        type: h4.type,
        rules: [{ nodeNames: 'H4' }],
        ...h4.deserialize,
      }),
    ];
  if (levels >= 5)
    deserializers = [
      ...deserializers,
      ...getElementDeserializer({
        type: h5.type,
        rules: [{ nodeNames: 'H5' }],
        ...h5.deserialize,
      }),
    ];
  if (levels >= 6)
    deserializers = [
      ...deserializers,
      ...getElementDeserializer({
        type: h6.type,
        rules: [{ nodeNames: 'H6' }],
        ...h6.deserialize,
      }),
    ];

  return {
    element: deserializers,
  };
};
