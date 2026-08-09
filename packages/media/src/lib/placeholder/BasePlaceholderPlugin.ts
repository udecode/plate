import { defineBasePlugin } from '@platejs/core';
import { type ElementOf, property } from '@platejs/plite';
import { PLUGINS } from '@platejs/utils';

export const BasePlaceholderPlugin = defineBasePlugin(PLUGINS.placeholder, {
  schema: {
    element: {
      properties: {
        mediaType: property.string({ required: true }),
      },
      void: 'block',
    },
  },
});

export type PlaceholderElement = ElementOf<typeof BasePlaceholderPlugin>;
