// @ts-check

/**
 * @typedef {import('prosemirror-state').Transaction} Transaction
 * @typedef {import('../../../../../types.js').ValidatorLogger} ValidatorLogger
 * @typedef {import('../../../../../types.js').Editor} Editor
 * @typedef {import('../../../../../types.js').ElementInfo} ElementInfo
 */

/**
 * Ensure all image nodes have a valid rId attribute.
 * @param {ElementInfo[]} images
 * @param {Editor} editor
 * @param {Transaction} tr
 * @param {ValidatorLogger} logger
 * @returns {{ modified: boolean, results: string[] }}
 */
export function ensureValidImageRID(images, editor, tr, logger) {
  let modified = false;
  const results = [];

  images.forEach(({ node, pos }) => {
    const { rId, src } = node.attrs;
    if (!rId && src) {
      let newId = editor.converter.docxHelpers.findRelationshipIdFromTarget(src, editor);
      if (newId) logger.debug('Reusing existing rId for image:', newId, 'at pos:', pos);

      // If we still don't have an rId, create a new relationship
      if (!newId) {
        newId = editor.converter.docxHelpers.insertNewRelationship(src, 'image', editor);
        logger.debug('Creating new rId for image at pos:', pos, 'with src:', src);
      }

      tr.setNodeMarkup(pos, undefined, {
        ...node.attrs,
        rId: newId,
      });

      results.push(`Added missing rId to image at pos ${pos}`);
      modified = true;
    }
  });

  return { modified, results };
}
