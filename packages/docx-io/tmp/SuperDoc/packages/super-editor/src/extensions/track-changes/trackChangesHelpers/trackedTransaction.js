import { Mapping, ReplaceStep, AddMarkStep, RemoveMarkStep } from 'prosemirror-transform';
import { TextSelection } from 'prosemirror-state';
import { replaceStep } from './replaceStep.js';
import { addMarkStep } from './addMarkStep.js';
import { removeMarkStep } from './removeMarkStep.js';
import { TrackDeleteMarkName } from '../constants.js';
import { findMark } from '@core/helpers/index.js';
import { CommentsPluginKey } from '../../comment/comments-plugin.js';

/**
 * Tracked transaction to track changes.
 * @param {import('prosemirror-state').Transaction} options.tr Transaction.
 * @param {import('prosemirror-state').EditorState} options.state Editor state.
 * @param {object} options.user User object ({ name, email }).
 * @returns {import('prosemirror-state').Transaction} Modified transaction.
 */
export const trackedTransaction = ({ tr, state, user }) => {
  const onlyInputTypeMeta = ['inputType', 'uiEvent', 'paste', 'pointer'];
  const notAllowedMeta = ['historyUndo', 'historyRedo', 'acceptReject'];

  if (
    !tr.steps.length ||
    (tr.meta && !Object.keys(tr.meta).every((meta) => onlyInputTypeMeta.includes(meta))) ||
    notAllowedMeta.includes(tr.getMeta('inputType')) ||
    tr.getMeta(CommentsPluginKey) // Skip if it's a comment transaction.
  ) {
    return tr;
  }

  const newTr = state.tr;
  const map = new Mapping();
  const fixedTimeTo10Mins = Math.floor(Date.now() / 600000) * 600000;
  const date = new Date(fixedTimeTo10Mins).toISOString();

  tr.steps.forEach((originalStep, originalStepIndex) => {
    const step = originalStep.map(map);
    const { doc } = newTr;

    if (!step) {
      return;
    }

    if (step instanceof ReplaceStep) {
      replaceStep({
        state,
        tr,
        step,
        newTr,
        map,
        doc,
        user,
        date,
        originalStep,
        originalStepIndex,
      });
      console.debug('[track-changes]: replaceStep');
    } else if (step instanceof AddMarkStep) {
      addMarkStep({
        state,
        tr,
        step,
        newTr,
        map,
        doc,
        user,
        date,
      });
      console.debug('[track-changes]: addMarkStep');
    } else if (step instanceof RemoveMarkStep) {
      removeMarkStep({
        state,
        tr,
        step,
        newTr,
        map,
        doc,
        user,
        date,
      });
      console.debug('[track-changes]: removeMarkStep');
    } else {
      newTr.step(step);
      console.log('[track-changes]: otherStep');
    }
  });

  if (tr.getMeta('inputType')) {
    newTr.setMeta(tr.getMeta('inputType'));
  }

  if (tr.getMeta('uiEvent')) {
    newTr.setMeta(tr.getMeta('uiEvent'));
  }

  if (tr.selectionSet) {
    const deletionMarkSchema = state.schema.marks[TrackDeleteMarkName];
    const deletionMark = findMark(state, deletionMarkSchema, false);

    if (
      tr.selection instanceof TextSelection &&
      (tr.selection.from < state.selection.from || tr.getMeta('inputType') === 'deleteContentBackward')
    ) {
      const caretPos = map.map(tr.selection.from, -1);
      newTr.setSelection(new TextSelection(newTr.doc.resolve(caretPos)));
    } else if (tr.selection.from > state.selection.from && deletionMark) {
      const caretPos = map.map(deletionMark.to + 1, 1);
      newTr.setSelection(new TextSelection(newTr.doc.resolve(caretPos)));
    } else {
      newTr.setSelection(tr.selection.map(newTr.doc, map));
    }
  } else if (state.selection.from - tr.selection.from > 1 && tr.selection.$head.depth > 1) {
    const caretPos = map.map(tr.selection.from - 2, -1);
    newTr.setSelection(new TextSelection(newTr.doc.resolve(caretPos)));
  } else {
    // Skip the other cases for now.
  }

  if (tr.storedMarksSet) {
    newTr.setStoredMarks(tr.storedMarks);
  }

  if (tr.scrolledIntoView) {
    newTr.scrollIntoView();
  }

  return newTr;
};
