import {
  AnyObject,
  createPluginFactory,
  KEY_DESERIALIZE_HTML,
  PlatePlugin,
  someNode,
} from '@udecode/plate-common';

import { onKeyDownList } from './onKeyDownList';
import { ListPlugin } from './types';
import { withList } from './withList';

export const ELEMENT_UL = 'ul';
export const ELEMENT_OL = 'ol';
export const ELEMENT_LI = 'li';
export const ELEMENT_LIC = 'lic';

/**
 * Enables support for bulleted, numbered and to-do lists.
 */
export const createListPlugin = createPluginFactory<AnyObject>({
  key: 'list',
  plugins: [
    {
      key: ELEMENT_UL,
      isElement: true,
      handlers: {
        onKeyDown: onKeyDownList,
      },
      withOverrides: withList,
      deserializeHtml: {
        rules: [
          {
            validNodeName: 'UL',
          },
        ],
      },
    } as PlatePlugin<ListPlugin>,
    {
      key: ELEMENT_OL,
      isElement: true,
      handlers: {
        onKeyDown: onKeyDownList,
      },
      deserializeHtml: { rules: [{ validNodeName: 'OL' }] },
    } as PlatePlugin<ListPlugin>,
    {
      key: ELEMENT_LI,
      isElement: true,
      deserializeHtml: { rules: [{ validNodeName: 'LI' }] },
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
      key: ELEMENT_LIC,
      isElement: true,
    },
  ],
});
