import { createPlugin } from '@udecode/plate-common';

import type { DeserializeCsvPluginOptions } from './types';

import { deserializeCsv } from './utils/index';

/** Enables support for deserializing content from CSV format to Slate format. */
export const DeserializeCsvPlugin = createPlugin<
  'deserializeCsv',
  DeserializeCsvPluginOptions
>({
  key: 'deserializeCsv',
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
