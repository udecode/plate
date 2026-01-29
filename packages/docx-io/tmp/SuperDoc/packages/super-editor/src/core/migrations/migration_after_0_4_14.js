import { twipsToLines, pixelsToTwips } from '@converter/helpers.js';

/**
 * This migration is necessary after 0.4.14 line change upgrades as we went from using pixels in
 * line spacing to unitless line spacing.
 *
 * @param {Editor} editor
 */
export const migration_after_0_4_14 = (editor) => {
  const { state } = editor;
  const { dispatch } = editor.view;
  const { tr } = state;
  if (!dispatch) return;

  state.doc.descendants((node, pos) => {
    if (node.type.name === 'paragraph') {
      const { attrs } = node;
      const { spacing } = attrs;

      if (!spacing) return;
      const newSpacing = {
        line: twipsToLines(pixelsToTwips(spacing.line)),
        lineSpaceBefore: twipsToLines(pixelsToTwips(spacing.lineSpaceBefore)),
        lineSpaceAfter: twipsToLines(pixelsToTwips(spacing.lineSpaceAfter)),
      };
      tr.setNodeMarkup(pos, undefined, {
        ...attrs,
        spacing: {
          ...spacing,
          ...newSpacing,
        },
      });
    }
  });
  dispatch(tr);
  return true;
};
