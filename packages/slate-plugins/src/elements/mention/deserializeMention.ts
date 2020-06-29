import { DeserializeHtml, getElementDeserializer } from '@udecode/core';
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
