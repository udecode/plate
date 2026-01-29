import { Mark, Attribute } from '@core/index.js';
import { AiMarkName, AiAnimationMarkName } from './ai-constants.js';

export const AiMark = Mark.create({
  name: AiMarkName,

  group: 'ai',

  inclusive: false,

  addOptions() {
    return {
      htmlAttributes: { class: 'sd-ai-highlight' },
    };
  },

  addAttributes() {
    return {
      id: {
        default: null,
        rendered: false,
      },
    };
  },

  parseDOM() {
    return [{ tag: AiMarkName }];
  },

  renderDOM({ htmlAttributes }) {
    return [AiMarkName, Attribute.mergeAttributes(this.options.htmlAttributes, htmlAttributes)];
  },
});

export const AiAnimationMark = Mark.create({
  name: AiAnimationMarkName,

  group: 'ai',

  inclusive: false,
  spanning: false,
  excludes: AiAnimationMarkName,

  addOptions() {
    return {
      htmlAttributes: {},
    };
  },

  addAttributes() {
    return {
      id: {
        default: null,
        rendered: false,
      },
      class: {
        default: null,
        rendered: true,
      },
      dataMarkId: {
        default: null,
        rendered: true,
      },
    };
  },

  parseDOM() {
    return [{ tag: AiAnimationMarkName }];
  },

  renderDOM({ htmlAttributes }) {
    return [AiAnimationMarkName, Attribute.mergeAttributes(this.options.htmlAttributes, htmlAttributes)];
  },
});
