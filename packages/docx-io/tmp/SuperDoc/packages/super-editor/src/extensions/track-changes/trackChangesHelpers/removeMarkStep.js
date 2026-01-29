import { v4 as uuidv4 } from 'uuid';
import { TrackDeleteMarkName, TrackFormatMarkName } from '../constants.js';
import { TrackChangesBasePluginKey } from '../plugins/trackChangesBasePlugin.js';
import { CommentsPluginKey } from '../../comment/comments-plugin.js';

/**
 * Remove mark step.
 * @param {import('prosemirror-state').EditorState} options.state Editor state.
 * @param {import('prosemirror-transform').RemoveMarkStep} options.step Step.
 * @param {import('prosemirror-state').Transaction} options.newTr New transaction.
 * @param {import('prosemirror-model').Node} options.doc Doc.
 * @param {object} options.user User object ({ name, email }).
 * @param {string} options.date Date.
 */
export const removeMarkStep = ({ state, step, newTr, doc, user, date }) => {
  const meta = {};

  doc.nodesBetween(step.from, step.to, (node, pos) => {
    if (!node.isInline) {
      return true;
    }

    if (node.marks.find((mark) => mark.type.name === TrackDeleteMarkName)) {
      return false;
    }

    newTr.removeMark(Math.max(step.from, pos), Math.min(step.to, pos + node.nodeSize), step.mark);

    const allowedMarks = ['bold', 'italic', 'strike', 'underline', 'textStyle'];

    if (allowedMarks.includes(step.mark.type.name) && node.marks.find((mark) => mark.type === step.mark.type)) {
      const formatChangeMark = node.marks.find((mark) => mark.type.name === TrackFormatMarkName);

      let after = [];
      let before = [];

      if (formatChangeMark) {
        let foundAfter = formatChangeMark.attrs.after.find((mark) => mark.type === step.mark.type.name);

        if (foundAfter) {
          after = [...formatChangeMark.attrs.after.filter((mark) => mark.type !== step.mark.type.name)];
          before = [...formatChangeMark.attrs.before];
        } else {
          after = [...formatChangeMark.attrs.after];
          before = [
            ...formatChangeMark.attrs.before,
            {
              type: step.mark.type.name,
              attrs: { ...step.mark.attrs },
            },
          ];
        }
      } else {
        after = [];
        before = [
          {
            type: step.mark.type.name,
            attrs: { ...step.mark.attrs },
          },
        ];
      }

      if (after.length || before.length) {
        const newFormatMark = state.schema.marks[TrackFormatMarkName].create({
          id: uuidv4(),
          author: user.name,
          authorEmail: user.email,
          date,
          before,
          after,
        });

        newTr.addMark(Math.max(step.from, pos), Math.min(step.to, pos + node.nodeSize), newFormatMark);

        meta.formatMark = newFormatMark;
        meta.step = step;

        newTr.setMeta(TrackChangesBasePluginKey, meta);
        newTr.setMeta(CommentsPluginKey, { type: 'force' });
      } else if (formatChangeMark) {
        newTr.removeMark(Math.max(step.from, pos), Math.min(step.to, pos + node.nodeSize), formatChangeMark);
      }
    }
  });
};
