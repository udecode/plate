import { findNode } from '@udecode/plate-common';
import { createPluginFactory, PlatePlugin } from '@udecode/plate-core';
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
export const createListPlugin = createPluginFactory({
  key: 'list',
  plugins: [
    {
      key: ELEMENT_UL,
      isElement: true,
      handlers: {
        onKeyDown: onKeyDownList,
      },
      withOverrides: withList,
      deserializeHtml: { validNodeName: 'UL' },
    } as PlatePlugin<{}, ListPlugin>,
    {
      key: ELEMENT_OL,
      isElement: true,
      handlers: {
        onKeyDown: onKeyDownList,
      },
      deserializeHtml: { validNodeName: 'OL' },
    } as PlatePlugin<{}, ListPlugin>,
    {
      key: ELEMENT_LI,
      isElement: true,
      injectPlugin: (editor, { key, type }) => {
        if (key === 'deserializeHtml') {
          return {
            preInsert: () => {
              const liEntry = findNode(editor, { match: { type } });

              if (liEntry) {
                return true;
              }
            },
          };
        }
      },
      deserializeHtml: { validNodeName: 'LI' },
    },
    {
      key: ELEMENT_LIC,
      isElement: true,
    },
  ],
});
