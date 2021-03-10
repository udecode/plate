import {
  getElementDeserializer,
  getSlateClass,
} from '@udecode/slate-plugins-common';
import {
  DeserializeHtml,
  useEditorMultiOptions,
} from '@udecode/slate-plugins-core';
import { KEYS_ALIGN } from './defaults';

export const useDeserializeAlign = (): DeserializeHtml => {
  const { align_center, align_right, align_justify } = useEditorMultiOptions(
    KEYS_ALIGN
  );

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
