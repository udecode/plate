// @ts-check

/**
 * @typedef {import('prosemirror-state').Transaction} Transaction
 * @typedef {import('../../../../../types.js').ValidatorLogger} ValidatorLogger
 * @typedef {import('../../../../../types.js').Editor} Editor
 * @typedef {import('../../../../../types.js').ValidatorFunction} ValidatorFunction
 * @typedef {import('../../../../../types.js').ElementInfo} ElementInfo
 */

/**
 * Ensure all link marks have a valid rId attribute.
 * @param {ElementInfo[]} links
 * @param {Editor} editor
 * @param {Transaction} tr
 * @param {ValidatorLogger} logger
 * @returns {{ modified: boolean, results: string[] }}
 */
export function ensureValidLinkRID(links, editor, tr, logger) {
  let modified = false;
  const results = [];

  links.forEach(({ mark, from, to }) => {
    const { rId, href } = mark.attrs;

    if (!rId && href) {
      let newId = editor.converter.docxHelpers.findRelationshipIdFromTarget(href, editor);
      if (newId) logger.debug('Reusing existing rId for link:', newId, 'from pos:', from, 'to pos:', to);

      // If we still don't have an rId, create a new relationship
      if (!newId) {
        newId = editor.converter.docxHelpers.insertNewRelationship(href, 'hyperlink', editor);
        logger.debug('Creating new rId for link from pos:', from, 'to pos:', to, 'with href:', href);
      }

      if (newId) {
        // Remove the old mark and add a new one with the rId
        const linkMarkType = editor.schema.marks.link;
        const newMark = linkMarkType.create({
          ...mark.attrs,
          rId: newId,
        });

        tr.removeMark(from, to, linkMarkType);
        tr.addMark(from, to, newMark);

        results.push(`Added missing rId to link from pos ${from} to ${to}`);
        modified = true;
      }
    }
  });

  return { modified, results };
}
