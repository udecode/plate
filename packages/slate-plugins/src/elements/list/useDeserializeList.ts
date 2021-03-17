import { getElementDeserializer } from '@udecode/slate-plugins-common';
import { DeserializeHtml, useEditorOptions } from '@udecode/slate-plugins-core';

export const useDeserializeList = (): DeserializeHtml => {
  const { li, ul, ol } = useEditorOptions();

  return {
    element: [
      ...getElementDeserializer({
        type: ul.type,
        rules: [{ nodeNames: 'UL' }],
        ...ul.deserialize,
      }),
      ...getElementDeserializer({
        type: ol.type,
        rules: [{ nodeNames: 'OL' }],
        ...ol.deserialize,
      }),
      ...getElementDeserializer({
        type: li.type,
        rules: [{ nodeNames: 'LI' }],
        ...li.deserialize,
      }),
    ],
  };
};
