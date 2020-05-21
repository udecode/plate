import { DeserializeHtml } from 'common/types';
import { getElementDeserializer } from 'element/utils';
import { MENTION } from './types';

export const deserializeMention = ({
  typeMention = MENTION,
} = {}): DeserializeHtml => ({
  element: getElementDeserializer(typeMention, {
    createElement: (el) => ({
      type: typeMention,
      character: el.getAttribute('data-slate-value'),
    }),
  }),
});
