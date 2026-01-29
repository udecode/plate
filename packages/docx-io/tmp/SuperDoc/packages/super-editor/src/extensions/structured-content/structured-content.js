import { Node, Attribute } from '@core/index.js';

export const StructuredContent = Node.create({
  name: 'structuredContent',
  group: 'inline',
  inline: true,
  content: 'inline*',

  addOptions() {
    return {
      annotationClass: 'sd-structured-content-tag',
      htmlAttributes: {
        'aria-label': 'Structured content node',
      },
    };
  },

  parseDOM() {
    return [
      {
        tag: `span.${this.options.annotationClass}`,
        priority: 60,
      },
    ];
  },

  renderDOM({ htmlAttributes }) {
    return ['span', Attribute.mergeAttributes(this.options.htmlAttributes, htmlAttributes), 0];
  },

  addAttributes() {
    return {
      sdtPr: {
        rendered: false,
      },
    };
  },
});
