<script setup>
import { onMounted, ref } from 'vue';
import { PrismEditor } from 'vue-prism-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'vue-prism-editor/dist/prismeditor.min.css';
import 'prismjs/themes/prism-tomorrow.css';

import { SuperDoc, getFileObject } from '@harbour-enterprises/superdoc';
import templateFileUrl from './assets/template.docx?url';
import { getProcessedTemplateFromCode } from './fileProcessing';
import { sleep } from './utils';
import DocumentTab from './components/DocumentTab.vue';

const highlighter = (code) => highlight(code, languages.js);

// template and output superdoc editor instances
const templateEditorInstance = ref(null);
const outputEditorInstance = ref(null);
// editor visibility booleans
const showTemplateEditor = ref(true);
const showOutputEditor = ref(false);

// prism code editor writes to this
const codeInput = ref(null);
// sets y postion of prism code editor
const codeEditorTopPositionInt = ref(220);
// enable/disable prism code editor push down
const codeEditorPushdownIsEnabled = ref(true);

// data for tabs in the "document"
const documentTabsData = ref([
  {
    isActive: true,
    faIconArray: ['far', 'file-word'],
    text: 'template.docx',
    id: 'template',
    onClick: () => handleDocumentTabClick('template'),
    hasBorder: false,
    tooltip: 'View template',
  },
  {
    isActive: false,
    faIconArray: ['far', 'file-word'],
    text: 'output.docx',
    id: 'output',
    onClick: () => handleDocumentTabClick('output'),
    hasBorder: true,
    tooltip: 'View result',
  },
  {
    isActive: false,
    faIconArray: ['fas', 'file-arrow-up'],
    text: 'DOCX',
    id: 'upload',
    onClick: () => uploadTemplateDocumentWithSideEffects('template'),
    hasBorder: true,
    tooltip: 'Upload template',
  },
  {
    isActive: false,
    faIconArray: ['fas', 'file-arrow-down'],
    text: null,
    id: 'download',
    onClick: () => downloadEditorDocument('output'),
    hasBorder: false,
    tooltip: 'Download result',
  },
]);

// create file input and get upload file blob 
const uploadTemplateDocumentWithSideEffects = async () => {
  // create file input
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.docx';
  input.style.opacity = 0;

  // upload handler
  const onChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // overwrite template editor
    await initSuperdoc({
      file,
      name: file.name,
      selector: '#template-editor',
      editorRef: templateEditorInstance,
    });

    await sleep(500);
    // use editor's file to gurantee match (in case of side effects while in memory)
    const fileBlob = await getSuperdocEditorInstanceFileBlob(templateEditorInstance);
    await getProcessedTemplateAndUpdateOutput({
      codeString: codeInput.value,
      templateFileBlob: fileBlob
    });

    pushDownCodeEditor(300);
    codeEditorPushdownIsEnabled.value = false; // disable further push down

    // set "document tab title"
    const templateDocumentData = documentTabsData.value.find((tab) => tab.id === 'template');
    templateDocumentData.text = file.name;
  }
  input.addEventListener('change', onChange);

  // append to body, then remove
  document.body.appendChild(input);
  input.click();
  document.body.removeChild(input);
}

// download document, no side-effects
const downloadEditorDocument = async (editorType) => {
  const editorInstance = editorType === 'template' ? templateEditorInstance : outputEditorInstance;

  // download file
  const fileBlob = await getSuperdocEditorInstanceFileBlob(editorInstance);
  const url = URL.createObjectURL(fileBlob);
  const a = document.createElement('a');
  a.href = url;

  a.download = 'output.docx';
  a.click();
  URL.revokeObjectURL(url);

  return;
}

// click handler for document tabs
const handleDocumentTabClick = (editorType) => {
  // reset view
  showTemplateEditor.value = false;
  showOutputEditor.value = false;

  if (editorType === 'template') showTemplateEditor.value = true;
  if (editorType === 'output') showOutputEditor.value = true;
  
  // set state of tabs
  const statefulTabIds = ['template', 'output'];
  const statefulTabs = documentTabsData.value.filter((tab) => statefulTabIds.includes(tab.id));
  statefulTabs.forEach((tab) => {
    tab.isActive = false; // reset
    if (tab.id === editorType) tab.isActive = true; // set conditionally
  });
}

// process template with side-effects, does not switch tabs
const getProcessedTemplateAndUpdateOutput = async ({ codeString, templateFileBlob }) => {
  // process with docxtemplater
  const file = await getProcessedTemplateFromCode({
    codeString,
    templateFileBlob,
  });
  if (!file) {
    console.error('getProcessedTemplateAndUpdateOutput - no file');
    return;
  }

  // overwrite output editor
  initSuperdoc({
    file,
    name: "output.docx",
    selector: "#output-editor",
    editorRef: outputEditorInstance,
  });
}

// init editor driver
const initSuperdoc = async ({ file, name, selector, editorRef }) => {
  const config = {
    selector
  }

  if (file) {
    config.documents = [{
      id: `superdoc-${name}-${selector}`,
      type: 'docx',
      data: file
    }]
  }

  editorRef.value = new SuperDoc(config);
}

// simulate the typing of code with setTimeout
const runTemplateProcessingAnimtation = async () => {
  const targetValue = `doc.render({
  firstname: "John",
});`;

  let renderedValue = '';
  const generateInitialCode = (value) => `import Docxtemplater from "docxtemplater";
const doc = new Docxtemplater(document1);
${value}`;

  const delay = 50;
  const totalTime = delay * targetValue.length;
  targetValue.split('').forEach((letter, index) => {
    setTimeout(() => {
      renderedValue += letter;
      codeInput.value = generateInitialCode(renderedValue);
    }, delay * index);
  });

  return sleep(totalTime + 100);
}

// init prism code editor with animations and tab switching
const initCodeEditorWithSideEffects = async () => {
  await runTemplateProcessingAnimtation();
  handleCodeEditorKeydown();
  await sleep(1000);
  handleDocumentTabClick('template');
};

// get file blob from a superdoc editor instance
const getSuperdocEditorInstanceFileBlob = async (editorInstance) => {
  const editorValues = await editorInstance.value.exportEditorsToDOCX();
  if (!editorValues?.length) return null;

  const blob = editorValues[0];
  const fileBlob = new File([blob], 'template.docx', { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
  return fileBlob;
}

// switch tab to template if user types in output editor,
// output is overwritten when processing template.
const handleOutputEditorKeydown = () => {
  handleDocumentTabClick('template');
}

// increment prism code editor y position
const pushDownCodeEditor = (distanceInt = 20) => {
  if (!codeEditorPushdownIsEnabled.value) return;
  codeEditorTopPositionInt.value += distanceInt;
}

// process template when user types in template editor,
// don't switch tab.
const handleTemplateEditorKeydown = async (event) => {
  const fileBlob = await getSuperdocEditorInstanceFileBlob(templateEditorInstance);
  getProcessedTemplateAndUpdateOutput({
    codeString: codeInput.value,
    templateFileBlob: fileBlob
  });
};

// process template when user types in prism code editor,
// switch tab to output.
const handleCodeEditorKeydown = async () => {
  const fileBlob = await getSuperdocEditorInstanceFileBlob(templateEditorInstance);
  const templateFileBlob = fileBlob;

  getProcessedTemplateAndUpdateOutput({
    codeString: codeInput.value,
    templateFileBlob,
  })
  handleDocumentTabClick('output');
}

onMounted(async () => {
  // init template editor
  const file = await getFileObject(templateFileUrl, 'template.docx');
  await initSuperdoc({
    // file,
    name: 'template.docx',
    selector: '#template-editor',
    editorRef: templateEditorInstance,
  });

  // init code editor
  await initCodeEditorWithSideEffects();

  const templateFileBlob = await getFileObject(templateFileUrl, 'template.docx');

  getProcessedTemplateAndUpdateOutput({
    codeString: codeInput.value,
    templateFileBlob,
  });

  // output doesn't need init, it will be written to by the code editor
});
</script>

<template>
  <div class="wrapper">
    <div class="document-window">
      <!-- contains tabs, buttons -->
      <div class="control-bar">
        <!-- meant to look like a macOS window -->
        <div class="window-buttons-ctn">
          <div class="window-buttons-row">
            <div class="button close"></div>
            <div class="button minimize"></div>
            <div class="button fullscreen"></div>
          </div>
        </div>

        <!-- all tabs and buttons -->
        <div class="document-tabs-ctn">
          <DocumentTab v-for="tab in documentTabsData" :key="tab.text" :isActive="tab.isActive"
            :faIconArray="tab.faIconArray" :text="tab.text" @click="tab.onClick" :hasBorder="tab.hasBorder"
            :tooltip="tab.tooltip" />
        </div>
      </div>
      <!-- end control-bar -->

      <div class="editor-wrapper">
        <!-- prism code editor, "floats" over document editor -->
        <div class="code-editor-ctn" :style="{ top: codeEditorTopPositionInt + 'px' }">
          <div class="code-editor-tab">app.js</div>
          <prism-editor id="code-editor" class="my-editor" v-model="codeInput" @input="handleCodeEditorKeydown"
            :highlight="highlighter" line-numbers></prism-editor>
        </div>
        <!-- end code editor -->
        <!-- superdoc document editors, one will be shown at a time -->
        <div v-show="showTemplateEditor" class="editor" id="template-editor" @input="handleTemplateEditorKeydown"
          @keydown.enter="pushDownCodeEditor"></div>
        <div v-show="showOutputEditor" class="editor" id="output-editor" @input="handleOutputEditorKeydown"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.document-window {
  width: 50%;
  margin: 1em auto;
  background-color: #e6e7e7;
  height: 80vh;
  border-radius: 10px;
  box-shadow: 1px 14px 20px 0px rgba(0, 0, 0, 0.2);
}

.control-bar {
  padding-top: .8em;
  width: 100%;
  height: 50px;
  display: flex;
  justify-content: space-between;
  background-color: #2b5796;
  border-bottom: solid 10px #89a6d2;
  border-radius: 10px 10px 0 0;
}

.control-bar .document-tabs-ctn {
  margin-right: 1em;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

.document-upload-download-ctn {
  display: flex;
  align-items: center;
}


.control-bar .window-buttons-ctn {
  display: flex;
  justify-content: unset;
  height: 100%;
  flex-direction: column;
}

.control-bar .window-buttons-ctn .window-buttons-row {
  display: flex;
  align-items: center;
  margin-top: .8em;
}

.control-bar .window-buttons-ctn .button {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  margin-left: 10px;
}

.control-bar .window-buttons-ctn .button.close {
  background-color: #ff5f57;
}

.control-bar .window-buttons-ctn .button.minimize {
  background-color: #ffbd2e;
}

.control-bar .window-buttons-ctn .button.fullscreen {
  background-color: #27c93f;
}

.editor-wrapper {
  height: 100%;
  width: 100%;
  margin: 0 auto;
  position: relative;
}

.editor {
  background-color: white;
  width: 8.5in;
  position: absolute;
  left: 50%;
  transform: translate(-50%) scale(.8, .8);
  top: -30px;
  overflow-y: scroll;
  overflow-x: hidden;
  height: 650px;
}

.code-editor-ctn {
  display: flex;
  flex-direction: column;
  align-items: end;
  height: 180px;
  width: 100%;
  font-weight: bold;
  font-size: 1em;
  color: white;
  font-family: monospace;
  position: absolute;
  border-radius: 10px;
  left: -30px;
  top: 200px;
  z-index: 1;
  transition: top 0.5s;
}

.code-editor-ctn #code-editor {
  margin: 0;
  height: 140px;
  width: 100%;
  background-color: rgb(42, 42, 42);
  font-weight: bold;
  font-size: 1em;
  color: white;
  font-family: monospace;
  border-radius: 10px 0 10px 10px;
  padding: 2em;
}

.code-editor-ctn .code-editor-tab {
  background-color: rgb(42, 42, 42);
  color: rgb(216, 216, 216);
  font-weight: 400;
  width: 80px;
  text-align: center;
  border-radius: 10px 10px 0 0;
}
</style>