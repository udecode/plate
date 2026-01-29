import { createProvider } from '../collaboration/collaboration';
import useComment from '../../components/CommentsLayer/use-comment';

import { addYComment, updateYComment, deleteYComment } from './collaboration-comments';

/**
 * Initialize sync for comments if the module is enabled
 *
 * @param {Object} superdoc The SuperDoc instance
 * @returns {void}
 */
export const initCollaborationComments = (superdoc) => {
  if (!superdoc.config.modules.comments || !superdoc.provider) return;

  // If we have comments and collaboration, wait for sync and then let the store know when its ready
  const onSuperDocYdocSynced = () => {
    // Update the editor comment locations
    const parent = superdoc.commentsStore.commentsParentElement;
    const ids = superdoc.commentsStore.editorCommentIds;
    superdoc.commentsStore.handleEditorLocationsUpdate(parent, ids);
    superdoc.commentsStore.hasSyncedCollaborationComments = true;

    superdoc.provider.off('synced', onSuperDocYdocSynced);
  };

  // Listen for the synced event
  superdoc.provider.on('synced', onSuperDocYdocSynced);

  // Get the comments map from the Y.Doc
  const commentsArray = superdoc.ydoc.getArray('comments');

  // Observe changes to the comments map
  commentsArray.observe((event) => {
    // Ignore events if triggered by the current user
    const currentUser = superdoc.config.user;
    const { user = {} } = event.transaction.origin;

    if (currentUser.name === user.name && currentUser.email === user.email) return;

    if (__IS_DEBUG__) console.debug('[initCollaborationComments] commentsArray.observe', commentsArray.toJSON());

    // Update conversations
    const comments = commentsArray.toJSON();

    const seen = new Set();
    const filtered = [];
    comments.forEach((c) => {
      if (!seen.has(c.commentId)) {
        seen.add(c.commentId);
        filtered.push(c);
      }
    });
    superdoc.commentsStore.commentsList = filtered.map((c) => useComment(c));
  });
};

/**
 * Initialize SuperDoc general Y.Doc for high level collaboration
 * Assigns superdoc.ydoc and superdoc.provider in place
 *
 * @param {Object} superdoc The SuperDoc instance
 * @returns {void}
 */
export const initSuperdocYdoc = (superdoc) => {
  const { isInternal } = superdoc.config;
  const baseName = `${superdoc.config.superdocId}-superdoc`;
  if (!superdoc.config.superdocId) return;

  const documentId = isInternal ? baseName : `${baseName}-external`;
  const superdocCollaborationOptions = {
    config: superdoc.config.modules.collaboration,
    user: superdoc.config.user,
    documentId,
    socket: superdoc.config.socket,
    superdocInstance: superdoc,
  };

  const { provider: superdocProvider, ydoc: superdocYdoc } = createProvider(superdocCollaborationOptions);

  return { ydoc: superdocYdoc, provider: superdocProvider };
};

/**
 * Process SuperDoc's documents to make them collaborative by
 * adding provider, ydoc, awareness handler, and socket to each document.
 *
 * @param {Object} superdoc The SuperDoc instance
 * @returns {Array[Object]} The processed documents
 */
export const makeDocumentsCollaborative = (superdoc) => {
  const processedDocuments = [];
  superdoc.config.documents.forEach((doc) => {
    superdoc.config.user.color = superdoc.colors[0];
    const options = {
      config: superdoc.config.modules.collaboration,
      user: superdoc.config.user,
      documentId: doc.id,
      socket: superdoc.config.socket,
      superdocInstance: superdoc,
    };

    const { provider, ydoc } = createProvider(options);
    doc.provider = provider;
    doc.socket = superdoc.config.socket;
    doc.ydoc = ydoc;
    doc.role = superdoc.config.role;
    processedDocuments.push(doc);
  });
  return processedDocuments;
};

/**
 * Sync local comments with ydoc and other clients if in collaboration mode and comments module is enabled
 *
 * @param {Object} superdoc
 * @param {Object} event
 * @returns {void}
 */
export const syncCommentsToClients = (superdoc, event) => {
  if (!superdoc.isCollaborative || !superdoc.config.modules.comments) return;
  if (__IS_DEBUG__) console.debug('[comments] syncCommentsToClients', event);

  const yArray = superdoc.ydoc.getArray('comments');

  switch (event.type) {
    case 'add':
      addYComment(yArray, superdoc.ydoc, event);
      break;
    case 'update':
      updateYComment(yArray, superdoc.ydoc, event);
      break;
    case 'resolved':
      updateYComment(yArray, superdoc.ydoc, event);
      break;
    case 'deleted':
      deleteYComment(yArray, superdoc.ydoc, event);
      break;
  }
};
