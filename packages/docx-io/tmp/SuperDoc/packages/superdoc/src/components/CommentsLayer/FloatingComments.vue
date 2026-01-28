<script setup>
import { storeToRefs } from 'pinia';
import { ref, computed, watchEffect, nextTick, watch, onMounted } from 'vue';
import { useCommentsStore } from '@superdoc/stores/comments-store';
import { useSuperdocStore } from '@superdoc/stores/superdoc-store';
import CommentDialog from '@superdoc/components/CommentsLayer/CommentDialog.vue';

const props = defineProps({
  currentDocument: {
    type: Object,
    required: true,
  },
  parent: {
    type: Object,
    required: true,
  },
});

const superdocStore = useSuperdocStore();
const commentsStore = useCommentsStore();

const { getFloatingComments, hasInitializedLocations, activeComment, commentsList, editorCommentPositions } =
  storeToRefs(commentsStore);

const floatingCommentsContainer = ref(null);
const renderedSizes = ref([]);
const firstGroupRendered = ref(false);
const verticalOffset = ref(0);
const commentsRenderKey = ref(0);

const getCommentPosition = computed(() => (comment) => {
  if (!floatingCommentsContainer.value) return { top: '0px' };

  const editorBounds = floatingCommentsContainer.value.getBoundingClientRect();
  const scrollY = window.scrollY;
  if (typeof comment.top !== 'number' || isNaN(comment.top)) {
    return { display: 'none' };
  }
  return { top: `${comment.top}px` };
});

const findScrollParent = (element) => {
  if (!element) return window;

  let parent = element.parentNode;
  while (parent && parent !== document) {
    const style = getComputedStyle(parent);
    if (/(auto|scroll|overlay)/.test(style.overflow + style.overflowY + style.overflowX)) {
      return parent;
    }
    parent = parent.parentNode;
  }
  return window;
};

const handleDialog = (dialog) => {
  if (!dialog) return;
  const { elementRef, commentId } = dialog;
  if (!elementRef) return;

  nextTick(() => {
    const id = commentId;
    if (renderedSizes.value.some((item) => item.id == id)) return;

    const editorBounds = props.parent.getBoundingClientRect();

    const comment = getFloatingComments.value.find((c) => c.commentId === id || c.importedId == id);
    const positionKey = id || comment?.importedId;
    let position = editorCommentPositions.value[positionKey]?.bounds || {};

    // If this is a PDF, set the position based on selection bounds
    if (props.currentDocument.type === 'application/pdf') {
      Object.entries(comment.selection?.selectionBounds).forEach(([key, value]) => {
        position[key] = Number(value);
      });
      position.top += editorBounds.top;
    }

    if (!position) return;

    const scrollParent = findScrollParent(props.parent);
    const scrollY = scrollParent === window ? window.scrollY : scrollParent.scrollTop;

    const bounds = elementRef.value?.getBoundingClientRect();
    const placement = {
      id,
      top: position.top - editorBounds.top,
      height: bounds.height,
      commentRef: comment,
      elementRef,
    };
    renderedSizes.value.push(placement);
  });
};

const processLocations = async () => {
  let currentBottom = 0;
  renderedSizes.value
    .sort((a, b) => a.top - b.top)
    .forEach((comment) => {
      if (comment.top <= currentBottom + 15) {
        comment.top = currentBottom + 15;
      }
      currentBottom = comment.top + comment.height;
    });

  await nextTick();
  firstGroupRendered.value = true;
};

// Ensures floating comments update after all are measured
watchEffect(() => {
  if (renderedSizes.value.length === getFloatingComments.value.length) {
    nextTick(processLocations);
  }
});

const resetLayout = async () => {
  firstGroupRendered.value = false;
  renderedSizes.value = [];
  commentsRenderKey.value++;
  verticalOffset.value = 0;
};

watch(activeComment, (newVal, oldVal) => {
  nextTick(() => {
    if (!activeComment.value) return (verticalOffset.value = 0);

    const comment = commentsStore.getComment(activeComment.value);
    if (!comment) return (verticalOffset.value = 0);
    const commentKey = comment.commentId || comment.importedId;
    const renderedItem = renderedSizes.value.find((item) => item.id === commentKey);
    if (!renderedItem) return (verticalOffset.value = 0);

    const selectionTop = comment.selection.selectionBounds.top;
    const renderedTop = renderedItem.top;

    const editorBounds = floatingCommentsContainer.value.getBoundingClientRect();
    verticalOffset.value = selectionTop - renderedTop;

    setTimeout(() => {
      renderedItem.elementRef.value?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 200);
  });
});
</script>

<template>
  <div class="section-wrapper" ref="floatingCommentsContainer">
    <!-- First group: Detecting heights -->
    <div class="sidebar-container calculation-container">
      <div v-for="comment in getFloatingComments" :key="comment.commentId || comment.importedId">
        <div :id="comment.commentId || comment.importedId" class="measure-comment">
          <CommentDialog
            @ready="handleDialog"
            :key="comment.commentId + commentsRenderKey"
            class="floating-comment"
            :parent="parent"
            :comment="comment"
          />
        </div>
      </div>
    </div>

    <!-- Second group: Render only after first group is processed -->
    <div v-if="firstGroupRendered" class="sidebar-container" :style="{ top: verticalOffset + 'px' }">
      <div
        v-for="comment in renderedSizes"
        :key="comment.id"
        :style="getCommentPosition(comment)"
        class="floating-comment"
      >
        <CommentDialog
          :key="comment.id + commentsRenderKey"
          class="floating-comment"
          :parent="parent"
          :comment="comment.commentRef"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.measure-comment {
  box-sizing: border-box;
  height: auto;
}
.floating-comment {
  position: absolute;
  display: block;
}
.sidebar-container {
  position: absolute;
  width: 300px;
  min-height: 300px;
}
.section-wrapper {
  position: relative;
  min-height: 100%;
  width: 300px;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
}
.floating-comment {
  position: absolute;
  min-width: 300px;
}
.calculation-container {
  visibility: hidden;
  position: fixed;
  left: -9999px;
  top: -9999px;
}
</style>
