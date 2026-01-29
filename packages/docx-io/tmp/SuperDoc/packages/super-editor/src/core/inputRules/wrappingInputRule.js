import { canJoin, findWrapping } from 'prosemirror-transform';
import { InputRule } from '../InputRule.js';
import { callOrGet } from '../utilities/callOrGet.js';

/**
 * Build an input rule for automatically wrapping a textblock when a
 * given string is typed. When using a regular expresion you’ll
 * probably want the regexp to start with `^`, so that the pattern can
 * only occur at the start of a textblock.
 */
export function wrappingInputRule(config) {
  return new InputRule({
    match: config.match,
    handler: ({ state, range, match, chain }) => {
      const attributes = callOrGet(config.getAttributes, null, match) || {};
      const tr = state.tr.delete(range.from, range.to);
      const $start = tr.doc.resolve(range.from);
      const blockRange = $start.blockRange();
      const wrapping = blockRange && findWrapping(blockRange, config.type, attributes);

      if (!wrapping) {
        return null;
      }

      tr.wrap(blockRange, wrapping);

      if (config.keepMarks && config.editor) {
        const { selection, storedMarks } = state;
        const { splittableMarks } = config.editor.extensionService;
        const marks = storedMarks || (selection.$to.parentOffset && selection.$from.marks());

        if (marks) {
          const filteredMarks = marks.filter((mark) => splittableMarks.includes(mark.type.name));

          tr.ensureMarks(filteredMarks);
        }
      }
      if (config.keepAttributes) {
        /** If the nodeType is `bulletList` or `orderedList` set the `nodeType` as `listItem` */
        const nodeType =
          config.type.name === 'bulletList' || config.type.name === 'orderedList' ? 'listItem' : config.type.name;

        chain().updateAttributes(nodeType, attributes).run();
      }

      const before = tr.doc.resolve(range.from - 1).nodeBefore;

      if (
        before &&
        before.type === config.type &&
        canJoin(tr.doc, range.from - 1) &&
        (!config.joinPredicate || config.joinPredicate(match, before))
      ) {
        tr.join(range.from - 1);
      }
    },
  });
}
