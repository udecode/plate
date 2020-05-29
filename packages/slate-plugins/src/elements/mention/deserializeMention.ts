import { DeserializeHtml } from '../../common';
import { getElementDeserializer } from '../../element/utils';
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
