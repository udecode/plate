import { definePlugin, property } from '../../core';

/**
 * Marks text that Markdown import kept from raw HTML, such as a README's
 * centered header or an HTML comment, so Markdown export writes it back as
 * HTML when its block passes Plate's safety check and as escaped text
 * otherwise. Install it beside `MarkdownPlugin`. Every other format writes the
 * text as plain visible text.
 */
export const RawHtmlPlugin = definePlugin('rawHtml', {
  schema: {
    mark: {
      inclusive: false,
      property: property.boolean({ default: false, omitDefault: true }),
    },
  },
  formats: ({ defineFormats }) =>
    defineFormats({
      // HTML holds no trace of raw Markdown HTML, so no element decodes as it.
      html: {
        decode: () => undefined,
        encode: ({ value }) => (value ? { tag: 'span' } : null),
        match: [{ tag: 'span' }],
      },
    }),
});
