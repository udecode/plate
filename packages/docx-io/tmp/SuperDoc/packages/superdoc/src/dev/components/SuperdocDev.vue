<script setup>
import '@harbour-enterprises/common/styles/common-styles.css';
import { nextTick, onMounted, provide, ref, shallowRef } from 'vue';

import { SuperDoc } from '@superdoc/index.js';
import { DOCX, PDF, HTML } from '@harbour-enterprises/common';
import { BasicUpload, getFileObject } from '@harbour-enterprises/common';
import { fieldAnnotationHelpers } from '@harbour-enterprises/super-editor';
import { toolbarIcons } from '../../../../super-editor/src/components/toolbar/toolbarIcons';
import BlankDOCX from '@harbour-enterprises/common/data/blank.docx?url';

/* For local dev */
const superdoc = shallowRef(null);
const activeEditor = shallowRef(null);

const title = ref('initial title');
const currentFile = ref(null);
const commentsPanel = ref(null);
const showCommentsPanel = ref(true);

const urlParams = new URLSearchParams(window.location.search);
const isInternal = urlParams.has('internal');
const testUserEmail = urlParams.get('email') || 'user@superdoc.com';
const testUserName = urlParams.get('name') || `SuperDoc ${Math.floor(1000 + Math.random() * 9000)}`;
const userRole = urlParams.get('role') || 'editor';

const user = {
  name: testUserName,
  email: testUserEmail,
};

const handleNewFile = async (file) => {
  // Generate a file url
  const url = URL.createObjectURL(file);

  // Detect file type by extension
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  const isMarkdown = fileExtension === 'md';
  const isHtml = fileExtension === 'html' || fileExtension === 'htm';

  if (isMarkdown || isHtml) {
    // For text-based files, read the content and use a blank DOCX as base
    const content = await readFileAsText(file);
    currentFile.value = await getFileObject(BlankDOCX, 'blank.docx', DOCX);

    // Store the content to be passed to SuperDoc
    if (isMarkdown) {
      currentFile.value.markdownContent = content;
    } else if (isHtml) {
      currentFile.value.htmlContent = content;
    }
  } else {
    // For binary files (DOCX, PDF), use as-is
    currentFile.value = await getFileObject(url, file.name, file.type);
  }

  nextTick(() => {
    init();
  });
};

/**
 * Read a file as text content
 * @param {File} file - The file to read
 * @returns {Promise<string>} The file content as text
 */
const readFileAsText = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
};

const init = async () => {
  let testId = 'document-123';
  // const testId = "document_6a9fb1e0725d46989bdbb3f9879e9e1b";

  // Prepare document config with content if available
  const documentConfig = {
    data: currentFile.value,
    id: testId,
    isNewFile: true,
  };

  // Add markdown/HTML content if present
  if (currentFile.value.markdownContent) {
    documentConfig.markdown = currentFile.value.markdownContent;
  }
  if (currentFile.value.htmlContent) {
    documentConfig.html = currentFile.value.htmlContent;
  }

  const config = {
    superdocId: 'superdoc-dev',
    selector: '#superdoc',
    toolbar: 'toolbar',
    toolbarGroups: ['center'],
    role: userRole,
    documentMode: 'editing',
    toolbarGroups: ['left', 'center', 'right'],
    pagination: true,
    rulers: false,
    annotations: true,
    isInternal,
    telemetry: false,
    // disableContextMenu: true,
    // format: 'docx',
    // html: '<p>Hello world</p>',
    // isDev: true,
    user,
    title: 'Test document',
    users: [
      { name: 'Nick Bernal', email: 'nick@harbourshare.com', access: 'internal' },
      { name: 'Eric Doversberger', email: 'eric@harbourshare.com', access: 'external' },
    ],
    document: documentConfig,
    // documents: [
    //   {
    //     data: currentFile.value,
    //     id: testId,
    //     isNewFile: true,
    //   },
    // ],
    // cspNonce: 'testnonce123',
    modules: {
      comments: {
        // comments: sampleComments,
        overflow: true,
        selector: 'comments-panel',
        // useInternalExternalComments: true,
        // suppressInternalExternal: true,
      },
      toolbar: {
        selector: 'toolbar',
        toolbarGroups: ['left', 'center', 'right'],
        // groups: {
        //   center: ['bold'],
        //   right: ['documentMode']
        // },
        // fonts: null,
        // hideButtons: false,
        // responsiveToContainer: true,
        excludeItems: [], // ['italic', 'bold'],
        // texts: {},
      },
      // 'hrbr-fields': {},

      // To test this dev env with collaboration you must run a local collaboration server here.
      // collaboration: {
      //   url: `ws://localhost:3050/docs/${testDocumentId}`,
      //   token: 'token',
      //   providerType: 'hocuspocus',
      // },
      ai: {
        // Provide your Harbour API key here for direct endpoint access
        // apiKey: 'test',
        // Optional: Provide a custom endpoint for AI services
        // endpoint: 'https://sd-dev-express-gateway-i6xtm.ondigitalocean.app/insights',
      },
    },
    onEditorCreate,
    onContentError,
    // handleImageUpload: async (file) => url,
    // Override icons.
    toolbarIcons: {},
    onCommentsUpdate,
    onCommentsListChange: ({ isRendered }) => {
      isCommentsListOpen.value = isRendered;
    },
  };

  superdoc.value = new SuperDoc(config);
  superdoc.value?.on('ready', () => {
    superdoc.value.addCommentsList(commentsPanel.value);
  });

  // const ydoc = superdoc.value.ydoc;
  // const metaMap = ydoc.getMap('meta');
  // metaMap.observe((event) => {
  //   const { keysChanged } = event;
  //   keysChanged.forEach((key) => {
  //     if (key === 'title') {
  //       title.value = metaMap.get('title');
  //     }
  //   });
  // });
};

const onCommentsUpdate = (updateData) => {
  console.debug('[END USER] Comments updated', updateData);
};

const onContentError = ({ editor, error, documentId, file }) => {
  console.debug('Content error on', documentId, error);
};

const exportDocx = async (commentsType) => {
  console.debug('Exporting docx', { commentsType });
  await superdoc.value.export({ commentsType });
};

const exportDocxBlob = async () => {
  const blob = await superdoc.value.export({ commentsType: 'external', triggerDownload: false });
  console.debug(blob);
};

const onEditorCreate = ({ editor }) => {
  activeEditor.value = editor;
  window.editor = editor;

  editor.on('fieldAnnotationClicked', (params) => {
    console.log('fieldAnnotationClicked', { params });
  });

  editor.on('fieldAnnotationSelected', (params) => {
    console.log('fieldAnnotationSelected', { params });
  });
};

const handleTitleChange = (e) => {
  title.value = e.target.innerText;

  const ydoc = superdoc.value.ydoc;
  const metaMap = ydoc.getMap('meta');
  metaMap.set('title', title.value);
  console.debug('Title changed', metaMap.toJSON());
};

const isCommentsListOpen = ref(false);
const toggleCommentsPanel = () => {
  if (isCommentsListOpen.value) {
    superdoc.value?.removeCommentsList();
  } else {
    superdoc.value?.addCommentsList(commentsPanel.value);
  }
};

onMounted(async () => {
  handleNewFile(await getFileObject(BlankDOCX, 'test.docx', DOCX));
});
</script>

<template>
  <div class="dev-app">
    <div class="dev-app__layout">
      <div class="dev-app__header">
        <div class="dev-app__header-side dev-app__header-side--left">
          <div class="dev-app__header-title">
            <h2>🦋 SuperDoc Dev</h2>
          </div>
          <div class="dev-app__header-upload">
            Upload docx, pdf, html or markdown
            <BasicUpload @file-change="handleNewFile" />
          </div>
        </div>
        <div class="dev-app__header-side dev-app__header-side--right">
          <button class="dev-app__header-export-btn" @click="exportDocx()">Export Docx</button>
          <button class="dev-app__header-export-btn" @click="exportDocx('clean')">Export clean Docx</button>
          <button class="dev-app__header-export-btn" @click="exportDocx('external')">Export external Docx</button>
          <button class="dev-app__header-export-btn" @click="exportDocxBlob()">Export Docx Blob</button>
          <button class="dev-app__header-export-btn" @click="toggleCommentsPanel">Toggle comments panel</button>
        </div>
      </div>

      <div id="toolbar" class="sd-toolbar"></div>

      <div class="dev-app__main">
        <div class="dev-app__view">
          <div class="dev-app__content" v-if="currentFile">
            <div class="dev-app__content-container">
              <div id="superdoc"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.sd-toolbar {
  width: 100%;
  background: white;
  position: relative;
  z-index: 1;
}

.comments-panel {
  width: 320px;
}

@media screen and (max-width: 1024px) {
  .superdoc {
    max-width: calc(100vw - 10px);
  }
}
</style>

<style scoped>
.temp-comment {
  margin: 5px;
  border: 1px solid black;
  display: flex;
  flex-direction: column;
}

.comments-panel {
  position: absolute;
  right: 0;
  height: 100%;
  background-color: #fafafa;
  z-index: 100;
}

.dev-app {
  --header-height: 154px;
  --toolbar-height: 39px;

  width: 100%;
  height: 100vh;
}

.dev-app__layout {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
}

.dev-app__header {
  display: flex;
  justify-content: space-between;
  background-color: rgb(222, 237, 243);
  padding: 20px;
  box-sizing: border-box;
}

.dev-app__header-side {
  display: flex;
}

.dev-app__header-side--left {
  flex-direction: column;
}

.dev-app__header-side--right {
  align-items: flex-end;
}

.dev-app__main {
  display: flex;
  justify-content: center;
  overflow: auto;
}

.dev-app__view {
  display: flex;
  padding-top: 20px;
}

.dev-app__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.dev-app__content-container {
  width: auto;
}

.dev-app__inputs-panel {
  display: grid;
  height: calc(100vh - var(--header-height) - var(--toolbar-height));
  background: #fff;
  border-right: 1px solid #dbdbdb;
}

.dev-app__inputs-panel-content {
  display: grid;
  overflow-y: auto;
  scrollbar-width: none;
}
</style>
