<script setup>
import '@harbour-enterprises/superdoc/style.css';
import { onMounted, ref } from 'vue';
import { SuperDoc } from '@harbour-enterprises/superdoc';

const htmlString = ref('<p>I am <strong>a paragraph</strong> in <i>HTML</i></p>');

const config = {
  selector: '#editor', // Can also be a class ie: .main-editor

  // This key will force the document content to be replaced by the given HTML
  html: htmlString.value,

  pagination: true,

  rulers: true,

  // Initialize the toolbar
  toolbar: '#toolbar',
  toolbarGroups: ['center'],

  // Optional, pass in an initial docx document to use your own template rather than a blank doc
  // document: '/sample-document.docx',
};

const init = () => {
  new SuperDoc(config);
};

const onTextareaInput = () => {
new SuperDoc({...config, html: htmlString.value});
};

onMounted(() => init());
</script>

<template>
  <div class="example-container">
    <h1>SuperDoc: Init a docx from HTML content</h1>
    
    <p>In this example, we want to generate a DOCX file from some existing HTML content.</p>
    <textarea v-model="htmlString" @input="onTextareaInput"></textarea>

    <div id="toolbar" class="my-custom-toolbar"></div>
    <div id="editor" class="main-editor"></div>
  </div>
</template>

<style scoped>
.example-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
textarea {
  width: 100%;
  height: 70px;
}
</style>
