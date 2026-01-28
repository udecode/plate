import { Attribute, Node } from '@core/index.js';
import dotsLoader from '@harbour-enterprises/common/icons/dots-loader.svg';
import { AiLoaderNodeName } from './ai-constants.js';

export const AiLoaderNode = Node.create({
  name: AiLoaderNodeName,

  group: 'inline',

  inline: true,

  atom: true,

  selectable: false,

  draggable: false,

  addOptions() {
    return {
      htmlAttributes: {
        class: 'sd-ai-loader',
        contentEditable: 'false',
        'aria-label': 'AI loader node',
      },
    };
  },

  parseDOM() {
    return [{ tag: 'span.sd-ai-loader' }];
  },

  renderDOM({ htmlAttributes }) {
    const span = document.createElement('span');
    Object.entries(Attribute.mergeAttributes(this.options.htmlAttributes, htmlAttributes)).forEach(([k, v]) =>
      span.setAttribute(k, v),
    );

    const img = document.createElement('img');
    img.src = dotsLoader;
    img.alt = 'loading...';
    img.width = 100;
    img.height = 50;
    span.appendChild(img);
    return span;
  },
});
