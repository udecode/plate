import { Mark, Attribute } from '@core/index.js';
import { TrackFormatMarkName } from './constants.js';
import { parseFormatList } from './trackChangesHelpers/index.js';

const trackFormatClass = 'track-format';

export const TrackFormat = Mark.create({
  name: TrackFormatMarkName,

  group: 'track',

  inclusive: false,

  addOptions() {
    return {
      htmlAttributes: {
        class: trackFormatClass,
      },
    };
  },

  addAttributes() {
    return {
      id: {
        default: '',
        parseDOM: (elem) => elem.getAttribute('data-id'),
        renderDOM: (attrs) => {
          if (!attrs.id) return {};
          return {
            'data-id': attrs.id,
          };
        },
      },

      author: {
        default: '',
        parseDOM: (elem) => elem.getAttribute('data-author'),
        renderDOM: (attrs) => {
          if (!attrs.author) return {};
          return {
            'data-author': attrs.author,
          };
        },
      },

      authorEmail: {
        default: '',
        parseDOM: (elem) => elem.getAttribute('data-authoremail'),
        renderDOM: (attrs) => {
          if (!attrs.authorEmail) return {};
          return {
            'data-authoremail': attrs.authorEmail,
          };
        },
      },

      date: {
        default: '',
        parseDOM: (elem) => elem.getAttribute('data-date'),
        renderDOM: (attrs) => {
          if (!attrs.date) return {};
          return {
            'data-date': attrs.date,
          };
        },
      },

      // {
      //   type: string, // the mark name
      //   attrs: object, // the mark attrs
      // }
      before: {
        default: [],
        parseDOM: (elem) => {
          return parseFormatList(elem.getAttribute('data-before'));
        },
        renderDOM: (attrs) => {
          if (!attrs.before) return {};
          return {
            'data-before': JSON.stringify(attrs.before),
          };
        },
      },

      // {
      //   type: string, // the mark name
      //   attrs: object, // the mark attrs
      // }
      after: {
        default: [],
        parseDOM: (elem) => {
          return parseFormatList(elem.getAttribute('data-after'));
        },
        renderDOM: (attrs) => {
          if (!attrs.after) return {};
          return {
            'data-after': JSON.stringify(attrs.after),
          };
        },
      },
    };
  },

  parseDOM() {
    return false;
  },

  renderDOM({ htmlAttributes }) {
    return ['span', Attribute.mergeAttributes(this.options.htmlAttributes, htmlAttributes), 0];
  },
});
