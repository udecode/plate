<script setup>
import '@harbour-enterprises/superdoc/style.css';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket'
import { onMounted, shallowRef } from 'vue';
import { Editor, getStarterExtensions } from '@harbour-enterprises/superdoc/super-editor';

// Default document
import sampleDocument from '/sample-document.docx?url';

const editor = shallowRef(null);
const snapshot = shallowRef(null);

const turnUrlToFile = (url) => {
  const fileName = url.split('/').pop();
  return fetch(url)
    .then(response => response.blob())
    .then(blob => new File([blob], fileName, { type: blob.type }));
};

const USER_COLORS = ['#a11134', '#2a7e34', '#b29d11', '#2f4597', '#ab5b22'];

const init = async (fileToLoad) => {
  const fileObject = await turnUrlToFile(sampleDocument);
  const [content, _, mediaFiles, fonts] = await Editor.loadXmlData(fileObject)

  const documentId = 'superdoc-demo';

  // Start a blank Y.Doc and provider
  // This is all handled for you in SuperDoc, but with the lower-level Editor we have to create it manually
  const ydoc = new Y.Doc();
  const provider = new WebsocketProvider(`ws://localhost:3050/collaboration`, documentId, ydoc);
  const user = {
    name: `Demo User #${Math.floor(Math.random() * 1000)}`,
    color: `${USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)]}`,
  };
  provider.awareness.setLocalStateField('user', user);

  // Create editor config
  const config = {
    // If initiating a new file from frontend, we can pass in the fileSource and isNewFile: true
    fileSource: fileObject,
    isNewFile: true, // Only if we're initializing a new file in the front end

    // For collaboration, we need to pass in the Y.Doc and provider
    ydoc,
    collaborationProvider: provider,
    user,

    // Usual editor config below
    element: document.getElementById('editor'),
    extensions: getStarterExtensions(),
    mode: 'docx',
    content,
    pagination: true,
    mediaFiles,
    fonts,
    documentId,
  };
  console.debug('config', config);

  editor.value = new Editor(config);
};

onMounted(() => init());
</script>

<template>
  <div class="example-container">
    <h1>Editor.js - Base editor with collaboration</h1>

    <div id="toolbar" class="my-custom-toolbar"></div>
    <div class="editor-container">
      <div id="editor" class="main-editor"></div>
    </div>
  </div>
</template>

<style>
.editor-container {
  border: 1px solid #ccc;
  border-radius: 8px;
}
.fields > div {
  margin-bottom: 10px;
}
textarea {
  margin-left: 10px;
}
.my-custom-node-default-class {
  background-color: #1355FF;
  border-radius: 8px;
  cursor: pointer;
  color: white;
  display: inline-block;
  padding: 2px 8px;
  font-size: 12px;
}
.my-custom-node-default-class:hover {
  background-color: #0a3dff;
}
.draggable-field {
  background-color: #1355FF;
  border-radius: 8px;
  cursor: pointer;
  color: white;
  display: inline-block;
  padding: 2px 8px;
  font-size: 12px;
}
</style>
