<script setup>
import '@harbour-enterprises/superdoc/style.css';
import { onMounted, ref, shallowRef } from 'vue';
import { SuperDoc, DOCX } from '@harbour-enterprises/superdoc';

import { DocumentMapExtension } from '../plugins/document-map/index';
import DocumentMap from './components/DocumentMap.vue';

let superdoc;
const editor = shallowRef(null);
const documentMapData = ref([]);

const init = async () => {
  const config = {
    name: 'superdoc-test',
    selector: '#superdoc',
    toolbarGroups: ['center', 'right'],
    format: 'docx',
    toolbar: 'toolbar',
    pagination: true,

    documents: [{
      url: '/generic-license.docx',
      type: DOCX,
    }],

    // Pass in our custom created extension
    editorExtensions:[DocumentMapExtension],

    onEditorBeforeCreate: ({ editor: newEditor }) => {
      editor.value = newEditor;
      editor.value.on('document-map-update', onDocumentMapUpdate);
    },
    onReady: ({ superdoc: newSuperDoc }) => {
      superdoc = newSuperDoc;
      superdoc.activeEditor.on('document-map-update', onDocumentMapUpdate);
    },
  };

  new SuperDoc(config);
};

const onDocumentMapUpdate = (documentMap) => {
  documentMapData.value = [...documentMap];
};

const handleReorder = ({ draggedIndex, targetIndex }) => {
  superdoc.activeEditor.commands.documentMapReorder({ draggedIndex, targetIndex });
};

onMounted(() => {
  init();
});
</script>

<template>
  <div>
    <div style="display: flex; align-items: center; padding-top: 20px;">
      <h2>SuperDoc demo</h2>
    </div>

    <div style="margin-bottom: 25px; border-bottom: 1px solid #DBDBDB">
      This tests dynamic tracking of nodes in the document, and linking sub-editors to each node with two-way binding.<br />
      Also shows how to create a fully customized external SuperDoc plugin.
    </div>

    <div id="toolbar"></div>
    <div class="superdoc-container">
      <DocumentMap
        :documentMapData="documentMapData"
        v-if="editor"
        :editor="editor"
        @reorder="handleReorder"
      />

      <!-- Container for main SuperDoc -->
      <div id="superdoc"></div>
    </div>
  </div>
</template>

<style>
.superdoc-container .super-editor {
  cursor: text;
  border-radius: 8px;
  border: 1px solid #d3d3d3;
  text-align: left;
  box-shadow:0 0 5px hsla( 0,0%,0%,.05);
  transition: all 0.18s ease-out;
}
.document-section-active {
  border-radius: 2px;
  background-color: rgb(108, 115, 160, 0.3)
}

</style>

<style scoped>
.img-logo {
  max-width: 30px;
  max-height: 30px;
  margin-right: 10px;
}
.document-map-item-text {
  font-style: italic;
  margin-left: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}
.chevron {
  color: #000;
  margin-right: 5px;
}
.document-map {
  background-color: #cbcbcb;
  border-radius: 8px;
  min-width: 400px;
  max-width: 400px;
  width: 400px;
  margin-right: 10px;
  padding: 5px;
}
.document-map-list {
  display: flex;
  cursor: pointer;
  border-radius: 5px;
  padding: 5px;
  margin: 5px;
}
.document-map-list:hover {
  background-color: white;
  transition: all 0.18s ease-out;
}
.superdoc-container {
  display: flex;
}
</style>
