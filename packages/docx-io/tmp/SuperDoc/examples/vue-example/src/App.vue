<template>
  <div class="app">
    <header>
      <h1>SuperDoc Example</h1>
      <button @click="fileInput?.click()">Load Document</button>
      <input 
        type="file" 
        ref="fileInput" 
        accept=".docx,.pdf" 
        class="hidden"
        @change="handleFileChange"
      >
    </header>
    
    <main>
      <DocumentEditor
        :initial-data="documentFile"
        @editor-ready="handleEditorReady"
      />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import DocumentEditor from './components/DocumentEditor.vue';

const documentFile = ref(null);
const fileInput = ref(null);

const handleFileChange = (event) => {
  const file = event.target.files?.[0];
  if (file) {
    documentFile.value = file;
  }
};

const handleEditorReady = (editor) => {
  console.log('SuperDoc editor is ready', editor);
};
</script>

<style>
.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

header {
  padding: 1rem;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  gap: 1rem;
}

header button {
  padding: 0.5rem 1rem;
  background: #1355ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

header button:hover {
  background: #0044ff;
}

.hidden {
  display: none;
}

main {
  flex: 1;
  padding: 1rem;
}
</style>