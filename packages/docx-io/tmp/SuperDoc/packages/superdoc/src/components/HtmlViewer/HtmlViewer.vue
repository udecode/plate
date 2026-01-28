<script setup>
import { onMounted, ref } from 'vue';
const props = defineProps({
  fileSource: {
    type: File,
    required: true,
  },
  documentId: {
    type: String,
    required: true,
  },
});

const documentContent = ref('');

const emit = defineEmits(['ready', 'selection-change']);

const handleSelectionChange = () => {
  const selection = window.getSelection();
  console.debug('selection from html viewer', selection);
  emit('selection-change', selection);
};

const getDocumentHtml = (fileSource) => {
  // read file
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const htmlString = e.target.result;
      resolve(htmlString);
    };
    reader.onerror = (e) => reject(e);
    reader.readAsText(fileSource);
  });
};

const initViewer = async () => {
  try {
    const documentHtml = await getDocumentHtml(props.fileSource);
    documentContent.value = documentHtml;
    emit('ready', props.documentId);
  } catch (error) {
    emit('error', error);
    console.error('Error loading document', error);
  }
};

onMounted(() => {
  initViewer();
});
</script>

<template>
  <div class="superdoc-html-viewer">
    <div class="superdoc-html-viewer__document">
      <div class="superdoc-html-viewer__content" v-html="documentContent" @mouseup="handleSelectionChange"></div>
    </div>
  </div>
</template>

<style scoped>
.superdoc-html-viewer {
  font-family: initial;
  color: initial;
  width: 100%;
  height: auto;
  position: relative;
}

.superdoc-html-viewer__document {
  width: 100%;
  height: auto;
}

.superdoc-html-viewer__content {
  width: 100%;
  min-width: 800px;
  padding: 38px 75px 75px;
}
</style>
