import type { Element } from '@platejs/plite';
import { NodeApi } from '@platejs/plite';

import { createBasePlugin, type DefinitionOf } from '../../plugin';

export type ElementStateApi = {
  isEmpty: (element: Element) => boolean;
};

export const ElementStatePlugin = createBasePlugin({
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
  name: 'elementState',
});

export type ElementStateDefinition = DefinitionOf<typeof ElementStatePlugin>;
