<script setup>
import { computed, toRefs, ref, getCurrentInstance, onMounted, nextTick } from 'vue';
import { NDropdown, NTooltip, NSelect } from 'naive-ui';
import { storeToRefs } from 'pinia';
import { useCommentsStore } from '@superdoc/stores/comments-store';
import { useSuperdocStore } from '@superdoc/stores/superdoc-store';
import { SuperInput } from '@harbour-enterprises/super-editor';
import { superdocIcons } from '@superdoc/icons.js';
import { isAllowed, PERMISSIONS } from '@superdoc/core/collaboration/permissions.js';
import useSelection from '@superdoc/helpers/use-selection';
import useComment from '@superdoc/components/CommentsLayer/use-comment';
import Avatar from '@superdoc/components/general/Avatar.vue';
import InternalDropdown from './InternalDropdown.vue';
import CommentHeader from './CommentHeader.vue';
import CommentInput from './CommentInput.vue';

const emit = defineEmits(['click-outside', 'ready', 'dialog-exit']);
const props = defineProps({
  comment: {
    type: Object,
    required: true,
  },
  autoFocus: {
    type: Boolean,
    default: false,
  },
  parent: {
    type: Object,
    required: false,
  },
});

const { proxy } = getCurrentInstance();
const role = proxy.$superdoc.config.role;
const commentCreator = props.comment.email;

const superdocStore = useSuperdocStore();
const commentsStore = useCommentsStore();

/* Comments store refs */
const { addComment, cancelComment, deleteComment, removePendingComment } = commentsStore;
const {
  suppressInternalExternal,
  getConfig,
  activeComment,
  floatingCommentsOffset,
  pendingComment,
  currentCommentText,
  isDebugging,
  editingCommentId,
  editorCommentPositions,
} = storeToRefs(commentsStore);

const { activeZoom } = storeToRefs(superdocStore);

const isInternal = ref(true);
const isFocused = ref(false);
const commentInput = ref(null);
const commentDialogElement = ref(null);

const isActiveComment = computed(() => activeComment.value === props.comment.commentId);
const showButtons = computed(() => {
  return (
    !getConfig.readOnly &&
    isActiveComment.value &&
    !props.comment.resolvedTime &&
    editingCommentId.value !== props.comment.commentId
  );
});

const showSeparator = computed(() => (index) => {
  if (showInputSection.value && index === comments.value.length - 1) return true;
  return comments.value.length > 1 && index !== comments.value.length - 1;
});

const showInputSection = computed(() => {
  return (
    !getConfig.readOnly &&
    isActiveComment.value &&
    !props.comment.resolvedTime &&
    editingCommentId.value !== props.comment.commentId
  );
});

const comments = computed(() => {
  const parentComment = props.comment;
  return commentsStore.commentsList
    .filter((c) => {
      const isThreadedComment = c.parentCommentId === parentComment.commentId;
      const isThisComment = c.commentId === props.comment.commentId;
      return isThreadedComment || isThisComment;
    })
    .sort((a, b) => a.commentId === props.comment.commentId && a.createdTime - b.createdTime);
});

const isInternalDropdownDisabled = computed(() => {
  if (props.comment.resolvedTime) return true;
  return getConfig.value.readOnly;
});

const isEditingThisComment = computed(() => (comment) => {
  return editingCommentId.value === comment.commentId;
});

const shouldShowInternalExternal = computed(() => {
  if (!proxy.$superdoc.config.isInternal) return false;
  return !suppressInternalExternal.value && !props.comment.trackedChange;
});

const hasTextContent = computed(() => {
  return currentCommentText.value && currentCommentText.value !== '<p></p>';
});

const setFocus = () => {
  if (props.comment.resolvedTime) return;
  const editor = proxy.$superdoc.activeEditor;
  activeComment.value = props.comment.commentId;
  props.comment.setActive(proxy.$superdoc);
  if (editor) {
    const cursorId = props.comment.importedId || props.comment.commentId;
    editor.commands?.setCursorById(cursorId);
  }
};

const handleClickOutside = (e) => {
  const excludedClasses = [
    'n-dropdown-option-body__label',
    'sd-editor-comment-highlight',
    'sd-editor-tracked-change-highlight',
    'track-insert',
    'track-insert-dec',
    'track-delete',
    'track-delete-dec',
    'track-format',
    'track-format-dec',
  ];

  if (excludedClasses.some((className) => e.target.classList.contains(className))) return;

  if (activeComment.value === props.comment.commentId) {
    floatingCommentsOffset.value = 0;
    emit('dialog-exit');
  }
  activeComment.value = null;
  commentsStore.setActiveComment(proxy.$superdoc, activeComment.value);
};

const handleAddComment = () => {
  const options = {
    documentId: props.comment.fileId,
    isInternal: pendingComment.value ? pendingComment.value.isInternal : isInternal.value,
    parentCommentId: pendingComment.value ? null : props.comment.commentId,
  };

  if (pendingComment.value) {
    const selection = pendingComment.value.selection.getValues();
    options.selection = selection;
  }

  const comment = commentsStore.getPendingComment(options);
  addComment({ superdoc: proxy.$superdoc, comment });
};

const handleReject = () => {
  if (props.comment.trackedChange) {
    props.comment.resolveComment({
      email: superdocStore.user.email,
      name: superdocStore.user.name,
      superdoc: proxy.$superdoc,
    });
    proxy.$superdoc.activeEditor.commands.rejectTrackedChangeById(props.comment.commentId);
  } else {
    commentsStore.deleteComment({ superdoc: proxy.$superdoc, commentId: props.comment.commentId });
  }

  nextTick(() => {
    commentsStore.lastUpdate = new Date();
    activeComment.value = null;
    commentsStore.setActiveComment(proxy.$superdoc, activeComment.value);
  });
};

const handleResolve = () => {
  if (props.comment.trackedChange) {
    proxy.$superdoc.activeEditor.commands.acceptTrackedChangeById(props.comment.commentId);
  }

  props.comment.resolveComment({
    email: superdocStore.user.email,
    name: superdocStore.user.name,
    superdoc: proxy.$superdoc,
  });

  nextTick(() => {
    commentsStore.lastUpdate = new Date();
    activeComment.value = null;
    commentsStore.setActiveComment(proxy.$superdoc, activeComment.value);
  });
};

const handleOverflowSelect = (value, comment) => {
  switch (value) {
    case 'edit':
      currentCommentText.value = comment.commentText;
      activeComment.value = comment.commentId;
      editingCommentId.value = comment.commentId;
      commentsStore.setActiveComment(proxy.$superdoc, activeComment.value);
      break;
    case 'delete':
      deleteComment({ superdoc: proxy.$superdoc, commentId: comment.commentId });
      break;
  }
};

const handleCommentUpdate = (comment) => {
  editingCommentId.value = null;
  comment.setText({ text: currentCommentText.value, superdoc: proxy.$superdoc });
  removePendingComment(proxy.$superdoc);
};

const getTrackedChangeType = (comment) => {
  const { trackedChangeType } = comment;
  switch (trackedChangeType) {
    case 'trackInsert':
      return 'Add';
    case 'trackDelete':
      return 'Delete';
    case 'both':
      return 'both';
    case 'trackFormat':
      return 'Format';
    default:
      return '';
  }
};

const handleInternalExternalSelect = (value) => {
  const isPendingComment = !!pendingComment.value;
  const isInternal = value.toLowerCase() === 'internal';

  if (!isPendingComment) props.comment.setIsInternal({ isInternal: isInternal, superdoc: proxy.$superdoc });
  else pendingComment.value.isInternal = isInternal;
};

const getSidebarCommentStyle = computed(() => {
  const style = {};

  const comment = props.comment;
  if (isActiveComment.value) {
    style.backgroundColor = 'white';
    style.zIndex = 50;
  }

  if (pendingComment.value && pendingComment.value.commentId === props.comment.commentId) {
    const top = Math.max(96, pendingComment.value.selection?.selectionBounds.top - 50);
    style.position = 'absolute';
    style.top = top + 'px';
  }

  return style;
});

const getProcessedDate = (timestamp) => {
  const isString = typeof timestamp === 'string';
  return isString ? new Date(timestamp).getTime() : timestamp;
};

const handleCancel = (comment) => {
  editingCommentId.value = null;
  cancelComment(proxy.$superdoc);
};

const usersFiltered = computed(() => {
  const users = proxy.$superdoc.users;

  if (props.comment.isInternal === true) {
    return users.filter((user) => user.access?.role === 'internal');
  }

  return users;
});

onMounted(() => {
  if (props.autoFocus) {
    nextTick(() => setFocus());
  }

  nextTick(() => {
    const commentId = props.comment.importedId !== undefined ? props.comment.importedId : props.comment.commentId;
    emit('ready', { commentId, elementRef: commentDialogElement });
  });
});
</script>

<template>
  <div
    class="comments-dialog"
    :class="{ 'is-active': isActiveComment, 'is-resolved': props.comment.resolvedTime }"
    v-click-outside="handleClickOutside"
    @click.stop.prevent="setFocus"
    :style="getSidebarCommentStyle"
    ref="commentDialogElement"
    role="dialog"
  >
    <div v-if="shouldShowInternalExternal" class="existing-internal-input">
      <InternalDropdown
        @click.stop.prevent
        class="internal-dropdown"
        :is-disabled="isInternalDropdownDisabled"
        :state="comment.isInternal ? 'internal' : 'external'"
        @select="handleInternalExternalSelect"
      />
    </div>

    <!-- Comments and their threaded (sub) comments are rendered here -->
    <div v-for="(comment, index) in comments" :key="index" class="conversation-item">
      <CommentHeader
        :config="getConfig"
        :timestamp="getProcessedDate(comment.createdTime)"
        :comment="comment"
        @resolve="handleResolve"
        @reject="handleReject"
        @overflow-select="handleOverflowSelect($event, comment)"
      />

      <div class="card-section comment-body" v-if="comment.trackedChange">
        <div class="tracked-change">
          <div class="tracked-change">
            <div v-if="comment.trackedChangeType === 'trackFormat'">
              <span class="change-type">Format: </span
              ><span class="tracked-change-text">{{ comment.trackedChangeText }}</span>
            </div>
            <div v-if="comment.trackedChangeText && comment.trackedChangeType !== 'trackFormat'">
              <span class="change-type">Added: </span
              ><span class="tracked-change-text">{{ comment.trackedChangeText }}</span>
            </div>
            <div v-if="comment.deletedText && comment.trackedChangeType !== 'trackFormat'">
              <span class="change-type">Deleted: </span
              ><span class="tracked-change-text">{{ comment.deletedText }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Show the comment text, unless we enter edit mode, then show an input and update buttons -->
      <div class="card-section comment-body" v-if="!comment.trackedChange">
        <div v-if="!isDebugging && !isEditingThisComment(comment)" class="comment" v-html="comment.commentText"></div>
        <div v-else-if="isDebugging && !isEditingThisComment(comment)" class="comment">
          {{
            editorCommentPositions[comment.importedId !== undefined ? comment.importedId : comment.commentId]?.bounds
          }}
        </div>
        <div v-else class="comment-editing">
          <CommentInput :users="usersFiltered" :config="getConfig" :include-header="false" :comment="comment" />
          <div class="comment-footer">
            <button class="sd-button" @click.stop.prevent="handleCancel(comment)">Cancel</button>
            <button class="sd-button primary" @click.stop.prevent="handleCommentUpdate(comment)">Update</button>
          </div>
        </div>
      </div>
      <div class="comment-separator" v-if="showSeparator(index)"></div>
    </div>

    <!-- This area is appended to a comment if adding a new sub comment -->
    <div v-if="showInputSection && !getConfig.readOnly">
      <CommentInput ref="commentInput" :users="usersFiltered" :config="getConfig" :comment="props.comment" />

      <div class="comment-footer" v-if="showButtons && !getConfig.readOnly">
        <button class="sd-button" @click.stop.prevent="cancelComment">Cancel</button>
        <button
          class="sd-button primary"
          @click.stop.prevent="handleAddComment"
          :disabled="!hasTextContent"
          :class="{ disabled: !hasTextContent }"
        >
          Comment
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.change-type {
  font-style: italic;
  font-weight: 600;
  font-size: 10px;
  color: #555;
}
.tracked-change {
  font-size: 12px;
}
.tracked-change-text {
  color: #111;
}
.comment-separator {
  background-color: #dbdbdb;
  height: 1px;
  width: 100%;
  margin: 10px 0;
  font-weight: 400;
}
.existing-internal-input {
  margin-bottom: 10px;
}
.initial-internal-dropdown {
  margin-top: 10px;
}
.comments-dialog {
  display: flex;
  flex-direction: column;
  padding: 10px 15px;
  border-radius: 12px;
  background-color: #f3f6fd;
  transition: background-color 250ms ease;
  -webkit-box-shadow: 0px 4px 12px 0px rgba(50, 50, 50, 0.15);
  -moz-box-shadow: 0px 4px 12px 0px rgba(50, 50, 50, 0.15);
  box-shadow: 0px 4px 12px 0px rgba(50, 50, 50, 0.15);
  z-index: 5;
  max-width: 300px;
  min-width: 200px;
  width: 100%;
}
.is-active {
  z-index: 10;
}
.input-section {
  margin-top: 10px;
}
.sd-button {
  font-size: 12px;
  margin-left: 5px;
}
.comment {
  font-size: 13px;
  margin: 10px 0;
}
.is-resolved {
  background-color: #f0f0f0;
}
.comment-footer {
  margin: 5px 0 5px;
  display: flex;
  justify-content: flex-end;
  width: 100%;
}
.internal-dropdown {
  display: inline-block;
}

.comment-editing {
  padding-bottom: 10px;
}
.comment-editing button {
  margin-left: 5px;
}
.tracked-change {
  margin: 0;
}
</style>
