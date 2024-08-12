import { createPlugin } from '@udecode/plate-common';

import type { DeserializeCsvPluginOptions } from './types';

import { deserializeCsv } from './utils/index';

export const KEY_DESERIALIZE_CSV = 'deserializeCsv';

/** Enables support for deserializing content from CSV format to Slate format. */
export const DeserializeCsvPlugin = createPlugin<
  'deserializeCsv',
  DeserializeCsvPluginOptions
>({
  key: KEY_DESERIALIZE_CSV,
  options: {
    errorTolerance: 0.25,
    parseOptions: {
      header: true,
    },
  },
}).extend(({ editor }) => ({
  editor: {
    insertData: {
      format: 'text/plain',
      getFragment: ({ data }) => deserializeCsv(editor, { data }),
    },
  },
}));
