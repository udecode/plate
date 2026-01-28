<script setup>
import { computed, nextTick, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useCommentsStore } from '@superdoc/stores/comments-store';
import CommentDialog from '@superdoc/components/CommentsLayer/CommentDialog.vue';

const commentsStore = useCommentsStore();
const props = defineProps({
  user: {
    type: Object,
    required: false,
  },
  data: {
    type: Object,
    required: true,
  },
  currentDocument: {
    type: Object,
    required: true,
  },
  parent: {
    type: Object,
    required: true,
  },
});

const groupContainer = ref(null);
const { getCommentLocation } = commentsStore;
const { activeComment } = storeToRefs(commentsStore);
const getSidebarCommentStyle = computed(() => {
  if (!props.data.length) return;
  const topOffset = 10;

  const activeCommentId = activeComment.value;
  let activeCommentObject = props.data.find((c) => c.conversationId === activeCommentId);
  if (!activeCommentObject) activeCommentObject = props.data[0];

  const location = getCommentLocation(activeCommentObject.selection, props.parent);
  if (!location) return {};

  const style = {
    top: location.top - topOffset + 'px',
  };

  if (props.data.isFocused) {
    style.backgroundColor = 'white';
    style.zIndex = 10;
  }

  return style;
});

const isExpanded = ref(false);
const getNumberOfConversations = computed(() => props.data.length);
const handleClick = () => {
  isExpanded.value = !isExpanded.value;
};
const handleClickOutside = (e) => {
  const dialogClasses = ['group-collapsed', 'number-bubble'];
  if (dialogClasses.some((c) => e.target.classList.contains(c))) return;
  isExpanded.value = false;
};

const isActiveGroup = computed(() => {
  return props.data.some((c) => c.conversationId === activeComment.value);
});

const getVisibleComments = computed(() => {
  if (!activeComment.value) return props.data;
  return props.data.filter((c) => c.conversationId === activeComment.value);
});
</script>

<template>
  <div class="comments-group" :style="getSidebarCommentStyle" @click="handleClick" v-if="!isExpanded && !isActiveGroup">
    <div class="group-collapsed">
      <div class="number-bubble">{{ getNumberOfConversations }}</div>
      <!-- TODO: icon -->
    </div>
  </div>

  <div
    class="comments-group expanded"
    v-else
    :style="getSidebarCommentStyle"
    v-click-outside="handleClickOutside"
    ref="groupContainer"
  >
    <template v-for="convo in getVisibleComments">
      <CommentDialog
        class="sd-comment-box"
        :data-id="convo.conversationId"
        :data="convo"
        :user="props.user"
        :current-document="currentDocument"
        :show-grouped="true"
      />
    </template>
  </div>
</template>

<style scoped>
.group-collapsed {
  position: relative;
  display: inline;
  width: 50px;
}
.comments-icon {
  font-size: 20px;
  width: 50px;
  height: 50px;
  font-weight: 400;
  background-color: #e2e9fb;
  color: #1355ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 250ms ease;
  user-select: none;
  pointer-events: none;
}
.number-bubble {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  position: absolute;
  right: -4px;
  top: -4px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}
.comments-group {
  cursor: pointer;
  position: absolute;
  display: flex;
  position: absolute;
  border-radius: 12px;
  transition: background-color 250ms ease;
  width: 51px;
}
.comments-icon:hover {
  background-color: #e2e9fb99;
}
.expanded {
  flex-direction: column;
  background-color: #ededed;
  z-index: 11;
  width: 300px;
}
</style>
