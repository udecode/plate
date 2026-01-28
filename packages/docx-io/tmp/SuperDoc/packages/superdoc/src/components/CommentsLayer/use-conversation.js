import { ref, reactive } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import useSelection from '@superdoc/helpers/use-selection';
import useComment from '@superdoc/components/CommentsLayer/use-comment';

export default function useConversation(params) {
  const conversationId = params.conversationId || uuidv4();
  const documentId = params.documentId;
  const creatorEmail = params.creatorEmail;
  const creatorName = params.creatorName;
  const comments = ref(params.comments ? params.comments.map((c) => useComment(c)) : []);
  const selection = useSelection(params.selection);
  const suppressHighlight = ref(params.suppressHighlight);
  const suppressClick = ref(params.suppressClick || params.selection?.source === 'super-editor');
  const thread = ref(params.thread == null ? null : params.thread);
  const isTrackedChange = ref(params.isTrackedChange || false);
  const trackedChange = reactive(params.trackedChange || { insertion: null, deletion: null });

  /* Mark done (resolve) conversations */
  const markedDone = ref(params.markedDone || null);
  const markedDoneByEmail = ref(params.markedDoneByEmail || null);
  const markedDoneByName = ref(params.markedDoneByName || null);
  const group = ref(null);
  const isInternal = ref(params.isInternal || true);

  const conversationElement = ref(null);

  const isFocused = ref(params.isFocused || false);

  /**
   * Mark this conversation as done with UTC date
   *
   */
  const markDone = (email, name) => {
    markedDone.value = new Date().toISOString();
    markedDoneByEmail.value = email;
    markedDoneByName.value = name;
    group.value = null;
  };

  /**
   * Get the raw values of this comment
   *
   * @returns {Object} - The raw values of this comment
   */
  const getValues = () => {
    const values = {
      // Raw
      conversationId,
      documentId,
      creatorEmail,
      creatorName,

      comments: comments.value.map((c) => c.getValues()),
      selection: selection.getValues(),
      markedDone: markedDone.value,
      markedDoneByEmail: markedDoneByEmail.value,
      markedDoneByName: markedDoneByName.value,
      isFocused: isFocused.value,
    };
    return values;
  };

  const exposedData = {
    conversationId,
    thread,
    documentId,
    creatorEmail,
    creatorName,
    comments,
    selection,
    markedDone,
    markedDoneByEmail,
    markedDoneByName,
    isFocused,
    group,
    conversationElement,
    suppressHighlight,
    suppressClick,
    isInternal,
    isTrackedChange,
    trackedChange,
  };

  return {
    ...exposedData,

    // Actions
    getValues,
    markDone,
  };
}
