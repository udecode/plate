<script setup>
import '@harbour-enterprises/superdoc/super-editor/style.css';
import { onMounted } from 'vue';
import { Editor, SuperToolbar } from '@harbour-enterprises/superdoc/super-editor';

const init = () => {
  // Initialize the editor
  const myEditor = new Editor({
    selector: '#editor', // Can also be a class ie: .main-editor
    mode: 'html',
    content: '<p>Hello World</p>',
  });

  // Initialize the toolbar
  const myToolbar = new SuperToolbar({
    selector: '#toolbar', // Can also be a class ie: .my-custom-toolbar
    editor: myEditor,
    toolbarGroups: ['center'],
  });
};

onMounted(() => init());
</script>

<template>
  <div>
    <h1>SuperDoc: Rich-text editing with SuperEditor and Vue</h1>

    <div id="toolbar" class="my-custom-toolbar"></div>
    <div id="editor" class="main-editor"></div>
  </div>
</template>

<style scoped>

</style>
