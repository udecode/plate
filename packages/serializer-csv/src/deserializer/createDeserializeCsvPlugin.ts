import { createPluginFactory } from '@udecode/plate-common';
import { deserializeCsv } from './utils/index';
import { DeserializeCsvPlugin } from './types';

export const KEY_DESERIALIZE_CSV = 'deserializeCsv';

/**
 * Enables support for deserializing content
 * from CSV format to Slate format.
 */
export const createDeserializeCsvPlugin =
  createPluginFactory<DeserializeCsvPlugin>({
    key: KEY_DESERIALIZE_CSV,
    options: {
      errorTolerance: 0.25,
      parseOptions: {
        header: true,
      },
    },
    then: (editor) => ({
      editor: {
        insertData: {
          format: 'text/plain',
          getFragment: ({ data }) => deserializeCsv(editor, { data }),
        },
      },
    }),
  });
