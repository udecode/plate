import type { Element } from 'plitejs';
import { NodeApi } from 'plitejs';

import { defineBasePlugin, type DefinitionOf } from '../../plugin';

export type ElementStateApi = {
  isEmpty: (element: Element) => boolean;
};

export const ElementStatePlugin = defineBasePlugin('elementState', {
  api: ({ editor }) => ({
    isEmpty: (element: Element) =>
      !NodeApi.hasProps(element, {
        ignore: (key) => {
          if (key === 'type') return true;
          if (typeof element.type !== 'string') return false;

          return (
            editor.read.schema.property({
              key,
              placement: 'element',
              type: element.type,
            })?.role === 'metadata'
          );
        },
      }),
  }),
});

export type ElementStateDefinition = DefinitionOf<typeof ElementStatePlugin>;
