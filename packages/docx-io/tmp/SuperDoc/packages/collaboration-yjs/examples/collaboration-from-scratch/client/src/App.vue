<script setup>
import '@harbour-enterprises/superdoc/style.css';
import { ref, onMounted } from 'vue';
import { SuperDoc } from '@harbour-enterprises/superdoc';

import SampleDoc from '/sample-document.docx?url';

let superdoc;
const initializeEditor = async () => {
  const documentId = 'my-doc-id';
  superdoc = new SuperDoc({
    selector: '#superdoc',
    toolbar: '#superdoc-toolbar',
    document: {
      id: documentId,
      type: 'docx',
      url: SampleDoc,
      isNewFile: true, // Only needed if initializing a brand new document
    },

    // Note: If you are restoring a document from the server, you only need:
    // document: {
    //   id: documentId,
    // },

    pagination: true,

    // Awareness colors
    colors: USER_COLORS,

    // You need to pass in info about the current user for collaboration
    user: generateUserInfo(),

    // Enable collaboration module
    modules: {
      collaboration: {
        url: `ws://localhost:3050/collaboration`,
        token: 'token',
      }
    },

    onAwarenessUpdate,
  });
};

const onAwarenessUpdate = ({ superdoc, states, added, removed }) => {
  // This function is called whenever the awareness state changes.
  console.debug('Awareness states:', states);
};

/** For collaboration example */
const USER_COLORS = ['#a11134', '#2a7e34', '#b29d11', '#2f4597', '#ab5b22'];

/** Normally, you'd pass in the user info from your system. Here we'll generate it */
const generateUserInfo = () => {
  const randomUser = Math.random().toString(36).substring(2, 8);
  const randomName = `SuperDocUser-${randomUser}`;
  const color = getRandomUserColor();
  return {
    name: randomName,
    email: randomName.toLowerCase() + '@superdoc.dev',
    color: getRandomUserColor(),
  };
};

function getRandomUserColor() {
  const index = Math.floor(Math.random() * USER_COLORS.length);
  return USER_COLORS[index];
}

onMounted(() => {
  initializeEditor();
});

</script>

<template>
  <div class="app">
    <header>
      <div>
        <h1>SuperDoc - Collaboration from scratch</h1>
        <div style="margin-bottom: 10px;">
          This example shows how to create an absolutely minimal collaboration service for SuperDoc using utilities from the Yjs library directly. <br />
          It does not use our own <strong><a href="https://www.npmjs.com/package/@harbour-enterprises/superdoc-yjs-collaboration" target="_blank">superdoc-yjs-library</a></strong>
        </div>
        <div style="margin-bottom: 10px;">
          <strong>Note:</strong> This example is for demonstration purposes only. It does not include any security or authentication features.<br />
          <strong>Usage:</strong> Open two or more browser windows to this URL (each one will refresh the document). Then, start collaborating!
        </div>
      </div>
    </header>
    
    <main>
      <div id="superdoc"></div>
    </main>
  </div>
</template>

<style scoped>
main {
  display: flex;
  justify-content: center;
}
</style>