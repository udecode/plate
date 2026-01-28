import { defineStore } from 'pinia';
import { ref, reactive, computed } from 'vue';
import { comments_module_events } from '@harbour-enterprises/common';
import { useSuperdocStore } from '@superdoc/stores/superdoc-store';
import { syncCommentsToClients } from '../core/collaboration/helpers.js';
import {
  Editor,
  trackChangesHelpers,
  TrackChangesBasePluginKey,
  CommentsPluginKey,
} from '@harbour-enterprises/super-editor';
import { getRichTextExtensions } from '@harbour-enterprises/super-editor';
import useComment from '@superdoc/components/CommentsLayer/use-comment';

export const useCommentsStore = defineStore('comments', () => {
  const superdocStore = useSuperdocStore();
  const commentsConfig = reactive({
    name: 'comments',
    readOnly: false,
    allowResolve: true,
    showResolved: false,
  });

  const isDebugging = false;
  const debounceTimers = {};

  const COMMENT_EVENTS = comments_module_events;
  const hasInitializedComments = ref(false);
  const hasSyncedCollaborationComments = ref(false);
  const commentsParentElement = ref(null);
  const hasInitializedLocations = ref(false);
  const activeComment = ref(null);
  const editingCommentId = ref(null);
  const commentDialogs = ref([]);
  const overlappingComments = ref([]);
  const overlappedIds = new Set([]);
  const suppressInternalExternal = ref(true);
  const currentCommentText = ref('');
  const commentsList = ref([]);
  const isCommentsListVisible = ref(false);
  const editorCommentIds = ref([]);
  const editorCommentPositions = ref({});

  // Floating comments
  const floatingCommentsOffset = ref(0);
  const sortedConversations = ref([]);
  const visibleConversations = ref([]);
  const skipSelectionUpdate = ref(false);
  const isFloatingCommentsReady = ref(false);
  const generalCommentIds = ref([]);

  const pendingComment = ref(null);

  /**
   * Initialize the store
   *
   * @param {Object} config The comments module config from SuperDoc
   * @returns {void}
   */
  const init = (config = {}) => {
    const updatedConfig = { ...commentsConfig, ...config };
    Object.assign(commentsConfig, updatedConfig);

    suppressInternalExternal.value = commentsConfig.suppressInternalExternal || false;

    // Map initial comments state
    if (config.comments && config.comments.length) {
      commentsList.value = config.comments?.map((c) => useComment(c)) || [];
    }
  };

  /**
   * Get a comment by either ID or imported ID
   *
   * @param {string} id The comment ID
   * @returns {Object} The comment object
   */
  const getComment = (id) => {
    if (id === undefined || id === null) return null;
    return commentsList.value.find((c) => c.commentId == id || c.importedId == id);
  };

  /**
   * Set the active comment or clear all active comments
   *
   * @param {string | undefined | null} id The comment ID
   * @returns {void}
   */
  const setActiveComment = (superdoc, id) => {
    // If no ID, we clear any focused comments
    if (id === undefined || id === null) {
      activeComment.value = null;
      if (superdoc.activeEditor) {
        superdoc.activeEditor.commands?.setActiveComment({ commentId: null });
      }
      return;
    }

    const comment = getComment(id);
    if (comment) activeComment.value = comment.commentId;
    if (superdoc.activeEditor) {
      superdoc.activeEditor.commands?.setActiveComment({ commentId: activeComment.value });
    }
  };

  /**
   * Called when a tracked change is updated. Creates a new comment if necessary,
   * or updates an existing tracked-change comment.
   *
   * @param {Object} param0
   * @param {Object} param0.superdoc The SuperDoc instance
   * @param {Object} param0.params The tracked change params
   * @returns {void}
   */
  const handleTrackedChangeUpdate = ({ superdoc, params }) => {
    const {
      event,
      changeId,
      trackedChangeText,
      trackedChangeType,
      deletedText,
      authorEmail,
      date,
      author: authorName,
      documentId,
      coords,
    } = params;

    const comment = getPendingComment({
      documentId,
      commentId: changeId,
      trackedChange: true,
      trackedChangeText,
      trackedChangeType,
      deletedText,
      createdTime: date,
      creatorName: authorName,
      creatorEmail: authorEmail,
      isInternal: false,
      selection: {
        selectionBounds: coords,
      },
    });

    if (event === 'add') {
      // If this is a new tracked change, add it to our comments
      addComment({ superdoc, comment });
    } else if (event === 'update') {
      // If we have an update event, simply update the composable comment
      const existingTrackedChange = commentsList.value.find((comment) => comment.commentId === changeId);
      if (!existingTrackedChange) return;

      existingTrackedChange.trackedChangeText = trackedChangeText;

      if (deletedText) {
        existingTrackedChange.deletedText = deletedText;
      }

      const emitData = {
        type: COMMENT_EVENTS.UPDATE,
        comment: existingTrackedChange.getValues(),
      };

      syncCommentsToClients(superdoc, emitData);
      debounceEmit(changeId, emitData, superdoc);
    }
  };

  const debounceEmit = (commentId, event, superdoc, delay = 1000) => {
    if (debounceTimers[commentId]) {
      clearTimeout(debounceTimers[commentId]);
    }

    debounceTimers[commentId] = setTimeout(() => {
      if (superdoc) {
        if (__IS_DEBUG__) console.debug('[debounceEmit] tracked change update emitting...', event);
        superdoc.emit('comments-update', event);
      }
      delete debounceTimers[commentId];
    }, delay);
  };

  const showAddComment = (superdoc) => {
    const event = { type: COMMENT_EVENTS.PENDING };
    if (__IS_DEBUG__) console.debug('[showAddComment] emitting...', event);
    superdoc.emit('comments-update', event);

    const selection = { ...superdocStore.activeSelection };
    selection.selectionBounds = { ...selection.selectionBounds };

    if (superdocStore.selectionPosition?.source) {
      superdocStore.selectionPosition.source = null;
    }

    pendingComment.value = getPendingComment({ selection, documentId: selection.documentId, parentCommentId: null });
    if (!superdoc.config.isInternal) pendingComment.value.isInternal = false;

    if (superdoc.activeEditor?.commands) {
      superdoc.activeEditor.commands.insertComment({ ...pendingComment.value.getValues(), commentId: 'pending' });
    }

    if (pendingComment.value.selection.source === 'super-editor' && superdocStore.selectionPosition) {
      superdocStore.selectionPosition.source = 'super-editor';
    }

    activeComment.value = pendingComment.value.commentID;
  };

  /**
   * Generate the comments list separating resolved and active
   * We only return parent comments here, since CommentDialog.vue will handle threaded comments
   */
  const getGroupedComments = computed(() => {
    const parentComments = [];
    const resolvedComments = [];
    const childCommentMap = new Map();

    commentsList.value.forEach((comment) => {
      // Track resolved comments
      if (comment.resolvedTime) {
        resolvedComments.push(comment);
      }

      // Track parent comments
      else if (!comment.parentCommentId && !comment.resolvedTime) {
        parentComments.push({ ...comment });
      }

      // Track child comments (threaded comments)
      else if (comment.parentCommentId) {
        if (!childCommentMap.has(comment.parentCommentId)) {
          childCommentMap.set(comment.parentCommentId, []);
        }
        childCommentMap.get(comment.parentCommentId).push(comment);
      }
    });

    // Return only parent comments
    const sortedParentComments = parentComments.sort((a, b) => a.createdTime - b.createdTime);
    const sortedResolvedComments = resolvedComments.sort((a, b) => a.createdTime - b.createdTime);

    return {
      parentComments: sortedParentComments,
      resolvedComments: sortedResolvedComments,
    };
  });

  const hasOverlapId = (id) => overlappedIds.includes(id);
  const documentsWithConverations = computed(() => {
    return superdocStore.documents;
  });

  const getConfig = computed(() => {
    return commentsConfig;
  });

  const getCommentLocation = (selection, parent) => {
    const containerBounds = selection.getContainerLocation(parent);
    const top = containerBounds.top + selection.selectionBounds.top;
    const left = containerBounds.left + selection.selectionBounds.left;
    return {
      top: top,
      left: left,
    };
  };

  /**
   * Get a new pending comment
   *
   * @param {Object} param0
   * @param {Object} param0.selection The selection object
   * @param {String} param0.documentId The document ID
   * @param {String} param0.parentCommentId The parent comment
   * @returns {Object} The new comment object
   */
  const getPendingComment = ({ selection, documentId, parentCommentId, ...options }) => {
    return _getNewcomment({ selection, documentId, parentCommentId, ...options });
  };

  /**
   * Get the new comment object
   *
   * @param {Object} param0
   * @param {Object} param0.selection The selection object
   * @param {String} param0.documentId The document ID
   * @param {String} param0.parentCommentId The parent comment ID
   * @returns {Object} The new comment object
   */
  const _getNewcomment = ({ selection, documentId, parentCommentId, ...options }) => {
    let activeDocument;
    if (documentId) activeDocument = superdocStore.getDocument(documentId);
    else if (selection) activeDocument = superdocStore.getDocument(selection.documentId);

    if (!activeDocument) activeDocument = superdocStore.documents[0];

    return useComment({
      fileId: activeDocument.id,
      fileType: activeDocument.type,
      parentCommentId,
      creatorEmail: superdocStore.user.email,
      creatorName: superdocStore.user.name,
      commentText: currentCommentText.value,
      selection,
      ...options,
    });
  };

  /**
   * Remove the pending comment
   *
   * @returns {void}
   */
  const removePendingComment = (superdoc) => {
    currentCommentText.value = '';
    pendingComment.value = null;
    activeComment.value = null;
    superdocStore.selectionPosition = null;

    superdoc.activeEditor?.commands.removeComment({ commentId: 'pending' });
  };

  /**
   * Add a new comment to the document
   *
   * @param {Object} param0
   * @param {Object} param0.superdoc The SuperDoc instance
   * @returns {void}
   */
  const addComment = ({ superdoc, comment }) => {
    let parentComment = commentsList.value.find((c) => c.commentId === activeComment.value);
    if (!parentComment) parentComment = comment;

    const newComment = useComment(comment.getValues());

    if (pendingComment.value) newComment.setText({ text: currentCommentText.value, suppressUpdate: true });
    else newComment.setText({ text: comment.commentText, suppressUpdate: true });
    newComment.selection.source = pendingComment.value?.selection?.source;

    // Set isInternal flag
    if (parentComment) {
      const isParentInternal = parentComment.isInternal;
      newComment.isInternal = isParentInternal;
    }

    // If the current user is not internal, set the comment to external
    if (!superdoc.config.isInternal) newComment.isInternal = false;

    // Add the new comments to our global list
    commentsList.value.push(newComment);

    // Clean up the pending comment
    removePendingComment(superdoc);

    // If this is not a tracked change, and it belongs to a Super Editor, and its not a child comment
    // We need to let the editor know about the new comment
    if (!comment.trackedChange && superdoc.activeEditor?.commands && !comment.parentCommentId) {
      // Add the comment to the active editor
      superdoc.activeEditor.commands.insertComment(newComment.getValues());
    }

    const event = { type: COMMENT_EVENTS.ADD, comment: newComment.getValues() };

    // If collaboration is enabled, sync the comments to all clients
    syncCommentsToClients(superdoc, event);

    // Emit event for end users
    if (__IS_DEBUG__) console.debug('[addComment] emitting...', event);
    superdoc.emit('comments-update', event);
  };

  const deleteComment = ({ commentId: commentIdToDelete, superdoc }) => {
    const commentIndex = commentsList.value.findIndex((c) => c.commentId === commentIdToDelete);
    const comment = commentsList.value[commentIndex];
    const { commentId, importedId } = comment;
    const { fileId } = comment;

    superdoc.activeEditor?.commands?.removeComment({ commentId, importedId });

    // Remove the current comment
    commentsList.value.splice(commentIndex, 1);

    // Remove any child comments of the removed comment
    const childCommentIds = commentsList.value
      .filter((c) => c.parentCommentId === commentId)
      .map((c) => c.commentId || c.importedId);
    commentsList.value = commentsList.value.filter((c) => !childCommentIds.includes(c.commentId));

    const event = {
      type: COMMENT_EVENTS.DELETED,
      comment: comment.getValues(),
      changes: [{ key: 'deleted', commentId, fileId }],
    };

    if (__IS_DEBUG__) console.debug('[deleteComment] emitting...', event);
    superdoc.emit('comments-update', event);
    syncCommentsToClients(superdoc, event);
  };

  /**
   * Cancel the pending comment
   *
   * @returns {void}
   */
  const cancelComment = (superdoc) => {
    removePendingComment(superdoc);
  };

  /**
   * Initialize loaded comments into SuperDoc by mapping the imported
   * comment data to SuperDoc useComment objects.
   *
   * Updates the commentsList ref with the new comments.
   *
   * @param {Object} param0
   * @param {Array} param0.comments The comments to be loaded
   * @param {String} param0.documentId The document ID
   * @returns {void}
   */
  const processLoadedDocxComments = async ({ superdoc, editor, comments, documentId }) => {
    const document = superdocStore.getDocument(documentId);

    if (__IS_DEBUG__) console.debug('[processLoadedDocxComments] processing comments...', comments);

    comments.forEach((comment) => {
      const htmlContent = getHTmlFromComment(comment.textJson);

      if (!htmlContent && !comment.trackedChange) {
        return;
      }

      const creatorName = comment.creatorName.replace('(imported)', '');
      const importedName = `${creatorName} (imported)`;
      const newComment = useComment({
        fileId: documentId,
        fileType: document.type,
        commentId: comment.commentId,
        isInternal: false,
        parentCommentId: comment.parentCommentId,
        creatorName,
        creatorEmail: comment.creatorEmail,
        importedAuthor: {
          name: importedName,
          email: comment.creatorEmail,
        },
        commentText: getHTmlFromComment(comment.textJson),
        resolvedTime: comment.isDone ? Date.now() : null,
        resolvedByEmail: comment.isDone ? comment.creatorEmail : null,
        resolvedByName: comment.isDone ? importedName : null,
        trackedChange: comment.trackedChange || false,
        trackedChangeText: comment.trackedChangeText,
        trackedChangeType: comment.trackedChangeType,
        deletedText: comment.trackedDeletedText,
      });

      addComment({ superdoc, comment: newComment });
    });

    setTimeout(() => {
      // do not block the first rendering of the doc
      // and create comments asynchronously.
      createCommentForTrackChanges(editor);
    }, 0);
  };

  const createCommentForTrackChanges = (editor) => {
    let trackedChanges = trackChangesHelpers.getTrackChanges(editor.state);
    let isLargeDoc = editor.state.doc.nodeSize >= 100_000;

    if (isLargeDoc && trackedChanges.length) {
      trackedChanges = trackedChanges.slice(0, 100);
    }

    // Create comments for tracked changes
    // that do not have a corresponding comment (created in Word).
    trackedChanges.forEach(({ mark }, index) => {
      console.debug(`Create comment for track change: ${index}`);

      const { dispatch } = editor.view;
      const { tr } = editor.view.state;

      const foundComment = commentsList.value.find((i) => i.commentId === mark.attrs.id);
      const isLastIteration = trackedChanges.length === index + 1;

      if (foundComment) {
        if (isLastIteration) {
          tr.setMeta(CommentsPluginKey, { type: 'force' });
          dispatch(tr);
        }
        return;
      }

      const markMetaKeys = {
        trackInsert: 'insertedMark',
        trackDelete: 'deletionMark',
        trackFormat: 'formatMark',
      };
      const markKeyName = markMetaKeys[mark.type.name];

      if (markKeyName) {
        if (isLastIteration) tr.setMeta(CommentsPluginKey, { type: 'force' });
        tr.setMeta(CommentsPluginKey, { type: 'forceTrackChanges' });
        tr.setMeta(TrackChangesBasePluginKey, { [markKeyName]: mark });
        dispatch(tr);
      }
    });
  };

  const translateCommentsForExport = () => {
    const processedComments = [];
    commentsList.value.forEach((comment) => {
      const values = comment.getValues();
      const richText = values.commentText;
      const schema = convertHtmlToSchema(richText);
      processedComments.push({
        ...values,
        commentJSON: schema,
      });
    });
    return processedComments;
  };

  const convertHtmlToSchema = (commentHTML) => {
    const div = document.createElement('div');
    div.innerHTML = commentHTML;
    const editor = new Editor({
      mode: 'text',
      isHeadless: true,
      content: div,
      extensions: getRichTextExtensions(),
    });
    return editor.getJSON().content[0];
  };

  /**
   * Triggered when the editor locations are updated
   * Updates floating comment locations from the editor
   *
   * @param {DOMElement} parentElement The parent element of the editor
   * @returns {void}
   */
  const handleEditorLocationsUpdate = (allCommentPositions) => {
    editorCommentPositions.value = allCommentPositions || {};
  };

  const getFloatingComments = computed(() => {
    const comments = getGroupedComments.value?.parentComments
      .filter((c) => !c.resolvedTime)
      .filter((c) => {
        const keys = Object.keys(editorCommentPositions.value);
        const isPdfComment = c.selection?.source !== 'super-editor';
        if (isPdfComment) return true;
        const commentKey = c.commentId || c.importedId;
        return keys.includes(commentKey);
      });
    return comments;
  });

  /**
   * Get HTML content from the comment text JSON (which uses DOCX schema)
   *
   * @param {Object} commentTextJson The comment text JSON
   * @returns {string} The HTML content
   */
  const getHTmlFromComment = (commentTextJson) => {
    // If no content, we can't convert and its not a valid comment
    if (!commentTextJson.content?.length) return;

    try {
      const editor = new Editor({
        mode: 'text',
        isHeadless: true,
        content: commentTextJson,
        loadFromSchema: true,
        extensions: getRichTextExtensions(),
      });
      return editor.getHTML();
    } catch (error) {
      console.warn('Failed to convert comment', error);
      return;
    }
  };

  return {
    COMMENT_EVENTS,
    isDebugging,
    hasInitializedComments,
    hasSyncedCollaborationComments,
    editingCommentId,
    activeComment,
    commentDialogs,
    overlappingComments,
    overlappedIds,
    suppressInternalExternal,
    pendingComment,
    currentCommentText,
    commentsList,
    isCommentsListVisible,
    generalCommentIds,
    editorCommentIds,
    commentsParentElement,
    editorCommentPositions,
    hasInitializedLocations,

    // Floating comments
    floatingCommentsOffset,
    sortedConversations,
    visibleConversations,
    skipSelectionUpdate,
    isFloatingCommentsReady,

    // Getters
    getConfig,
    documentsWithConverations,
    getGroupedComments,
    getFloatingComments,

    // Actions
    init,
    getComment,
    setActiveComment,
    getCommentLocation,
    hasOverlapId,
    getPendingComment,
    showAddComment,
    addComment,
    cancelComment,
    deleteComment,
    removePendingComment,
    processLoadedDocxComments,
    translateCommentsForExport,
    handleEditorLocationsUpdate,
    handleTrackedChangeUpdate,
  };
});
