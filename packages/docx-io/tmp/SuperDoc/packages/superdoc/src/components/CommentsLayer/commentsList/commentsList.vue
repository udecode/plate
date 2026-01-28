<script setup>
import { storeToRefs } from 'pinia';
import { computed, onBeforeUnmount, onMounted, reactive, getCurrentInstance } from 'vue';
import { useCommentsStore } from '@stores/comments-store';
import { useSuperdocStore } from '@stores/superdoc-store';
import CommentDialog from '../CommentDialog.vue';

const props = defineProps({
  showMainComments: {
    type: Boolean,
    default: true,
  },
  showResolvedComments: {
    type: Boolean,
    default: true,
  },
});

const superdocStore = useSuperdocStore();
const commentsStore = useCommentsStore();
const { COMMENT_EVENTS } = commentsStore;
const { commentsList, getGroupedComments, isCommentsListVisible } = storeToRefs(commentsStore);
const { proxy } = getCurrentInstance();

const shouldShowResolvedComments = computed(() => {
  return props.showResolvedComments && getGroupedComments.value?.resolvedComments?.length > 0;
});

onMounted(() => {
  isCommentsListVisible.value = true;
});

onBeforeUnmount(() => {
  isCommentsListVisible.value = false;
});
</script>

<template>
  <div class="comments-list">
    <div v-if="showMainComments">
      <div v-for="comment in getGroupedComments.parentComments" class="comment-item">
        <CommentDialog :comment="comment" />
      </div>
    </div>

    <div v-if="shouldShowResolvedComments">
      <div class="comment-title">Resolved</div>
      <div v-for="comment in getGroupedComments.resolvedComments" class="comment-item">
        <CommentDialog :comment="comment" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.comments-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-width: 400px;
}
.comment-item {
  margin-bottom: 10px;
}
.comment-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 5px;
  color: #333;
}
</style>
