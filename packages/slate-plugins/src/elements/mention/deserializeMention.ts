import { DeserializeHtml } from '@udecode/slate-plugins-core';
import { getNodeDeserializer } from '../../common/utils/getNodeDeserializer';
import { setDefaults } from '../../common/utils/setDefaults';
import { DEFAULTS_MENTION } from './defaults';
import { MentionDeserializeOptions } from './types';

export const deserializeMention = (
  options?: MentionDeserializeOptions
): DeserializeHtml => {
  const { mention } = setDefaults(options, DEFAULTS_MENTION);

  return {
    element: getNodeDeserializer({
      type: mention.type,
      node: (el) => ({
        type: mention.type,
        value: el.getAttribute('data-slate-value'),
      }),
      rules: [{ className: mention.rootProps.className }],
      ...options?.mention?.deserialize,
    }),
  };
};
