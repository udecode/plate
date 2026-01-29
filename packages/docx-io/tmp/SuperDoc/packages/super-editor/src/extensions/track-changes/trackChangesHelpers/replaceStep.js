import { ReplaceStep } from 'prosemirror-transform';
import { markInsertion } from './markInsertion.js';
import { markDeletion } from './markDeletion.js';
import { findMark } from '@core/helpers/index.js';
import { TrackDeleteMarkName } from '../constants.js';
import { TrackChangesBasePluginKey } from '../plugins/index.js';
import { CommentsPluginKey } from '../../comment/comments-plugin.js';

/**
 * Replace step.
 * @param {import('prosemirror-state').EditorState} options.state Editor state.
 * @param {import('prosemirror-state').Transaction} options.tr Transaction.
 * @param {import('prosemirror-transform').ReplaceStep} options.step Step.
 * @param {import('prosemirror-state').Transaction} options.newTr New transaction.
 * @param {import('prosemirror-transform').Mapping} options.map Map.
 * @param {import('prosemirror-model').Node} options.doc Doc.
 * @param {object} options.user User object ({ name, email }).
 * @param {string} options.date Date.
 * @param {import('prosemirror-transform').ReplaceStep} options.originalStep Original step.
 * @param {number} options.originalStepIndex Original step index.
 */
export const replaceStep = ({ state, tr, step, newTr, map, user, date, originalStep, originalStepIndex }) => {
  const deletionMarkSchema = state.schema.marks[TrackDeleteMarkName];
  const deletionMark = findMark(state, deletionMarkSchema, false);
  const positionTo = deletionMark ? deletionMark.to : step.to;

  const newStep = new ReplaceStep(
    positionTo, // We insert all the same steps, but with "from"/"to" both set to "to" in order not to delete content. Mapped as needed.
    positionTo,
    step.slice,
    step.structure,
  );

  // We didn't apply the original step in its original place. We adjust the map accordingly.
  const invertStep = originalStep.invert(tr.docs[originalStepIndex]).map(map);
  map.appendMap(invertStep.getMap());

  const meta = {};
  if (newStep) {
    const trTemp = state.apply(newTr).tr;

    if (trTemp.maybeStep(newStep).failed) {
      return;
    }

    const mappedNewStepTo = newStep.getMap().map(newStep.to);

    const insertedMark = markInsertion({
      tr: trTemp,
      from: newStep.from,
      to: mappedNewStepTo,
      user,
      date,
    });

    // We condense it down to a single replace step.
    const condensedStep = new ReplaceStep(newStep.from, newStep.to, trTemp.doc.slice(newStep.from, mappedNewStepTo));

    newTr.step(condensedStep);
    const mirrorIndex = map.maps.length - 1;
    map.appendMap(condensedStep.getMap(), mirrorIndex);

    if (newStep.from !== mappedNewStepTo) {
      meta.insertedMark = insertedMark;
      meta.step = condensedStep;
    }

    if (!newTr.selection.eq(trTemp.selection)) {
      newTr.setSelection(trTemp.selection);
    }
  }

  if (step.from !== step.to) {
    const {
      deletionMark,
      deletionMap,
      nodes: deletionNodes,
    } = markDeletion({
      tr: newTr,
      from: step.from,
      to: step.to,
      user,
      date,
    });

    meta.deletionNodes = deletionNodes;
    meta.deletionMark = deletionMark;

    map.appendMapping(deletionMap);
  }

  // Add meta to the new transaction.
  newTr.setMeta(TrackChangesBasePluginKey, meta);
  newTr.setMeta(CommentsPluginKey, { type: 'force' });
};
