import { Mark, Attribute } from '@core/index.js';
import { CommentMarkName } from './comments-constants.js';

export const CommentsMark = Mark.create({
  name: CommentMarkName,

  group: 'comments',

  excludes: '',

  addOptions() {
    return {
      htmlAttributes: { class: 'sd-editor-comment' },
    };
  },

  addAttributes() {
    return {
      commentId: {},
      importedId: {},
      internal: {
        default: true,
        rendered: false,
      },
    };
  },

  parseDOM() {
    return [{ tag: CommentMarkName }];
  },

  renderDOM({ htmlAttributes }) {
    return [CommentMarkName, Attribute.mergeAttributes(this.options.htmlAttributes, htmlAttributes)];
  },
});
