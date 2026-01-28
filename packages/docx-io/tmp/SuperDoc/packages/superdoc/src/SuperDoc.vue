<script setup>
import '@harbour-enterprises/common/styles/common-styles.css';
import '@harbour-enterprises/super-editor/style.css';

import { superdocIcons } from './icons.js';
//prettier-ignore
import {
  getCurrentInstance,
  ref,
  onMounted,
  onBeforeUnmount,
  nextTick,
  computed,
  reactive,
  watch,
} from 'vue';
import { storeToRefs } from 'pinia';

import PdfViewer from './components/PdfViewer/PdfViewer.vue';
import CommentsLayer from './components/CommentsLayer/CommentsLayer.vue';
import CommentDialog from '@superdoc/components/CommentsLayer/CommentDialog.vue';
import FloatingComments from '@superdoc/components/CommentsLayer/FloatingComments.vue';
import HrbrFieldsLayer from '@superdoc/components/HrbrFieldsLayer/HrbrFieldsLayer.vue';
import useSelection from '@superdoc/helpers/use-selection';

import { useSuperdocStore } from '@superdoc/stores/superdoc-store';
import { useCommentsStore } from '@superdoc/stores/comments-store';

import { DOCX, PDF, HTML } from '@harbour-enterprises/common';
import { SuperEditor, AIWriter } from '@harbour-enterprises/super-editor';
import HtmlViewer from './components/HtmlViewer/HtmlViewer.vue';
import useComment from './components/CommentsLayer/use-comment';
import AiLayer from './components/AiLayer/AiLayer.vue';
import { useSelectedText } from './composables/use-selected-text';
import { useAi } from './composables/use-ai';
import { useHighContrastMode } from './composables/use-high-contrast-mode';
// Stores
const superdocStore = useSuperdocStore();
const commentsStore = useCommentsStore();
const emit = defineEmits(['selection-update']);

//prettier-ignore
const {
  documents,
  isReady,
  areDocumentsReady,
  selectionPosition,
  activeSelection,
  activeZoom,
} = storeToRefs(superdocStore);
const { handlePageReady, modules, user, getDocument } = superdocStore;

//prettier-ignore
const {
  getConfig,
  documentsWithConverations,
  commentsList,
  pendingComment,
  activeComment,
  skipSelectionUpdate,
  commentsByDocument,
  isCommentsListVisible,
  isFloatingCommentsReady,
  generalCommentIds,
  getFloatingComments,
  hasSyncedCollaborationComments,
  editorCommentPositions,
  hasInitializedLocations,
} = storeToRefs(commentsStore);
const { showAddComment, handleEditorLocationsUpdate, handleTrackedChangeUpdate } = commentsStore;
const { proxy } = getCurrentInstance();
commentsStore.proxy = proxy;

const { isHighContrastMode } = useHighContrastMode();

// Refs
const layers = ref(null);

// Comments layer
const commentsLayer = ref(null);
const toolsMenuPosition = reactive({ top: null, right: '-25px', zIndex: 101 });

// Create a ref to pass to the composable
const activeEditorRef = computed(() => proxy.$superdoc.activeEditor);

// Use the composable to get the selected text
const { selectedText } = useSelectedText(activeEditorRef);

// Use the AI composable
const {
  showAiLayer,
  showAiWriter,
  aiWriterPosition,
  aiLayer,
  initAiLayer,
  showAiWriterAtCursor,
  handleAiWriterClose,
  handleAiToolClick,
} = useAi({
  activeEditorRef,
});

// Hrbr Fields
const hrbrFieldsLayer = ref(null);

const handleDocumentReady = (documentId, container) => {
  const doc = getDocument(documentId);
  doc.isReady = true;
  doc.container = container;
  if (areDocumentsReady.value) {
    if (!proxy.$superdoc.config.collaboration) isReady.value = true;
  }

  isFloatingCommentsReady.value = true;
  hasInitializedLocations.value = true;
  proxy.$superdoc.broadcastPdfDocumentReady();
};

const handleToolClick = (tool) => {
  const toolOptions = {
    comments: () => showAddComment(proxy.$superdoc),
    ai: () => handleAiToolClick(),
  };

  if (tool in toolOptions) {
    toolOptions[tool](activeSelection.value, selectionPosition.value);
  }

  activeSelection.value = null;
  toolsMenuPosition.top = null;
};

const handleDocumentMouseDown = (e) => {
  if (pendingComment.value) return;
};

const handleHighlightClick = () => (toolsMenuPosition.top = null);
const cancelPendingComment = (e) => {
  if (e.target.classList.contains('n-dropdown-option-body__label')) return;
  commentsStore.removePendingComment(proxy.$superdoc);
};

const onCommentsLoaded = ({ editor, comments, replacedFile }) => {
  if (editor.options.shouldLoadComments || replacedFile) {
    nextTick(() => {
      commentsStore.processLoadedDocxComments({
        superdoc: proxy.$superdoc,
        editor,
        comments,
        documentId: editor.options.documentId,
      });
    });
  }
};

const onEditorBeforeCreate = ({ editor }) => {
  proxy.$superdoc?.broadcastEditorBeforeCreate(editor);
};

const onEditorCreate = ({ editor }) => {
  const { documentId } = editor.options;
  const doc = getDocument(documentId);
  doc.setEditor(editor);
  proxy.$superdoc.setActiveEditor(editor);
  proxy.$superdoc.broadcastEditorCreate(editor);
  // Initialize the ai layer
  initAiLayer(true);
};

const onEditorDestroy = () => {
  proxy.$superdoc.broadcastEditorDestroy();
};

const onEditorFocus = ({ editor }) => {
  proxy.$superdoc.setActiveEditor(editor);
};

const onEditorDocumentLocked = ({ editor, isLocked, lockedBy }) => {
  proxy.$superdoc.lockSuperdoc(isLocked, lockedBy);
};

const onEditorUpdate = ({ editor }) => {
  proxy.$superdoc.emit('editor-update', { editor });
};

const onEditorSelectionChange = ({ editor, transaction }) => {
  if (skipSelectionUpdate.value) {
    // When comment is added selection will be equal to comment text
    // Should skip calculations to keep text selection for comments correct
    skipSelectionUpdate.value = false;
    return;
  }

  const { documentId } = editor.options;
  const { $from, $to } = transaction.selection;
  if ($from.pos === $to.pos) updateSelection({ x: null, y: null, x2: null, y2: null, source: 'super-editor' });

  if (!layers.value) return;
  const { view } = editor;
  const fromCoords = view.coordsAtPos($from.pos);
  const toCoords = view.coordsAtPos($to.pos);
  const { pageMargins } = editor.getPageStyles();

  const layerBounds = layers.value.getBoundingClientRect();
  const HEADER_HEIGHT = 96;
  // Ensure the selection is not placed at the top of the page
  const top = Math.max(HEADER_HEIGHT, fromCoords.top - layerBounds.top);
  const bottom = toCoords.bottom - layerBounds.top;
  const selectionBounds = {
    top,
    left: fromCoords.left,
    right: toCoords.left,
    bottom,
  };

  const selection = useSelection({
    selectionBounds,
    page: 1,
    documentId,
    source: 'super-editor',
  });

  handleSelectionChange(selection);
};

function getSelectionBoundingBox() {
  const selection = window.getSelection();

  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    return range.getBoundingClientRect();
  }

  return null;
}

const onEditorCollaborationReady = ({ editor }) => {
  proxy.$superdoc.emit('collaboration-ready', { editor });

  nextTick(() => {
    isReady.value = true;

    const urlParams = new URLSearchParams(window.location.search);
    const commentId = urlParams.get('commentId');
    if (commentId) scrollToComment(commentId);
  });
};

const onEditorContentError = ({ error, editor }) => {
  proxy.$superdoc.emit('content-error', { error, editor });
};

const onEditorException = ({ error, editor }) => {
  proxy.$superdoc.emit('exception', { error, editor });
};

const onEditorListdefinitionsChange = (params) => {
  proxy.$superdoc.emit('list-definitions-change', params);
};

const editorOptions = (doc) => {
  const options = {
    pagination: proxy.$superdoc.config.pagination,
    documentId: doc.id,
    user: proxy.$superdoc.user,
    users: proxy.$superdoc.users,
    colors: proxy.$superdoc.colors,
    role: proxy.$superdoc.config.role,
    html: doc.html,
    markdown: doc.markdown,
    documentMode: proxy.$superdoc.config.documentMode,
    rulers: doc.rulers,
    isInternal: proxy.$superdoc.config.isInternal,
    annotations: proxy.$superdoc.config.annotations,
    isCommentsEnabled: proxy.$superdoc.config.modules?.comments,
    isAiEnabled: proxy.$superdoc.config.modules?.ai,
    onBeforeCreate: onEditorBeforeCreate,
    onCreate: onEditorCreate,
    onDestroy: onEditorDestroy,
    onFocus: onEditorFocus,
    onDocumentLocked: onEditorDocumentLocked,
    onUpdate: onEditorUpdate,
    onSelectionUpdate: onEditorSelectionChange,
    onCollaborationReady: onEditorCollaborationReady,
    onContentError: onEditorContentError,
    onException: onEditorException,
    onCommentsLoaded,
    onCommentsUpdate: onEditorCommentsUpdate,
    onCommentLocationsUpdate: onEditorCommentLocationsUpdate,
    onListDefinitionsChange: onEditorListdefinitionsChange,
    onTransaction: onEditorTransaction,
    ydoc: doc.ydoc,
    collaborationProvider: doc.provider || null,
    isNewFile: doc.isNewFile || false,
    handleImageUpload: proxy.$superdoc.config.handleImageUpload,
    telemetry: proxy.$superdoc.telemetry,
    externalExtensions: proxy.$superdoc.config.editorExtensions || [],
    suppressDefaultDocxStyles: proxy.$superdoc.config.suppressDefaultDocxStyles,
    disableContextMenu: proxy.$superdoc.config.disableContextMenu,
    jsonOverride: proxy.$superdoc.config.jsonOverride,
  };

  return options;
};

/**
 * Trigger a comment-positions location update
 * This is called when the editor has updated the comment locations
 *
 * @returns {void}
 */
const onEditorCommentLocationsUpdate = ({ allCommentIds: activeThreadId, allCommentPositions }) => {
  if (!proxy.$superdoc.config.modules?.comments) return;
  handleEditorLocationsUpdate(allCommentPositions, activeThreadId);
};

const onEditorCommentsUpdate = (params = {}) => {
  // Set the active comment in the store
  const { activeCommentId, type } = params;

  if (type === 'trackedChange') {
    handleTrackedChangeUpdate({ superdoc: proxy.$superdoc, params });
  }

  nextTick(() => {
    if (pendingComment.value) return;
    commentsStore.setActiveComment(proxy.$superdoc, activeCommentId);
  });

  // Bubble up the event to the user, if handled
  if (typeof proxy.$superdoc.config.onCommentsUpdate === 'function') {
    proxy.$superdoc.config.onCommentsUpdate(params);
  }
};

const onEditorTransaction = ({ editor, transaction, duration }) => {
  if (typeof proxy.$superdoc.config.onTransaction === 'function') {
    proxy.$superdoc.config.onTransaction({ editor, transaction, duration });
  }
};

const isCommentsEnabled = computed(() => 'comments' in modules);
const showCommentsSidebar = computed(() => {
  return (
    pendingComment.value ||
    (getFloatingComments.value?.length > 0 &&
      isReady.value &&
      layers.value &&
      isCommentsEnabled.value &&
      !isCommentsListVisible.value)
  );
});

const showToolsFloatingMenu = computed(() => {
  if (!isCommentsEnabled.value) return false;
  return toolsMenuPosition.top && !getConfig.value?.readOnly;
});
const showActiveSelection = computed(() => {
  if (!isCommentsEnabled.value) return false;
  !getConfig?.readOnly && selectionPosition.value;
});

watch(showCommentsSidebar, (value) => {
  proxy.$superdoc.broadcastSidebarToggle(value);
});

/**
 * Scroll the page to a given commentId
 *
 * @param {String} commentId The commentId to scroll to
 */
const scrollToComment = (commentId) => {
  if (!proxy.$superdoc.config?.modules?.comments) return;

  const element = document.querySelector(`[data-thread-id=${commentId}]`);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    commentsStore.setActiveComment(proxy.$superdoc, commentId);
  }
};

onMounted(() => {
  if (isCommentsEnabled.value && !modules.comments.readOnly) {
    document.addEventListener('mousedown', handleDocumentMouseDown);
  }
});

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleDocumentMouseDown);
});

const selectionLayer = ref(null);
const isDragging = ref(false);

const getSelectionPosition = computed(() => {
  if (!selectionPosition.value || selectionPosition.value.source === 'super-editor') {
    return { x: null, y: null };
  }

  const top = selectionPosition.value.top;
  const left = selectionPosition.value.left;
  const right = selectionPosition.value.right;
  const bottom = selectionPosition.value.bottom;
  const style = {
    zIndex: 500,
    borderRadius: '4px',
    top: top + 'px',
    left: left + 'px',
    height: Math.abs(top - bottom) + 'px',
    width: Math.abs(left - right) + 'px',
  };
  return style;
});

const handleSelectionChange = (selection) => {
  if (!selection.selectionBounds || !isCommentsEnabled.value) return;

  resetSelection();

  const isMobileView = window.matchMedia('(max-width: 768px)').matches;

  updateSelection({
    startX: selection.selectionBounds.left,
    startY: selection.selectionBounds.top,
    x: selection.selectionBounds.right,
    y: selection.selectionBounds.bottom,
    source: selection.source,
  });

  if (!selectionPosition.value) return;
  const selectionIsWideEnough = Math.abs(selectionPosition.value.left - selectionPosition.value.right) > 5;
  const selectionIsTallEnough = Math.abs(selectionPosition.value.top - selectionPosition.value.bottom) > 5;
  if (!selectionIsWideEnough || !selectionIsTallEnough) {
    selectionLayer.value.style.pointerEvents = 'none';
    resetSelection();
    return;
  }

  activeSelection.value = selection;

  // Place the tools menu at the level of the selection
  let top = selection.selectionBounds.top;
  toolsMenuPosition.top = top + 'px';
  toolsMenuPosition.right = isMobileView ? '0' : '-25px';
};

const resetSelection = () => {
  selectionPosition.value = null;
};

const updateSelection = ({ startX, startY, x, y, source }) => {
  const hasStartCoords = startX || startY;
  const hasEndCoords = x || y;

  if (!hasStartCoords && !hasEndCoords) {
    return (selectionPosition.value = null);
  }

  // Initialize the selection position
  if (!selectionPosition.value) {
    if (startY <= 0 || startX <= 0) return;
    selectionPosition.value = {
      top: startY,
      left: startX,
      right: startX,
      bottom: startY,
      startX,
      startY,
      source,
    };
  }

  if (startX) selectionPosition.value.startX = startX;
  if (startY) selectionPosition.value.startY = startY;

  // Reverse the selection if the user drags up or left
  const selectionTop = selectionPosition.value.startY;
  if (y < selectionTop) {
    selectionPosition.value.top = y;
  } else {
    selectionPosition.value.bottom = y;
  }

  const selectionLeft = selectionPosition.value.startX;
  if (x < selectionLeft) {
    selectionPosition.value.left = x;
  } else {
    selectionPosition.value.right = x;
  }
};

const handleSelectionStart = (e) => {
  resetSelection();
  selectionLayer.value.style.pointerEvents = 'auto';

  nextTick(() => {
    isDragging.value = true;
    const y = e.offsetY / (activeZoom.value / 100);
    const x = e.offsetX / (activeZoom.value / 100);
    updateSelection({ startX: x, startY: y });
    selectionLayer.value.addEventListener('mousemove', handleDragMove);
  });
};

const handleDragMove = (e) => {
  if (!isDragging.value) return;
  const y = e.offsetY / (activeZoom.value / 100);
  const x = e.offsetX / (activeZoom.value / 100);
  updateSelection({ x, y });
};

const handleDragEnd = (e) => {
  if (!isDragging.value) return;
  selectionLayer.value.removeEventListener('mousemove', handleDragMove);

  if (!selectionPosition.value) return;
  const selection = useSelection({
    selectionBounds: {
      top: selectionPosition.value.top,
      left: selectionPosition.value.left,
      right: selectionPosition.value.right,
      bottom: selectionPosition.value.bottom,
    },
    documentId: documents.value[0].id,
  });

  handleSelectionChange(selection);
  selectionLayer.value.style.pointerEvents = 'none';
};

const shouldShowSelection = computed(() => {
  const config = proxy.$superdoc.config.modules?.comments;
  return !config.readOnly;
});

const handleSuperEditorPageMarginsChange = (doc, params) => {
  doc.documentMarginsLastChange = params.pageMargins;
};

const handlePdfClick = (e) => {
  if (!isCommentsEnabled.value) return;
  resetSelection();
  isDragging.value = true;
  handleSelectionStart(e);
};

watch(getFloatingComments, () => {
  hasInitializedLocations.value = false;
  nextTick(() => {
    hasInitializedLocations.value = true;
  });
});
</script>

<template>
  <div class="superdoc" :class="{ 'superdoc--with-sidebar': showCommentsSidebar, 'high-contrast': isHighContrastMode }">
    <div class="superdoc__layers layers" ref="layers" role="group">
      <!-- Floating tools menu (shows up when user has text selection)-->
      <div v-if="showToolsFloatingMenu" class="superdoc__tools tools" :style="toolsMenuPosition">
        <div class="tools-item" data-id="is-tool" @mousedown.stop.prevent="handleToolClick('comments')">
          <div class="superdoc__tools-icon" v-html="superdocIcons.comment"></div>
        </div>
        <!-- AI tool button -->
        <div
          v-if="proxy.$superdoc.config.modules.ai"
          class="tools-item"
          data-id="is-tool"
          @mousedown.stop.prevent="handleToolClick('ai')"
        >
          <div class="superdoc__tools-icon ai-tool"></div>
        </div>
      </div>

      <div class="superdoc__document document">
        <div
          v-if="isCommentsEnabled"
          class="superdoc__selection-layer selection-layer"
          @mousedown="handleSelectionStart"
          @mouseup="handleDragEnd"
          ref="selectionLayer"
        >
          <div
            :style="getSelectionPosition"
            class="superdoc__temp-selection temp-selection sd-highlight sd-initial-highlight"
            v-if="selectionPosition && shouldShowSelection"
          ></div>
        </div>

        <!-- Fields layer -->
        <HrbrFieldsLayer
          v-if="'hrbr-fields' in modules && layers"
          :fields="modules['hrbr-fields']"
          class="superdoc__comments-layer comments-layer"
          style="z-index: 2"
          ref="hrbrFieldsLayer"
        />

        <!-- On-document comments layer -->
        <CommentsLayer
          v-if="layers"
          class="superdoc__comments-layer comments-layer"
          style="z-index: 3"
          ref="commentsLayer"
          :parent="layers"
          :user="user"
          @highlight-click="handleHighlightClick"
        />

        <!-- AI Layer for temporary highlights -->
        <AiLayer
          v-if="showAiLayer"
          class="ai-layer"
          style="z-index: 4"
          ref="aiLayer"
          :editor="proxy.$superdoc.activeEditor"
        />

        <div class="superdoc__sub-document sub-document" v-for="doc in documents" :key="doc.id">
          <!-- PDF renderer -->

          <PdfViewer
            v-if="doc.type === PDF"
            :document-data="doc"
            @selection-change="handleSelectionChange"
            @ready="handleDocumentReady"
            @page-loaded="handlePageReady"
            @bypass-selection="handlePdfClick"
          />

          <SuperEditor
            v-if="doc.type === DOCX"
            :file-source="doc.data"
            :state="doc.state"
            :document-id="doc.id"
            :options="editorOptions(doc)"
            @pageMarginsChange="handleSuperEditorPageMarginsChange(doc, $event)"
          />

          <!-- omitting field props -->
          <HtmlViewer
            v-if="doc.type === HTML"
            @ready="(id) => handleDocumentReady(id, null)"
            @selection-change="handleSelectionChange"
            :file-source="doc.data"
            :document-id="doc.id"
          />
        </div>
      </div>
    </div>

    <div class="superdoc__right-sidebar right-sidebar" v-if="showCommentsSidebar">
      <CommentDialog
        v-if="pendingComment"
        :comment="pendingComment"
        :auto-focus="true"
        :is-floating="true"
        v-click-outside="cancelPendingComment"
      />

      <div class="floating-comments">
        <FloatingComments
          v-if="hasInitializedLocations && getFloatingComments.length > 0"
          v-for="doc in documentsWithConverations"
          :parent="layers"
          :current-document="doc"
        />
      </div>
    </div>

    <!-- AI Writer at cursor position -->
    <div class="ai-writer-container" v-if="showAiWriter" :style="aiWriterPosition">
      <AIWriter
        :selected-text="selectedText"
        :handle-close="handleAiWriterClose"
        :editor="proxy.$superdoc.activeEditor"
        :api-key="proxy.$superdoc.toolbar?.config?.aiApiKey"
        :endpoint="proxy.$superdoc.config?.modules?.ai?.endpoint"
      />
    </div>
  </div>
</template>

<style>
.superdoc {
  &.high-contrast {
    border-color: #000;

    .super-editor {
      border-color: #000;

      &:focus-within {
        border-color: blue;
      }
    }
  }

  .super-editor {
    border-radius: 8px;
    border: 1px solid #d3d3d3;
    box-shadow: 0 0 5px hsla(0, 0%, 0%, 0.05);
  }
}
</style>

<style scoped>
.superdoc {
  display: flex;
}

.right-sidebar {
  min-width: 320px;
}

.floating-comments {
  min-width: 300px;
  width: 300px;
}

.superdoc__layers {
  height: 100%;
  position: relative;
  box-sizing: border-box;
}

.superdoc__document {
  width: 100%;
  position: relative;
}

.superdoc__sub-document {
  width: 100%;
  position: relative;
}

.superdoc__selection-layer {
  position: absolute;
  min-width: 100%;
  min-height: 100%;
  z-index: 10;
  pointer-events: none;
}

.superdoc__temp-selection {
  position: absolute;
}

.superdoc__comments-layer {
  /* position: absolute; */
  top: 0;
  height: 100%;
  position: relative;
}

.superdoc__right-sidebar {
  width: 320px;
  min-width: 320px;
  padding: 0 10px;
  min-height: 100%;
  position: relative;
  z-index: 2;
}

/* Tools styles */
.tools {
  position: absolute;
  z-index: 3;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tools .tool-icon {
  font-size: 20px;
  border-radius: 12px;
  border: none;
  outline: none;
  background-color: #dbdbdb;
  cursor: pointer;
}

.tools-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  background-color: rgba(219, 219, 219, 0.6);
  border-radius: 12px;
  cursor: pointer;
}

.tools-item i {
  cursor: pointer;
}

.superdoc__tools-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

/* Tools styles - end */

/* .docx {
  border: 1px solid #dfdfdf;
  pointer-events: auto;
} */

/* 834px is iPad screen size in portrait orientation */
@media (max-width: 834px) {
  .superdoc .superdoc__layers {
    margin: 0;
    border: 0 !important;
    box-shadow: none;
  }

  .superdoc__sub-document {
    max-width: 100%;
  }

  .superdoc__right-sidebar {
    padding: 10px;
    width: 55px;
    position: relative;
  }
}

/* AI Writer styles */
.ai-writer-container {
  position: fixed;
  z-index: 1000;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
}

/* Remove the AI Sidebar styles */
/* .ai-sidebar-container {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 50;
} */

/* Tools styles */
.tools {
  position: absolute;
  z-index: 3;
  display: flex;
  gap: 6px;
}

.tools .tool-icon {
  font-size: 20px;
  border-radius: 12px;
  border: none;
  outline: none;
  background-color: #dbdbdb;
  cursor: pointer;
}

.tools-item {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 50px;
  height: 50px;
  background-color: rgba(219, 219, 219, 0.6);
  border-radius: 12px;
  cursor: pointer;
}

.tools-item i {
  cursor: pointer;
}

.superdoc__tools-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.ai-tool > svg {
  fill: transparent;
}

.ai-tool::before {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;

  z-index: 1;
  background: linear-gradient(
    270deg,
    rgba(218, 215, 118, 0.5) -20%,
    rgba(191, 100, 100, 1) 30%,
    rgba(77, 82, 217, 1) 60%,
    rgb(255, 219, 102) 150%
  );
  -webkit-mask: url("data:image/svg+xml;charset=utf-8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'><path d='M224 96l16-32 32-16-32-16-16-32-16 32-32 16 32 16 16 32zM80 160l26.7-53.3L160 80l-53.3-26.7L80 0 53.3 53.3 0 80l53.3 26.7L80 160zm352 128l-26.7 53.3L352 368l53.3 26.7L432 448l26.7-53.3L512 368l-53.3-26.7L432 288zm70.6-193.8L417.8 9.4C411.5 3.1 403.3 0 395.2 0c-8.2 0-16.4 3.1-22.6 9.4L9.4 372.5c-12.5 12.5-12.5 32.8 0 45.3l84.9 84.9c6.3 6.3 14.4 9.4 22.6 9.4 8.2 0 16.4-3.1 22.6-9.4l363.1-363.2c12.5-12.5 12.5-32.8 0-45.2zM359.5 203.5l-50.9-50.9 86.6-86.6 50.9 50.9-86.6 86.6z'/></svg>")
    center / contain no-repeat;
  mask: url("data:image/svg+xml;charset=utf-8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'><path d='M224 96l16-32 32-16-32-16-16-32-16 32-32 16 32 16 16 32zM80 160l26.7-53.3L160 80l-53.3-26.7L80 0 53.3 53.3 0 80l53.3 26.7L80 160zm352 128l-26.7 53.3L352 368l53.3 26.7L432 448l26.7-53.3L512 368l-53.3-26.7L432 288zm70.6-193.8L417.8 9.4C411.5 3.1 403.3 0 395.2 0c-8.2 0-16.4 3.1-22.6 9.4L9.4 372.5c-12.5 12.5-12.5 32.8 0 45.3l84.9 84.9c6.3 6.3 14.4 9.4 22.6 9.4 8.2 0 16.4-3.1 22.6-9.4l363.1-363.2c12.5-12.5 12.5-32.8 0-45.2zM359.5 203.5l-50.9-50.9 86.6-86.6 50.9 50.9-86.6 86.6z'/></svg>")
    center / contain no-repeat;
  filter: brightness(1.2);
  transition: filter 0.2s ease;
}

.ai-tool:hover::before {
  filter: brightness(1.3);
}

/* Tools styles - end */
</style>
