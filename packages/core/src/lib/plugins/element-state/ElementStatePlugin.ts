import type { Element } from '@platejs/plite';
import { NodeApi } from '@platejs/plite';

import { type InferConfig, createBasePlugin } from '../../plugin';

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
            })?.value.significant === false
          );
        },
      }),
  }),
  key: 'elementState',
});

export type ElementStateConfig = InferConfig<typeof ElementStatePlugin>;
