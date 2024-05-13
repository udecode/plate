import {
  KEY_DESERIALIZE_HTML,
  type PlatePlugin,
  createPluginFactory,
  someNode,
} from '@udecode/plate-common/server';

import type { ListPlugin } from './types';

import { onKeyDownList } from './onKeyDownList';
import { withList } from './withList';

export const LIST_PLUGIN_KEY = 'list';

export const ELEMENT_UL = 'ul';

export const ELEMENT_OL = 'ol';

export const ELEMENT_LI = 'li';

export const ELEMENT_LIC = 'lic';

/** Enables support for bulleted, numbered and to-do lists. */
export const createListPlugin = createPluginFactory({
  key: LIST_PLUGIN_KEY,
  plugins: [
    {
      deserializeHtml: {
        rules: [
          {
            validNodeName: 'UL',
          },
        ],
      },
      handlers: {
        onKeyDown: onKeyDownList,
      },
      isElement: true,
      key: ELEMENT_UL,
      withOverrides: withList,
    } as PlatePlugin<ListPlugin>,
    {
      deserializeHtml: { rules: [{ validNodeName: 'OL' }] },
      handlers: {
        onKeyDown: onKeyDownList,
      },
      isElement: true,
      key: ELEMENT_OL,
    } as PlatePlugin<ListPlugin>,
    {
      deserializeHtml: { rules: [{ validNodeName: 'LI' }] },
      isElement: true,
      key: ELEMENT_LI,
      then: (editor, { type }) => ({
        inject: {
          pluginsByKey: {
            [KEY_DESERIALIZE_HTML]: {
              editor: {
                insertData: {
                  preInsert: () => {
                    return someNode(editor, { match: { type } });
                  },
                },
              },
            },
          },
        },
      }),
    },
    {
      isElement: true,
      key: ELEMENT_LIC,
    },
  ],
});
