import {
  definePlugin,
  type ElementOf,
  property,
  schema,
  PLUGINS,
} from '../../../core';
import { registerFirstPartyPlugin } from '../../../internal/plugin/firstPartyPlugin';

const DEFAULT_CALLOUT_ICON = '💡';

export const BaseCalloutPlugin = definePlugin(PLUGINS.callout, {
  formats: ({ defineFormats, schema: { type } }) =>
    defineFormats({
      plainText: {
        encode: ({ children }) => children,
      },
      markdown: { tag: type },
    }),
  schema: {
    element: schema.element.textBlock({
      ownsExit: true,
      properties: {
        backgroundColor: property.string(),
        icon: property.string({
          default: DEFAULT_CALLOUT_ICON,
          omitDefault: false,
        }),
        variant: property.string(),
      },
    }),
  },

  rules: {
    break: {
      default: 'lineBreak',
      empty: 'reset',
      emptyLineEnd: 'deleteExit',
    },
    delete: {
      start: 'reset',
    },
  },
});

export type CalloutElement = ElementOf<typeof BaseCalloutPlugin>;

registerFirstPartyPlugin(BaseCalloutPlugin);
