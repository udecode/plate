<template>
  <div class="document-editor">
    <div :key="documentKey" class="editor-container">
      <div id="superdoc-toolbar" class="toolbar"></div>
      <div id="superdoc" class="editor"></div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { SuperDoc } from '@harbour-enterprises/superdoc';
import '@harbour-enterprises/superdoc/style.css';

const props = defineProps({
  initialData: {
    type: File,
    default: null
  },
  readOnly: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['editor-ready', 'editor-error']);

// Use ref to track the editor instance
const editor = ref(null);
const documentKey = ref(0);

// Function to safely destroy editor
const destroyEditor = () => {
  if (editor.value) {
    editor.value = null;
  }
};

// Function to initialize editor
const initializeEditor = async () => {
  try {
    // Ensure cleanup of previous instance
    destroyEditor();
    
    // Increment key to force re-render
    documentKey.value++;

    // Create new editor instance
    editor.value = new SuperDoc({
      selector: '#superdoc',
      toolbar: '#superdoc-toolbar',
      document: props.initialData, // URL, File or document config
      documentMode: props.readOnly ? 'viewing' : 'editing',
      pagination: true,
      rulers: true,
      onReady: (event) => {
        console.log('SuperDoc is ready', event);
      },
      onEditorCreate: (event) => {
        console.log('Editor is created', event);
      },
    });
  } catch (error) {
    console.error('Failed to initialize editor:', error);
    emit('editor-error', error);
  }
};

// Watch for changes in props that should trigger re-initialization
watch(
  () => [props.documentId, props.initialData, props.readOnly],
  () => {
    initializeEditor();
  }
);

onMounted(() => {
  initializeEditor();
});

onUnmounted(() => {
  destroyEditor();
});
</script>

<style scoped>
.editor-container {
  /* display: flex;
  flex-direction: column;
  align-items: center; */
}
.document-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.toolbar {
  flex: 0 0 auto;
  border-bottom: 1px solid #eee;
  min-height: 40px; /* Ensure toolbar has minimum height */
}

.editor {
  display: flex;
  justify-content: center;
  flex: 1 1 auto;
  overflow: auto;
  margin-top: 10px;
  min-height: 400px; /* Ensure editor has minimum height */
}
</style>