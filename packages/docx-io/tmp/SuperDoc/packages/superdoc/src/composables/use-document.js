import { ref, shallowRef } from 'vue';
import { useField } from './use-field';
import { documentTypes } from '@harbour-enterprises/common';
import useComment from '@superdoc/components/CommentsLayer/use-comment';

export default function useDocument(params, superdocConfig) {
  const id = params.id;
  const type = initDocumentType(params);

  const data = params.data;
  const config = superdocConfig;
  const state = params.state;
  const role = params.role;
  const html = params.html;
  const markdown = params.markdown;

  // Placement
  const container = ref(null);
  const pageContainers = ref([]);
  const isReady = ref(false);
  const rulers = ref(superdocConfig.rulers);

  // Collaboration
  const ydoc = shallowRef(params.ydoc);
  const provider = shallowRef(params.provider);
  const socket = shallowRef(params.socket);
  const isNewFile = ref(params.isNewFile);

  // For docx
  const editorRef = shallowRef(null);
  const setEditor = (ref) => (editorRef.value = ref);
  const getEditor = () => editorRef.value;

  /**
   * Initialize the mime type of the document
   * @param {Object} param0 The config object
   * @param {String} param0.type The type of document
   * @param {Object} param0.data The data object
   * @returns {String} The document type
   * @throws {Error} If the document type is not specified
   */
  function initDocumentType({ type, data }) {
    if (data?.type) return data.type;
    if (type) return type in documentTypes ? documentTypes[type] : null;

    throw new Error('Document type not specified for doc:', params);
  }

  // Comments
  const removeComments = () => {
    conversationsBackup.value = conversations.value;
    conversations.value = [];
  };

  const restoreComments = () => {
    conversations.value = conversationsBackup.value;
    console.debug('[superdoc] Restored comments:', conversations.value);
  };

  // Modules
  const rawFields = ref(params.fields || []);
  const fields = ref(params.fields?.map((f) => useField(f)) || []);
  const annotations = ref(params.annotations || []);
  const conversations = ref(initConversations());
  const conversationsBackup = ref(conversations.value);

  function initConversations() {
    if (!config.modules.comments) return [];
    return params.conversations?.map((c) => useComment(c)) || [];
  }

  const core = ref(null);

  const removeConversation = (conversationId) => {
    const index = conversations.value.findIndex((c) => c.conversationId === conversationId);
    if (index > -1) conversations.value.splice(index, 1);
  };

  return {
    id,
    data,
    html,
    markdown,
    type,
    config,
    state,
    role,

    core,
    ydoc,
    provider,
    socket,
    isNewFile,

    // Placement
    container,
    pageContainers,
    isReady,
    rulers,

    // Modules
    rawFields,
    fields,
    annotations,
    conversations,

    // Actions
    setEditor,
    getEditor,
    removeComments,
    restoreComments,
    removeConversation,
  };
}
