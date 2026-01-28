import { ref, reactive } from 'vue';
import { v4 as uuidv4 } from 'uuid';

import { syncCommentsToClients } from '@superdoc/core/collaboration/helpers.js';
import { comments_module_events } from '@harbour-enterprises/common';
import useSelection from '@superdoc/helpers/use-selection';

/**
 * Comment composable
 *
 * @param {Object} params The initial values of the comment
 * @returns {Object} The comment composable
 */
export default function useComment(params) {
  const uid = ref(params.uid);
  const commentId = params.commentId || uuidv4();
  const importedId = params.importedId;
  const parentCommentId = params.parentCommentId;
  const fileId = params.fileId;
  const fileType = params.fileType;
  const createdAtVersionNumber = params.createdAtVersionNumber;
  const isInternal = ref(params.isInternal !== undefined ? params.isInternal : true);

  const mentions = ref([]);

  const commentElement = ref(null);
  const isFocused = ref(params.isFocused || false);

  const creatorEmail = params.creatorEmail;
  const creatorName = params.creatorName;
  const createdTime = params.createdTime || Date.now();
  const importedAuthor = ref(params.importedAuthor || null);

  const commentText = ref(params.commentText || '');

  const selection = params.selection
    ? useSelection(params.selection)
    : useSelection({
        documentId: fileId,
        page: 1,
        selectionBounds: {},
      });

  const floatingPosition = params.selection?.selectionBounds
    ? { ...params.selection.selectionBounds }
    : { top: 0, left: 0, right: 0, bottom: 0 };

  // Tracked changes aka suggestions
  const trackedChange = ref(params.trackedChange);
  const trackedChangeType = ref(params.trackedChangeType || null);
  const trackedChangeText = ref(params.trackedChangeText || null);
  const deletedText = ref(params.deletedText || null);

  const resolvedTime = ref(params.resolvedTime || null);
  const resolvedByEmail = ref(params.resolvedByEmail || null);
  const resolvedByName = ref(params.resolvedByName || null);

  /**
   * Mark this conversation as resolved with UTC date
   *
   * @param {String} email The email of the user marking this conversation as done
   * @param {String} name The name of the user marking this conversation as done
   * @returns {void}
   */
  const resolveComment = ({ email, name, superdoc }) => {
    if (resolvedTime.value) return;
    resolvedTime.value = Date.now();
    resolvedByEmail.value = email;
    resolvedByName.value = name;

    if (trackedChange.value) {
      const emitData = { type: comments_module_events.RESOLVED, comment: getValues() };
      propagateUpdate(superdoc, emitData);
      superdoc.activeEditor?.commands?.resolveComment({ commentId, importedId });
      return;
    }

    const emitData = { type: comments_module_events.RESOLVED, comment: getValues() };
    propagateUpdate(superdoc, emitData);
    superdoc.activeEditor?.commands?.resolveComment({ commentId, importedId });
  };

  /**
   * Update the isInternal value of this comment
   *
   * @param {Object} param0
   * @param {Boolean} param0.isInternal The new isInternal value
   * @param {Object} param0.superdoc The SuperDoc instance
   * @returns {void}
   */
  const setIsInternal = ({ isInternal: newIsInternal, superdoc }) => {
    const previousValue = isInternal.value;
    if (previousValue === newIsInternal) return;

    // Update the isInternal value
    isInternal.value = newIsInternal;

    const emitData = {
      type: comments_module_events.UPDATE,
      changes: [{ key: 'isInternal', value: newIsInternal, previousValue }],
      comment: getValues(),
    };
    propagateUpdate(superdoc, emitData);

    const activeEditor = superdoc.activeEditor;
    if (!activeEditor) return;

    activeEditor.commands.setCommentInternal({ commentId, importedId, isInternal: newIsInternal });
  };

  /**
   * Set this comment as the active comment in the editor
   *
   * @param {Object} superdoc The SuperDoc instance
   * @returns {void}
   */
  const setActive = (superdoc) => {
    const { activeEditor } = superdoc;
    activeEditor?.commands.setActiveComment({ commentId, importedId });
  };

  /**
   *  Update the text value of this comment
   *
   * @param {Object} param0
   * @param {String} param0.text The new text value
   * @param {Object} param0.superdoc The SuperDoc instance
   * @returns {void}
   */
  const setText = ({ text, superdoc, suppressUpdate }) => {
    commentText.value = text;

    // Track mentions
    mentions.value = extractMentions(text);

    if (suppressUpdate) return;

    const emitData = {
      type: comments_module_events.UPDATE,
      changes: [{ key: 'text', value: text }],
      comment: getValues(),
    };
    propagateUpdate(superdoc, emitData);
  };

  /**
   * Extract mentions from comment contents
   *
   * @param {String} htmlString
   * @returns {Array[Object]} An array of unique mentions
   */
  const extractMentions = (htmlString) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');

    const mentionElements = [...doc.querySelectorAll('span[data-type="mention"]')];

    const uniqueMentions = [];
    mentionElements.forEach((span) => {
      const alreadyExists = uniqueMentions.some((m) => {
        const hasEmail = m.email === span.getAttribute('email');
        const hasName = m.name === span.getAttribute('name');
        return hasEmail && hasName;
      });

      if (!alreadyExists) {
        uniqueMentions.push({
          name: span.getAttribute('name'),
          email: span.getAttribute('email'),
        });
      }
    });

    return uniqueMentions;
  };

  /**
   * Update the selection bounds of this comment
   *
   * @param {Object} coords Object containing the selection bounds
   * @param {*} source Specifies the source of the selection bounds
   */
  const updatePosition = (coords, parentElement) => {
    selection.source = 'super-editor';
    const parentTop = parentElement?.getBoundingClientRect()?.top;

    const newCoords = {
      top: coords.top - parentTop,
      left: coords.left,
      right: coords.right,
      bottom: coords.bottom - parentTop,
    };
    selection.selectionBounds = newCoords;
  };

  const getCommentUser = () => {
    const user = importedAuthor.value
      ? { name: importedAuthor.value.name || '(Imported)', email: importedAuthor.value.email }
      : { name: creatorName, email: creatorEmail };

    return user;
  };

  /**
   * Emit updates to the end client, and sync with collaboration if necessary
   *
   * @param {Object} superdoc The SuperDoc instance
   * @param {Object} event The data to emit to the client
   * @returns {void}
   */
  const propagateUpdate = (superdoc, event) => {
    superdoc.emit('comments-update', event);
    syncCommentsToClients(superdoc, event);
  };

  /**
   * Get the raw values of this comment
   *
   * @returns {Object} - The raw values of this comment
   */
  const getValues = () => {
    return {
      uid: uid.value,
      commentId,
      importedId,
      parentCommentId,
      fileId,
      fileType,
      mentions: mentions.value.map((u) => {
        return { ...u, name: u.name ? u.name : u.email };
      }),
      createdAtVersionNumber,
      creatorEmail,
      creatorName,
      createdTime,
      importedAuthor: importedAuthor.value,
      isInternal: isInternal.value,
      commentText: commentText.value,
      selection: selection ? selection.getValues() : null,
      trackedChange: trackedChange.value,
      trackedChangeText: trackedChangeText.value,
      trackedChangeType: trackedChangeType.value,
      deletedText: deletedText.value,
      resolvedTime: resolvedTime.value,
      resolvedByEmail: resolvedByEmail.value,
      resolvedByName: resolvedByName.value,
    };
  };

  return reactive({
    uid,
    commentId,
    importedId,
    parentCommentId,
    fileId,
    fileType,
    mentions,
    commentElement,
    isFocused,
    creatorEmail,
    creatorName,
    createdTime,
    isInternal,
    commentText,
    selection,
    floatingPosition,
    trackedChange,
    deletedText,
    trackedChangeType,
    trackedChangeText,
    resolvedTime,
    resolvedByEmail,
    resolvedByName,
    importedAuthor,

    // Actions
    setText,
    getValues,
    resolveComment,
    setIsInternal,
    setActive,
    updatePosition,
    getCommentUser,
  });
}
