import {
  defineBasePlugin,
  type ElementOf,
  property,
  PLUGINS,
} from '../../../../core';

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
