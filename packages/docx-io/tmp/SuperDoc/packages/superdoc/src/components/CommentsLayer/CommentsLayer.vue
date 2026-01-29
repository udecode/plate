<script setup>
import { getCurrentInstance, computed, ref, nextTick, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useCommentsStore } from '@superdoc/stores/comments-store';
import { useSuperdocStore } from '@superdoc/stores/superdoc-store';
import useComment from './use-comment';

const superdocStore = useSuperdocStore();
const commentsStore = useCommentsStore();
const { COMMENT_EVENTS } = commentsStore;
const { documentsWithConverations, activeComment, floatingCommentsOffset, commentsList } = storeToRefs(commentsStore);
const { documents, activeZoom } = storeToRefs(superdocStore);
const { proxy } = getCurrentInstance();

const emit = defineEmits(['highlight-click']);
const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
  parent: {
    type: Object,
    required: true,
  },
});

const addCommentEntry = (selection) => {
  const params = {
    creatorEmail: props.user.email,
    creatorName: props.user.name,
    documentId: selection.documentId,
    selection,
    isFocused: true,
  };

  const bounds = selection.selectionBounds;
  if (bounds.top > bounds.bottom) {
    const temp = bounds.top;
    bounds.top = bounds.bottom;
    bounds.bottom = temp;
  }

  if (bounds.left > bounds.right) {
    const temp = bounds.left;
    bounds.left = bounds.right;
    bounds.right = temp;
  }

  selection.selectionBounds = bounds;
  const matchedDocument = documents.value.find((c) => c.id === selection.documentId);
  const newConvo = useComment(params);
  activeComment.value = newConvo.commentId;

  matchedDocument.conversations.push(newConvo);
  proxy.$superdoc.emit('comments-update', { type: COMMENT_EVENTS.NEW, comment: newConvo.getValues() });
};

const getStyle = (conversation) => {
  const { selection, commentId } = conversation;
  const containerBounds = selection.getContainerLocation(props.parent);
  const placement = conversation.selection.selectionBounds;
  const top = (parseFloat(placement.top) + containerBounds.top) * activeZoom.value;

  const internalHighlightColor = '#078383';
  const externalHighlightColor = '#B1124B';

  let opacity = '33';
  activeComment.value === commentId ? (opacity = '66') : '33';
  let fillColor = conversation.isInternal ? internalHighlightColor : externalHighlightColor;
  fillColor += opacity;

  return {
    position: 'absolute',
    top: parseFloat(placement.top) + 'px',
    left: placement.left + 'px',
    width: placement.right - placement.left + 'px',
    height: placement.bottom - placement.top + 'px',
    backgroundColor: fillColor,
    pointerEvents: conversation.suppressClick ? 'none' : 'auto',
  };
};

const setFloatingCommentOffset = (conversation) => {
  floatingCommentsOffset.value = conversation.selection.selectionBounds.top;
};

const activateComment = (comment, e) => {
  comment.isFocused = true;
  activeComment.value = comment.commentId;
  comment.setActive(proxy.$superdoc);
  emit('highlight-click', comment);
};

const getCurrentComments = computed(() => {
  return commentsList.value
    .filter((c) => !c.parentCommentId)
    .filter((c) => c.selection && c.selection.selectionBounds?.top)
    .filter((c) => !c.resolvedTime)
    .filter((c) => c.selection?.source !== 'super-editor');
});

watch(activeComment, (newVal) => {
  if (!newVal) return;
  const element = document.querySelector(`[data-id="${newVal}"]`);
  element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

defineExpose({
  addCommentEntry,
  activateComment,
  setFloatingCommentOffset,
});
</script>

<template>
  <div class="comments-container" id="commentsContainer">
    <div class="comments-layer">
      <div
        v-for="conversation in getCurrentComments"
        class="sd-comment-anchor sd-highlight"
        @click.stop.prevent="activateComment(conversation, $event)"
        :data-id="conversation.commentId"
        :style="getStyle(conversation)"
      ></div>
    </div>
  </div>
</template>

<style scoped>
.comment-doc {
  position: relative;
}
.comments-layer {
  position: relative;
}
.sd-comment-anchor {
  position: absolute;
  cursor: pointer;
  z-index: 3;
  border-radius: 4px;
  transition: background-color 250ms ease;
}
.bypass {
  display: none;
}
.comments-container {
  /* pointer-events: none;  */
}
</style>
