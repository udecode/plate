<script setup>
import 'tippy.js/dist/tippy.css';
import { NSkeleton } from 'naive-ui';
import { ref, onMounted, onBeforeUnmount, shallowRef, reactive, markRaw } from 'vue';
import { Editor } from '@/index.js';
import { getStarterExtensions } from '@extensions/index.js';
import SlashMenu from './slash-menu/SlashMenu.vue';
import { adjustPaginationBreaks } from './pagination-helpers.js';
import { onMarginClickCursorChange } from './cursor-helpers.js';
import Ruler from './rulers/Ruler.vue';
import GenericPopover from './popovers/GenericPopover.vue';
import LinkInput from './toolbar/LinkInput.vue';
import { checkNodeSpecificClicks } from './cursor-helpers.js';
import { getFileObject } from '@harbour-enterprises/common';
import BlankDOCX from '@harbour-enterprises/common/data/blank.docx?url';

const emit = defineEmits(['editor-ready', 'editor-click', 'editor-keydown', 'comments-loaded', 'selection-update']);

const DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const props = defineProps({
  documentId: {
    type: String,
    required: false,
  },

  fileSource: {
    type: File,
    required: false,
  },

  state: {
    type: Object,
    required: false,
    default: () => null,
  },

  options: {
    type: Object,
    required: false,
    default: () => ({}),
  },
});

const editorReady = ref(false);
const editor = shallowRef(null);

const editorWrapper = ref(null);
const editorElem = ref(null);

const fileSource = ref(null);

/**
 * Generic popover controls including state, open and close functions
 */
const popoverControls = reactive({
  visible: false,
  position: { left: '0px', top: '0px' },
  component: null,
  props: {},
});

const closePopover = () => {
  popoverControls.visible = false;
  popoverControls.component = null;
  popoverControls.props = {};
  editor.value.view.focus();
};

const openPopover = (component, props, position) => {
  popoverControls.component = component;
  popoverControls.props = props;
  popoverControls.position = position;
  popoverControls.visible = true;
};

let dataPollTimeout;

const stopPolling = () => {
  clearTimeout(dataPollTimeout);
};

const pollForMetaMapData = (ydoc, retries = 10, interval = 500) => {
  const metaMap = ydoc.getMap('meta');

  const checkData = () => {
    const docx = metaMap.get('docx');
    if (docx) {
      stopPolling();
      initEditor({ content: docx });
    } else if (retries > 0) {
      console.debug(`Waiting for 'docx' data... retries left: ${retries}`);
      dataPollTimeout = setTimeout(checkData, interval); // Retry after the interval
      retries--;
    } else {
      console.warn('Failed to load docx data from meta map.');
    }
  };

  checkData();
};

const loadNewFileData = async () => {
  fileSource.value = props.fileSource;
  if (!fileSource.value || fileSource.value.type !== DOCX) {
    fileSource.value = await getFileObject(BlankDOCX, 'blank.docx', DOCX);
  }

  try {
    const [docx, media, mediaFiles, fonts] = await Editor.loadXmlData(fileSource.value);
    return { content: docx, media, mediaFiles, fonts };
  } catch (err) {
    console.debug('Error loading new file data:', err);
  }
};

const initializeData = async () => {
  // If we have the file, initialize immediately from file
  if (props.fileSource) {
    const fileData = await loadNewFileData();
    return initEditor(fileData);
  }

  // If we are in collaboration mode, wait for the docx data to be available
  else if (props.options.ydoc && props.options.collaborationProvider) {
    delete props.options.content;
    const ydoc = props.options.ydoc;
    const provider = props.options.collaborationProvider;
    const handleSynced = () => {
      pollForMetaMapData(ydoc);
      // Remove the synced event listener.
      // Avoids re-initializing the editor in case the connection is lost and reconnected
      provider.off('synced', handleSynced);
    };
    provider.on('synced', handleSynced);
  }
};

const getExtensions = () => {
  const extensions = getStarterExtensions();
  if (!props.options.pagination) {
    return extensions.filter((ext) => ext.name !== 'pagination');
  }
  return extensions;
};

const initEditor = async ({ content, media = {}, mediaFiles = {}, fonts = {} } = {}) => {
  editor.value = new Editor({
    mode: 'docx',
    element: editorElem.value,
    fileSource: fileSource.value,
    extensions: getExtensions(),
    externalExtensions: props.options.externalExtensions,
    documentId: props.documentId,
    content,
    media,
    mediaFiles,
    fonts,
    ...props.options,
  });

  editor.value.on('paginationUpdate', () => {
    adjustPaginationBreaks(editorElem, editor);
  });

  editor.value.on('collaborationReady', () => {
    setTimeout(() => {
      editorReady.value = true;
    }, 150);
  });
};

const handleSuperEditorKeydown = (event) => {
  // cmd/ctrl + opt/alt + shift + M
  if ((event.metaKey || event.ctrlKey) && event.altKey && event.shiftKey) {
    if (event.code === 'KeyM') {
      const toolbar = document.querySelector('.superdoc-toolbar');
      if (toolbar) {
        toolbar.setAttribute('tabindex', '0');
        toolbar.focus();
      }
    }
  }

  // cmd/ctrl + K → Open LinkInput popover
  if (
    (event.metaKey || event.ctrlKey) &&
    !event.shiftKey &&
    !event.altKey &&
    (event.key === 'k' || event.key === 'K')
  ) {
    event.preventDefault();

    if (!editor.value) return;

    const view = editor.value.view;
    const { state } = view;

    // Compute cursor position relative to the super-editor container
    const container = editorWrapper.value;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const cursorCoords = view.coordsAtPos(state.selection.head);

    const left = `${cursorCoords.left - containerRect.left}px`;
    const top = `${cursorCoords.bottom - containerRect.top + 6}px`; // small offset below selection

    openPopover(markRaw(LinkInput), {}, { left, top });
  }

  emit('editor-keydown', { editor: editor.value });
};

const handleSuperEditorClick = (event) => {
  emit('editor-click', { editor: editor.value });
  let pmElement = editorElem.value?.querySelector('.ProseMirror');

  if (!pmElement || !editor.value) {
    return;
  }

  let isInsideEditor = pmElement.contains(event.target);

  if (!isInsideEditor && editor.value.isEditable) {
    editor.value.view?.focus();
  }

  // Add logic here to handle a click in the editor
  // Get the node at the click position and check if it has a node in the parent tree
  // example: hasParentNode(node, 'p')
  if (isInsideEditor && editor.value.isEditable) {
    checkNodeSpecificClicks(editor.value, event, popoverControls);
  }
};

onMounted(() => {
  initializeData();
  if (props.options?.suppressSkeletonLoader || !props.options?.collaborationProvider) editorReady.value = true;
});

const handleMarginClick = (event) => {
  if (event.target.classList.contains('ProseMirror')) return;

  onMarginClickCursorChange(event, editor.value);
};

/**
 * Triggered when the user changes the margin value from the ruler
 *
 * @param {Object} param0
 * @param {String} param0.side - The side of the margin being changed
 * @param {Number} param0.value - The new value of the margin in inches
 * @returns {void}
 */
const handleMarginChange = ({ side, value }) => {
  if (!editor.value) return;

  const pageStyles = editor.value.getPageStyles();
  const { pageMargins } = pageStyles;
  const update = { ...pageMargins, [side]: value };
  editor.value?.updatePageStyle({ pageMargins: update });
};

onBeforeUnmount(() => {
  stopPolling();
  editor.value?.destroy();
  editor.value = null;
});
</script>

<template>
  <div class="super-editor-container">
    <Ruler class="ruler" v-if="options.rulers && !!editor" :editor="editor" @margin-change="handleMarginChange" />

    <div
      class="super-editor"
      ref="editorWrapper"
      @keydown="handleSuperEditorKeydown"
      @click="handleSuperEditorClick"
      @mousedown="handleMarginClick"
    >
      <div ref="editorElem" class="editor-element super-editor__element" role="presentation"></div>
      <SlashMenu
        v-if="!props.options.disableContextMenu && editorReady && editor"
        :editor="editor"
        :popoverControls="popoverControls"
        :openPopover="openPopover"
        :closePopover="closePopover"
      />
    </div>

    <div class="placeholder-editor" v-if="!editorReady">
      <div class="placeholder-title">
        <n-skeleton text style="width: 60%" />
      </div>

      <n-skeleton text :repeat="6" />
      <n-skeleton text style="width: 60%" />

      <n-skeleton text :repeat="6" style="width: 30%; display: block; margin: 20px" />
      <n-skeleton text style="width: 60%" />
      <n-skeleton text :repeat="5" />
      <n-skeleton text style="width: 30%" />

      <n-skeleton text style="margin-top: 50px" />
      <n-skeleton text :repeat="6" />
      <n-skeleton text style="width: 70%" />
    </div>

    <GenericPopover
      v-if="editor"
      :editor="editor"
      :visible="popoverControls.visible"
      :position="popoverControls.position"
      @close="closePopover"
    >
      <component :is="popoverControls.component" v-bind="{ ...popoverControls.props, editor, closePopover }" />
    </GenericPopover>
  </div>
</template>

<style scoped>
.editor-element {
  position: relative;
}

.super-editor-container {
  width: auto;
  height: auto;
  min-width: 8in;
  min-height: 11in;
  position: relative;
  display: flex;
  flex-direction: column;
}

.ruler {
  margin-bottom: 2px;
}

.super-editor {
  color: initial;
}

.placeholder-editor {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 8px;
  padding: 1in;
  z-index: 5;
  background-color: white;
  box-sizing: border-box;
}

.placeholder-title {
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
}
</style>
