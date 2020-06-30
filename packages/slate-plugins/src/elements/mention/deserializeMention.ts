import { DeserializeHtml } from '@udecode/core';
import { getElementDeserializer } from '../../common/utils/getElementDeserializer';
import { MENTION, MentionDeserializeOptions } from './types';

export const deserializeMention = ({
  typeMention = MENTION,
}: MentionDeserializeOptions = {}): DeserializeHtml => ({
  element: getElementDeserializer(typeMention, {
    createElement: (el) => ({
      type: typeMention,
      value: el.getAttribute('data-slate-value'),
    }),
  }),
});
