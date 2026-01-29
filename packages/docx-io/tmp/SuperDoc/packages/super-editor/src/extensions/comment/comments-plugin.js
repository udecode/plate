import { Plugin, PluginKey, TextSelection } from 'prosemirror-state';
import { Extension } from '@core/Extension.js';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { removeCommentsById, getHighlightColor } from './comments-helpers.js';
import { CommentMarkName } from './comments-constants.js';
import { PaginationPluginKey } from '../pagination/pagination-helpers.js';

// Example tracked-change keys, if needed
import { TrackInsertMarkName, TrackDeleteMarkName, TrackFormatMarkName } from '../track-changes/constants.js';
import { TrackChangesBasePluginKey } from '../track-changes/plugins/index.js';
import { comments_module_events } from '@harbour-enterprises/common';
import { translateFormatChangesToEnglish } from './comments-helpers.js';

const TRACK_CHANGE_MARKS = [TrackInsertMarkName, TrackDeleteMarkName, TrackFormatMarkName];

export const CommentsPluginKey = new PluginKey('comments');

export const CommentsPlugin = Extension.create({
  name: 'comments',

  addCommands() {
    return {
      insertComment:
        (conversation) =>
        ({ tr, dispatch }) => {
          const { selection } = tr;
          const { $from, $to } = selection;
          const { commentId, isInternal } = conversation;

          tr.setMeta(CommentsPluginKey, { event: 'add' });
          tr.addMark(
            $from.pos,
            $to.pos,
            this.editor.schema.marks[CommentMarkName].create({
              commentId,
              internal: isInternal,
            }),
          );

          dispatch(tr);
          return true;
        },

      removeComment:
        ({ commentId, importedId }) =>
        ({ tr, dispatch, state }) => {
          tr.setMeta(CommentsPluginKey, { event: 'deleted' });
          removeCommentsById({ commentId, importedId, state, tr, dispatch });
        },

      setActiveComment:
        ({ commentId }) =>
        ({ tr }) => {
          tr.setMeta(CommentsPluginKey, { type: 'setActiveComment', activeThreadId: commentId, forceUpdate: true });
          return true;
        },

      setCommentInternal:
        ({ commentId, isInternal }) =>
        ({ tr, dispatch, state }) => {
          const { doc } = state;
          let foundStartNode;
          let foundPos;

          // Find the commentRangeStart node that matches the comment ID
          tr.setMeta(CommentsPluginKey, { event: 'update' });
          doc.descendants((node, pos) => {
            if (foundStartNode) return;

            const { marks = [] } = node;
            const commentMark = marks.find((mark) => mark.type.name === CommentMarkName);

            if (commentMark) {
              const { attrs } = commentMark;
              const wid = attrs.commentId;
              if (wid === commentId) {
                foundStartNode = node;
                foundPos = pos;
              }
            }
          });

          // If no matching node, return false
          if (!foundStartNode) return false;

          // Update the mark itself
          tr.addMark(
            foundPos,
            foundPos + foundStartNode.nodeSize,
            this.editor.schema.marks[CommentMarkName].create({
              commentId,
              internal: isInternal,
            }),
          );

          tr.setMeta(CommentsPluginKey, { type: 'setCommentInternal' });
          dispatch(tr);
          return true;
        },

      resolveComment:
        ({ commentId }) =>
        ({ tr, dispatch, state }) => {
          tr.setMeta(CommentsPluginKey, { event: 'update' });
          removeCommentsById({ commentId, state, tr, dispatch });
        },
      setCursorById:
        (id) =>
        ({ state, editor }) => {
          const { from } = findRangeById(state.doc, id) || {};
          if (from != null) {
            state.tr.setSelection(TextSelection.create(state.doc, from));
            editor.view.focus();
            return true;
          }
          return false;
        },
    };
  },

  addPmPlugins() {
    const editor = this.editor;
    let shouldUpdate;

    if (editor.options.isHeadless) return [];

    const commentsPlugin = new Plugin({
      key: CommentsPluginKey,

      state: {
        init() {
          return {
            activeThreadId: null,
            externalColor: '#B1124B',
            internalColor: '#078383',
            decorations: DecorationSet.empty,
            allCommentPositions: {},
            allCommentIds: [],
            changedActiveThread: false,
            trackedChanges: {},
          };
        },

        apply(tr, pluginState, _, newEditorState) {
          const paginationMeta = tr.getMeta(PaginationPluginKey);
          const isPaginationInit = paginationMeta?.isReadyToInit;
          if (isPaginationInit) shouldUpdate = true;

          const meta = tr.getMeta(CommentsPluginKey);
          const { type } = meta || {};

          if (type === 'force' || type === 'forceTrackChanges') shouldUpdate = true;

          if (type === 'setActiveComment') {
            shouldUpdate = true;
            pluginState.activeThreadId = meta.activeThreadId; // Update the outer scope variable
            return {
              ...pluginState,
              activeThreadId: meta.activeThreadId,
              changedActiveThread: true,
            };
          }

          if (!isPaginationInit && !shouldUpdate && meta && meta.decorations) {
            return {
              ...pluginState,
              decorations: meta.decorations,
              allCommentPositions: meta.allCommentPositions,
            };
          }

          // If this is a tracked change transaction, handle separately
          const trackedChangeMeta = tr.getMeta(TrackChangesBasePluginKey);
          const currentTrackedChanges = pluginState.trackedChanges;
          if (trackedChangeMeta) {
            pluginState.trackedChanges = handleTrackedChangeTransaction(
              trackedChangeMeta,
              currentTrackedChanges,
              newEditorState,
              editor,
            );
          }

          // Check for changes in the actively selected comment
          const trChangedActiveComment = meta?.type === 'setActiveComment';
          if ((!tr.docChanged && tr.selectionSet) || trChangedActiveComment) {
            const { selection } = tr;
            let currentActiveThread = getActiveCommentId(newEditorState.doc, selection);
            if (trChangedActiveComment) currentActiveThread = meta.activeThreadId;

            const previousSelectionId = pluginState.activeThreadId;
            if (previousSelectionId !== currentActiveThread) {
              // Update both the plugin state and the local variable
              pluginState.activeThreadId = currentActiveThread;
              const update = {
                type: comments_module_events.SELECTED,
                activeCommentId: currentActiveThread ? currentActiveThread : null,
              };

              shouldUpdate = true;
              editor.emit('commentsUpdate', update);

              const { tr: newTr } = editor.view.state;
              const { dispatch } = editor.view;
              newTr.setMeta(CommentsPluginKey, { type: 'force' });
              dispatch(newTr);
            }
          }

          return pluginState;
        },
      },

      props: {
        decorations(state) {
          return this.getState(state).decorations;
        },
      },

      view() {
        let prevDoc;
        let prevActiveThreadId; // Add this to track active thread changes

        return {
          update(view) {
            const { state } = view;
            const { doc, tr } = state;
            const pluginState = CommentsPluginKey.getState(state);
            const currentActiveThreadId = pluginState.activeThreadId;

            const meta = tr.getMeta(CommentsPluginKey);
            if (meta?.type === 'setActiveComment' || meta?.forceUpdate) {
              shouldUpdate = true;
            }

            // Check if document changed
            if (prevDoc && !prevDoc.eq(doc)) shouldUpdate = true;

            // Check if active thread changed
            if (prevActiveThreadId !== currentActiveThreadId) {
              shouldUpdate = true;
              prevActiveThreadId = currentActiveThreadId;
            }

            if (!shouldUpdate) return;
            prevDoc = doc;
            shouldUpdate = false;

            const decorations = [];
            const allCommentPositions = {};
            doc.descendants((node, pos) => {
              const { marks = [] } = node;
              const commentMarks = marks.filter((mark) => mark.type.name === CommentMarkName);

              let hasActive = false;
              commentMarks.forEach((commentMark) => {
                const { attrs } = commentMark;
                const threadId = attrs.commentId || attrs.importedId;

                const currentBounds = view.coordsAtPos(pos);

                updatePosition({
                  allCommentPositions,
                  threadId,
                  pos,
                  currentBounds,
                  node,
                });

                const isInternal = attrs.internal;
                if (!hasActive) hasActive = currentActiveThreadId === threadId;

                // Get the color based on current activeThreadId
                let color = getHighlightColor({
                  activeThreadId: currentActiveThreadId,
                  threadId,
                  isInternal,
                  editor,
                });

                const deco = Decoration.inline(pos, pos + node.nodeSize, {
                  style: `background-color: ${color};`,
                  'data-thread-id': threadId,
                  class: 'sd-editor-comment-highlight',
                });

                // Ignore inner marks if we need to show an outer active one
                if (hasActive && currentActiveThreadId !== threadId) return;
                decorations.push(deco);
              });

              const trackedChangeMark = findTrackedMark({
                doc,
                from: pos,
                to: pos + node.nodeSize,
              });

              if (trackedChangeMark) {
                const currentBounds = view.coordsAtPos(pos);
                const { id } = trackedChangeMark.mark.attrs;
                updatePosition({
                  allCommentPositions,
                  threadId: id,
                  pos,
                  currentBounds,
                  node,
                });
                // Add decoration for tracked changes when activated
                const isActiveTrackedChange = currentActiveThreadId === id;
                if (isActiveTrackedChange) {
                  const trackedChangeDeco = Decoration.inline(pos, pos + node.nodeSize, {
                    style: `border-width: 2px;`,
                    'data-thread-id': id,
                    class: 'sd-editor-tracked-change-highlight',
                  });

                  decorations.push(trackedChangeDeco);
                }
              }
            });

            const decorationSet = DecorationSet.create(doc, decorations);

            // Compare new decorations with the old state to avoid infinite loop
            const oldDecorations = pluginState.decorations;

            // We only dispatch if something actually changed
            const same = oldDecorations.eq(decorationSet);
            if (!same) {
              const tr = state.tr.setMeta(CommentsPluginKey, {
                decorations: decorationSet,
                allCommentPositions,
                forceUpdate: true,
              });
              // Dispatch the transaction to update pluginState
              view.dispatch(tr);
            }

            editor.emit('comment-positions', { allCommentPositions });
          },
        };
      },
    });

    return [commentsPlugin];
  },
});

const updatePosition = ({ allCommentPositions, threadId, pos, currentBounds, node }) => {
  let bounds = {};

  if (currentBounds instanceof DOMRect) {
    bounds = {
      top: currentBounds.top,
      bottom: currentBounds.bottom,
      left: currentBounds.left,
      right: currentBounds.right,
    };
  } else {
    bounds = { ...currentBounds };
  }

  if (!allCommentPositions[threadId]) {
    allCommentPositions[threadId] = {
      threadId,
      start: pos,
      end: pos + node.nodeSize,
      bounds,
    };
  } else {
    // Adjust the positional indices
    const existing = allCommentPositions[threadId];
    existing.start = Math.min(existing.start, pos);
    existing.end = Math.max(existing.end, pos + node.nodeSize);
    existing.bounds.top = Math.min(existing.bounds.top, currentBounds.top);
    existing.bounds.bottom = Math.max(existing.bounds.bottom, currentBounds.bottom);
  }
};

/**
 * This is run when a new selection is set (tr.selectionSet) to return the active comment ID, if any
 * If there are multiple, only return the first one
 *
 * @param {Object} doc The current document
 * @param {Selection} selection The current selection
 * @returns {String | null} The active comment ID, if any
 */
const getActiveCommentId = (doc, selection) => {
  if (!selection) return;
  const { $from, $to } = selection;

  // We only need to check for active comment ID if the selection is empty
  if ($from.pos !== $to.pos) return;

  const nodeAtPos = doc.nodeAt($from.pos);
  if (!nodeAtPos) return;

  // If we have a tracked change, we can return it right away
  const trackedChangeMark = findTrackedMark({
    doc,
    from: $from.pos,
    to: $to.pos,
  });

  if (trackedChangeMark) {
    return trackedChangeMark.mark.attrs.id;
  }

  // Otherwise, we need to check for comment nodes
  const overlaps = [];
  let found = false;

  // Look for commentRangeStart nodes before the current position
  // There could be overlapping comments so we need to track all of them
  doc.descendants((node, pos) => {
    if (found) return;

    // node goes from `pos` to `end = pos + node.nodeSize`
    const end = pos + node.nodeSize;

    // If $from.pos is outside this node’s range, skip it
    if ($from.pos < pos || $from.pos >= end) {
      return;
    }

    // Now we know $from.pos is within this node’s start/end
    const { marks = [] } = node;
    const commentMark = marks.find((mark) => mark.type.name === CommentMarkName);
    if (commentMark) {
      overlaps.push({
        node,
        pos,
        size: node.nodeSize,
      });
    }

    // If we've passed the position, we can stop
    if (pos > $from.pos) {
      found = true;
    }
  });

  // Get the closest commentRangeStart node to the current position
  let closest = null;
  let closestCommentRangeStart = null;
  overlaps.forEach(({ pos, node }) => {
    if (!closest) closest = $from.pos - pos;

    const diff = $from.pos - pos;
    if (diff >= 0 && diff <= closest) {
      closestCommentRangeStart = node;
      closest = diff;
    }
  });

  const { marks: closestMarks = [] } = closestCommentRangeStart || {};
  const closestCommentMark = closestMarks.find((mark) => mark.type.name === CommentMarkName);
  return closestCommentMark?.attrs?.commentId || closestCommentMark?.attrs?.importedId;
};

const findTrackedMark = ({
  doc,
  from,
  to,
  offset = 1, // To get non-inclusive marks.
}) => {
  const startPos = Math.max(from - offset, 0);
  const endPos = Math.min(to + offset, doc.content.size);

  let markFound;

  doc.nodesBetween(startPos, endPos, (node, pos) => {
    if (!node || node?.nodeSize === undefined) {
      return;
    }

    const mark = node.marks.find((mark) => TRACK_CHANGE_MARKS.includes(mark.type.name));

    if (mark && !markFound) {
      markFound = {
        from: pos,
        to: pos + node.nodeSize,
        mark,
      };
    }
  });

  return markFound;
};

const handleTrackedChangeTransaction = (trackedChangeMeta, trackedChanges, newEditorState, editor) => {
  const { insertedMark, deletionMark, formatMark, deletionNodes } = trackedChangeMeta;

  if (!insertedMark && !deletionMark && !formatMark) {
    return;
  }

  const newTrackedChanges = { ...trackedChanges };
  let id = insertedMark?.attrs?.id || deletionMark?.attrs?.id || formatMark?.attrs?.id;

  if (!id) {
    return trackedChanges;
  }

  // Maintain a map of tracked changes with their inserted/deleted ids
  let isNewChange = false;
  if (!newTrackedChanges[id]) {
    newTrackedChanges[id] = {};
    isNewChange = true;
  }

  if (insertedMark) newTrackedChanges[id].insertion = id;
  if (deletionMark) newTrackedChanges[id].deletion = deletionMark.attrs?.id;
  if (formatMark) newTrackedChanges[id].format = formatMark.attrs?.id;

  const { step } = trackedChangeMeta;
  let nodes = step?.slice?.content?.content || [];

  // Track format has no nodes, we need to find the node
  if (!nodes.length) {
    newEditorState.doc.descendants((node) => {
      const hasFormatMark = node.marks.find((mark) => mark.type.name === TrackFormatMarkName);
      if (hasFormatMark) {
        nodes = [node];
        return false;
      }
    });
  }

  const emitParams = createOrUpdateTrackedChangeComment({
    documentId: editor.options.documentId,
    event: isNewChange ? 'add' : 'update',
    marks: {
      insertedMark,
      deletionMark,
      formatMark,
    },
    deletionNodes,
    nodes,
    newEditorState,
  });

  if (emitParams) editor.emit('commentsUpdate', emitParams);

  return newTrackedChanges;
};

const getTrackedChangeText = ({ state, node, mark, marks, trackedChangeType, isDeletionInsertion }) => {
  let trackedChangeText = '';
  let deletionText = '';

  if (trackedChangeType === TrackInsertMarkName) {
    trackedChangeText = node?.text ?? '';
  }

  // If this is a format change, let's get the string of what changes were made
  if (trackedChangeType === TrackFormatMarkName) {
    trackedChangeText = translateFormatChangesToEnglish(mark.attrs);
  }

  if (trackedChangeType === TrackDeleteMarkName || isDeletionInsertion) {
    deletionText = node?.text ?? '';

    if (isDeletionInsertion) {
      let { id } = marks.deletionMark.attrs;
      let deletionNode = findNode(state.doc, (node) => {
        const { marks = [] } = node;
        const changeMarks = marks.filter((mark) => TRACK_CHANGE_MARKS.includes(mark.type.name));
        if (!changeMarks.length) return false;
        const hasMatchingId = changeMarks.find((mark) => mark.attrs.id === id);
        if (hasMatchingId) return true;
      });
      deletionText = deletionNode?.node.text ?? '';
    }
  }

  return {
    deletionText,
    trackedChangeText,
  };
};

const createOrUpdateTrackedChangeComment = ({ event, marks, deletionNodes, nodes, newEditorState, documentId }) => {
  const trackedMark = marks.insertedMark || marks.deletionMark || marks.formatMark;
  const { type, attrs } = trackedMark;

  const { name: trackedChangeType } = type;
  const { author, authorEmail, date } = attrs;
  const id = attrs.id;

  const node = nodes[0];
  const isDeletionInsertion = !!(marks.insertedMark && marks.deletionMark);

  let existingNode;
  newEditorState.doc.descendants((node) => {
    const { marks = [] } = node;
    const changeMarks = marks.filter((mark) => TRACK_CHANGE_MARKS.includes(mark.type.name));
    if (!changeMarks.length) return;
    const hasMatchingId = changeMarks.find((mark) => mark.attrs.id === id);
    if (hasMatchingId) existingNode = node;
    if (existingNode) return false;
  });

  const { deletionText, trackedChangeText } = getTrackedChangeText({
    state: newEditorState,
    node: existingNode || node,
    mark: trackedMark,
    marks,
    trackedChangeType,
    isDeletionInsertion,
    deletionNodes,
  });

  if (!deletionText && !trackedChangeText) {
    return;
  }

  const params = {
    event: comments_module_events.ADD,
    type: 'trackedChange',
    documentId,
    changeId: id,
    trackedChangeType: isDeletionInsertion ? 'both' : trackedChangeType,
    trackedChangeText,
    deletedText: marks.deletionMark ? deletionText : null,
    author,
    authorEmail,
    date,
  };

  if (event === 'add') params.event = comments_module_events.ADD;
  else if (event === 'update') params.event = comments_module_events.UPDATE;

  return params;
};

function findNode(node, predicate) {
  let found = null;
  node.descendants((node, pos) => {
    if (predicate(node)) found = { node, pos };
    if (found) return false;
  });
  return found;
}

function findRangeById(doc, id) {
  let from = null,
    to = null;
  doc.descendants((node, pos) => {
    const trackedMark = node.marks.find((m) => TRACK_CHANGE_MARKS.includes(m.type.name) && m.attrs.id === id);
    if (trackedMark) {
      if (from === null || pos < from) from = pos;
      if (to === null || pos + node.nodeSize > to) to = pos + node.nodeSize;
    }
    const commentMark = node.marks.find(
      (m) => m.type.name === CommentMarkName && (m.attrs.commentId === id || m.attrs.importedId === id),
    );
    if (commentMark) {
      if (from === null || pos < from) from = pos;
      if (to === null || pos + node.nodeSize > to) to = pos + node.nodeSize;
    }
  });
  return from !== null && to !== null ? { from, to } : null;
}
