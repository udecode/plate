<script setup>
import { storeToRefs } from 'pinia';
import { SuperInput } from '@harbour-enterprises/super-editor';
import { useSuperdocStore } from '@stores/superdoc-store';
import { useCommentsStore } from '@stores/comments-store';
import CommentHeader from './CommentHeader.vue';

const emit = defineEmits(['focus']);
const props = defineProps({
  users: {
    type: Array,
    required: false,
    default: () => [],
  },
  config: {
    type: Object,
    required: true,
  },
  isFocused: {
    type: Boolean,
    default: false,
  },
  includeHeader: {
    type: Boolean,
    default: true,
  },
  comment: {
    type: Object,
    required: false,
  },
});
const superdocStore = useSuperdocStore();
const commentsStore = useCommentsStore();
const { currentCommentText } = storeToRefs(commentsStore);

const handleFocusChange = (focused) => emit('focus', focused);
</script>

<template>
  <div class="input-section">
    <CommentHeader v-if="includeHeader" :config="config" :comment="comment" :is-pending-input="true" />

    <div class="comment-entry" :class="{ 'sd-input-active': isFocused }">
      <SuperInput
        class="superdoc-field"
        placeholder="Add a comment"
        v-model="currentCommentText"
        :users="users"
        @focus="handleFocusChange(true)"
        @blur="handleFocusChange(false)"
      />
    </div>
  </div>
</template>

<style scoped>
.comment-entry {
  box-sizing: border-box;
  border-radius: 8px;
  width: 100%;
  max-width: 100%;
  transition: all 250ms ease;
}
.internal-dropdown {
  display: inline-block;
}
</style>
