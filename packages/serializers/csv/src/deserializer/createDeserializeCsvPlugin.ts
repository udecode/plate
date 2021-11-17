import { createPluginFactory } from '@udecode/plate-core';
import { DeserializeCsvPlugin } from './types';
import { deserializeCsv } from './utils';

export const KEY_DESERIALIZE_CSV = 'deserializeCsv';

/**
 * Enables support for deserializing content
 * from CSV format to Slate format.
 */
export const createDeserializeCsvPlugin = createPluginFactory<DeserializeCsvPlugin>(
  {
    key: KEY_DESERIALIZE_CSV,
    editor: {
      insertData: {
        format: 'text/plain',
        getFragment: (editor, plugin, { data }) =>
          deserializeCsv(editor, { data, header: true }),
      },
    },
    options: {
      errorTolerance: 0.25,
    },
  }
);
