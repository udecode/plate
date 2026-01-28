import { Mark, Attribute } from '@core/index.js';
import { getMarkRange } from '@/core/helpers/getMarkRange.js';

/**
 * Move `from` forward and `to` backward until the first / last
 * non-whitespace character is reached.
 */
const trimRange = (doc, from, to) => {
  /*
   * A "non-user" position is one that produces **no text** when we ask
   * `doc.textBetween(pos, pos + 1, '')`.
   * That happens at node boundaries (between the doc node and its first child,
   * between paragraphs, etc.).
   *
   * A regular space typed by the user **does** produce text (" "), so it will
   * NOT be trimmed.
   */

  // Skip positions that produce no text output (node boundaries).
  while (from < to && doc.textBetween(from, from + 1, '') === '') {
    from += 1;
  }

  while (to > from && doc.textBetween(to - 1, to, '') === '') {
    to -= 1;
  }

  // This should now normalize the from and to selections to require
  // starting and ending without doc specific whitespace
  return { from, to };
};

export const Link = Mark.create({
  name: 'link',

  priority: 1000,

  keepOnSplit: false,

  inclusive: false,

  addOptions() {
    return {
      protocols: ['http', 'https'],
      htmlAttributes: {
        target: '_blank',
        rel: 'noopener noreferrer nofollow',
        class: null,
      },
    };
  },

  parseDOM() {
    return [{ tag: 'a' }];
  },

  renderDOM({ htmlAttributes }) {
    if (!isAllowedUri(htmlAttributes.href, this.options.protocols)) {
      return ['a', mergeAttributes(this.options.htmlAttributes, { ...htmlAttributes, href: '' }), 0];
    }

    return ['a', Attribute.mergeAttributes(this.options.htmlAttributes, htmlAttributes), 0];
  },

  addAttributes() {
    return {
      href: {
        default: null,
        renderDOM: ({ href, name }) => {
          if (href && isAllowedUri(href, this.options.protocols)) return { href };
          else if (name) return { href: `#${name}` };
          return {};
        },
      },
      target: {
        default: this.options.htmlAttributes.target,
      },
      rel: {
        default: this.options.htmlAttributes.rel,
      },
      rId: {
        default: this.options.htmlAttributes.rId || null,
      },
      text: {
        default: null,
      },
      name: {
        default: null,
      },
    };
  },

  addCommands() {
    return {
      setLink:
        ({ href, text } = {}) =>
        ({ state, dispatch, editor }) => {
          // Determine the text range we need to operate on.
          const { selection } = state;
          const linkMarkType = editor.schema.marks.link;
          const underlineMarkType = editor.schema.marks.underline;

          let from = selection.from;
          let to = selection.to;

          // If the cursor is inside an existing link with an empty selection,
          // expand the range to cover the whole link so we can edit it.
          if (selection.empty) {
            const range = getMarkRange(selection.$from, linkMarkType);
            if (range) {
              from = range.from;
              to = range.to;
            }
          } else {
            // When the current selection spans outside a link but its start
            // or end is within a link, operate only on that link, not on the
            // full selection. This prevents replacing surrounding non-link text.
            const fromLinkRange = getMarkRange(selection.$from, linkMarkType);
            const toLinkRange = getMarkRange(selection.$to, linkMarkType);

            if (fromLinkRange || toLinkRange) {
              // Prefer the range that actually lies inside a link. If both ends
              // are in (possibly different) links we pick the first one.
              const linkRange = fromLinkRange || toLinkRange;
              from = linkRange.from;
              to = linkRange.to;
            }
          }

          ({ from, to } = trimRange(state.doc, from, to));

          const currentText = state.doc.textBetween(from, to);
          const computedText = text ?? currentText;
          const finalText = computedText && computedText.length > 0 ? computedText : href || '';
          let tr = state.tr;

          // Replace the text if it has changed (or if there was no text yet).
          if (finalText && currentText !== finalText) {
            tr = tr.insertText(finalText, from, to);
            to = from + finalText.length;
          }

          // Remove existing link and underline marks in the affected range.
          // Then add the new link and underline marks.
          if (linkMarkType) tr = tr.removeMark(from, to, linkMarkType);
          if (underlineMarkType) tr = tr.removeMark(from, to, underlineMarkType);

          if (underlineMarkType) tr = tr.addMark(from, to, underlineMarkType.create());
          tr = tr.addMark(from, to, linkMarkType.create({ href, text: finalText }));

          dispatch(tr.scrollIntoView());
          return true;
        },
      unsetLink:
        () =>
        ({ chain }) => {
          return chain()
            .unsetMark('underline', { extendEmptyMarkRange: true })
            .unsetColor()
            .unsetMark('link', { extendEmptyMarkRange: true })
            .run();
        },
      toggleLink:
        ({ href, text } = {}) =>
        ({ commands }) => {
          if (!href) return commands.unsetLink();
          return commands.setLink({ href, text });
        },
    };
  },
});

const ATTR_WHITESPACE = /[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g;
function isAllowedUri(uri, protocols) {
  const allowedProtocols = ['http', 'https', 'mailto'];

  if (protocols) {
    protocols.forEach((protocol) => {
      const nextProtocol = typeof protocol === 'string' ? protocol : protocol.scheme;

      if (nextProtocol) {
        allowedProtocols.push(nextProtocol);
      }
    });
  }

  return (
    !uri ||
    uri
      .replace(ATTR_WHITESPACE, '')
      .match(new RegExp(`^(?:(?:${allowedProtocols.join('|')}):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))`, 'i'))
  );
}
