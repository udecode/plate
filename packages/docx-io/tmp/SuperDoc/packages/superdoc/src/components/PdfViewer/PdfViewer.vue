<script setup>
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import * as pdfjsViewer from 'pdfjs-dist/web/pdf_viewer';
import workerSrc from './worker.js?raw';
import { range } from './helpers/range.js';
import { NSpin } from 'naive-ui';

import { storeToRefs } from 'pinia';
import { onMounted, onUnmounted, ref, getCurrentInstance } from 'vue';
import { useSuperdocStore } from '@superdoc/stores/superdoc-store';
import useSelection from '@superdoc/helpers/use-selection';

const workerUrl = URL.createObjectURL(new Blob([workerSrc], { type: 'text/javascript' }));
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

const emit = defineEmits(['page-loaded', 'ready', 'selection-change', 'bypass-selection']);
const superdocStore = useSuperdocStore();
const { proxy } = getCurrentInstance();
const { activeZoom } = storeToRefs(superdocStore);
const totalPages = ref(null);
const viewer = ref(null);
const isReady = ref(false);

const pdfViewerConfig = proxy.$superdoc.config.pdfViewer;
const textLayerMode = pdfViewerConfig.textLayerMode ?? 0;

let pdfjsLoadingTask = null;
let pdfjsDocument = null;
let pdfPageViews = [];

const props = defineProps({
  documentData: {
    type: Object,
    required: true,
  },
});

const id = props.documentData.id;
const pdfData = props.documentData.data;

const getOriginalPageSize = (page) => {
  const viewport = page.getViewport({ scale: 1 });
  const width = viewport.width;
  const height = viewport.height;
  return { width, height };
};

async function initPdfLayer(arrayBuffer) {
  const loadingTask = pdfjsLib.getDocument(arrayBuffer);
  const document = await loadingTask.promise;
  return { loadingTask, document };
}

async function loadPDF(fileObject) {
  const fileReader = new FileReader();
  fileReader.onload = async function (event) {
    const { loadingTask, document } = await initPdfLayer(event.target.result);
    pdfjsLoadingTask = loadingTask;
    pdfjsDocument = document;
    renderPages(document);
  };
  fileReader.readAsArrayBuffer(fileObject);
}

const renderPages = (pdfDocument) => {
  setTimeout(() => {
    _renderPages(pdfDocument);
  }, 150);
};

async function getPdfjsPages(pdf, firstPage, lastPage) {
  const allPagesPromises = range(firstPage, lastPage + 1).map((num) => pdf.getPage(num));
  return await Promise.all(allPagesPromises);
}

async function _renderPages(pdfDocument) {
  try {
    const numPages = pdfDocument.numPages;
    totalPages.value = numPages;

    const firstPage = 1;
    const pdfjsPages = await getPdfjsPages(pdfDocument, firstPage, numPages);

    const pageContainers = [];
    for (const [index, page] of pdfjsPages.entries()) {
      const container = document.createElement('div');
      container.className = 'pdf-page';
      container.dataset.pageNumber = index + 1;
      container.id = `${id}-page-${index + 1}`;

      pageContainers.push(container);

      const { width, height } = getOriginalPageSize(page);
      const scale = 1;
      const eventBus = new pdfjsViewer.EventBus();
      const pdfPageView = new pdfjsViewer.PDFPageView({
        container,
        id: index + 1,
        scale,
        defaultViewport: page.getViewport({ scale }),
        eventBus,
        textLayerMode,
      });
      pdfPageViews.push(pdfPageView);

      const containerBounds = container.getBoundingClientRect();
      containerBounds.originalWidth = width;
      containerBounds.originalHeight = height;

      pdfPageView.setPdfPage(page);
      await pdfPageView.draw();

      // Emit page information
      emit('page-loaded', id, index, containerBounds);
    }

    viewer.value.append(...pageContainers);

    isReady.value = true;
    emit('ready', id, viewer);
  } catch (error) {
    console.error('Error loading PDF:', error);
  }
}

function getSelectedTextBoundingBox(container) {
  const selection = window.getSelection();
  if (selection.rangeCount === 0) {
    return null;
  }

  const range = selection.getRangeAt(0);
  const boundingRects = range.getClientRects();

  if (boundingRects.length === 0) {
    return null;
  }

  // Initialize bounding box with the first bounding rectangle
  const firstRect = boundingRects[0];
  let boundingBox = {
    top: firstRect.top,
    left: firstRect.left,
    bottom: firstRect.bottom,
    right: firstRect.right,
  };

  for (let i = 1; i < boundingRects.length; i++) {
    const rect = boundingRects[i];
    if (rect.width === 0 || rect.height === 0) {
      continue;
    }
    boundingBox.top = Math.min(boundingBox.top, rect.top);
    boundingBox.left = Math.min(boundingBox.left, rect.left);
    boundingBox.bottom = Math.max(boundingBox.bottom, rect.bottom);
    boundingBox.right = Math.max(boundingBox.right, rect.right);
  }

  // Get the bounding box of the container
  const containerRect = container.getBoundingClientRect();
  const viewerRect = viewer.value.getBoundingClientRect();

  // Adjust the bounding box relative to the page
  boundingBox.top = (boundingBox.top - containerRect.top) / (activeZoom.value / 100) + container.scrollTop;
  boundingBox.left = (boundingBox.left - containerRect.left) / (activeZoom.value / 100) + container.scrollLeft;
  boundingBox.bottom = (boundingBox.bottom - containerRect.top) / (activeZoom.value / 100) + container.scrollTop;
  boundingBox.right = (boundingBox.right - containerRect.left) / (activeZoom.value / 100) + container.scrollLeft;

  return boundingBox;
}

const handlePdfClick = (e) => {
  const { target } = e;
  if (target.tagName !== 'SPAN') {
    emit('bypass-selection', e);
  }
};

const handleMouseUp = (e) => {
  const selection = window.getSelection();
  if (selection.toString().length > 0) {
    const selectionBounds = getSelectedTextBoundingBox(viewer.value);
    const sel = useSelection({
      selectionBounds,
      documentId: id,
    });
    emit('selection-change', sel);
  }
};

const destroy = () => {
  pdfPageViews.forEach((view) => view.destroy()); // will cleanup page resources

  pdfjsDocument.cleanup();
  pdfjsDocument.destroy();

  pdfPageViews = [];
  pdfjsDocument = null;
  pdfjsLoadingTask = null;

  URL.revokeObjectURL(workerUrl);
};

onMounted(async () => {
  await loadPDF(pdfData);
});

onUnmounted(() => {
  destroy();
});
</script>

<template>
  <div class="superdoc-pdf-viewer-container" @mousedown="handlePdfClick" @mouseup="handleMouseUp">
    <div class="superdoc-pdf-viewer" ref="viewer" id="viewerId"></div>

    <div v-if="!isReady" class="superdoc-pdf-viewer__loader">
      <n-spin class="superdoc-pdf-viewer__spin" size="large" />
    </div>
  </div>
</template>

<style lang="postcss">
/** Global styles */
.superdoc-pdf-viewer {
  @nested-import 'pdfjs-dist/web/pdf_viewer.css';
}
</style>

<style lang="postcss" scoped>
.superdoc-pdf-viewer-container {
  width: 100%;
}

.superdoc-pdf-viewer {
  display: flex;
  flex-direction: column;
  width: 100%;
  position: relative;

  &__loader {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    min-width: 150px;
    min-height: 150px;

    :deep(.n-spin) {
      --n-color: #1354ff !important;
      --n-text-color: #1354ff !important;
    }
  }

  :deep(.pdf-page) {
    border-top: 1px solid #dfdfdf;
    border-bottom: 1px solid #dfdfdf;
    margin: 0 0 20px 0;
    position: relative;
    overflow: hidden;

    &:first-child {
      border-radius: 16px 16px 0 0;
      border-top: none;
    }

    &:last-child {
      border-radius: 0 0 16px 16px;
      border-bottom: none;
    }
  }

  :deep(.textLayer) {
    z-index: 2;
    position: absolute;

    &::selection {
      background-color: #1355ff66;
      mix-blend-mode: difference;
    }
  }
}
</style>
