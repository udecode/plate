import { getElementDeserializer } from '@udecode/slate-plugins-common';
import {
  DeserializeHtml,
  useEditorMultiOptions,
} from '@udecode/slate-plugins-core';
import { KEYS_LIST } from './defaults';

export const useDeserializeList = (): DeserializeHtml => {
  const { li, ul, ol } = useEditorMultiOptions(KEYS_LIST);

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
