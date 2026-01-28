<script setup>
import '@harbour-enterprises/superdoc/style.css';
import { onMounted, shallowRef } from 'vue';
import { SuperDoc } from '@harbour-enterprises/superdoc';
import UploadFile from './UploadFile.vue';
import { fieldAnnotationHelpers } from '@harbour-enterprises/superdoc';

// Default document
import sampleDocument from '/sample-document.docx?url';


const superdoc = shallowRef(null);
const editor = shallowRef(null);
const snapshot = shallowRef(null);

const init = (fileToLoad) => {
  const config = {
    // Can also be a class ie: .main-editor
    selector: '#editor',

    // Enable pagination
    pagination: true,

    rulers: true,

    // Enable annotation import
    annotations: true,

    // Initialize the toolbar
    toolbar: '#toolbar',
    toolbarGroups: ['center'],

    // Listen for ready event
    onReady,
  }
  if (fileToLoad) config.document = { data: fileToLoad };
  // config.document = sampleDocument; // or try sample document

  superdoc.value = new SuperDoc(config);
};

const handleFileUpdate = (file) => {
  // Handle file update logic here
  console.log('File updated:', file);
  superdoc.value?.destroy();

  init(file);
}

/* When SuperDoc is ready, we can store a reference to the editor instance */
const onReady = () => {
  superdoc.value?.activeEditor?.on('create', ({ editor: activeEditor }) => {
    editor.value = activeEditor;
  });
  superdoc.value?.activeEditor?.on('fieldAnnotationDropped', (params) => {
    const { sourceField } = params;
    addField(sourceField);
  });
}

const saveSnapshot = () => {
  if (editor.value) {
    snapshot.value = editor.value.view.state;
  }
}

const restoreSnapshot = () => {
  if (editor.value && snapshot.value) {
    editor.value.view.updateState(snapshot.value);
    snapshot.value = null;
  }
}

const SAMPLE_HTML_FIELD_ID = '123';
const SAMPLE_TEXT_FIELD_ID = '456';

const replaceField = () => {
  const field = fieldAnnotationHelpers.findFieldAnnotationsByFieldId(
    SAMPLE_HTML_FIELD_ID,
    editor.value.state,
  );

  const node = field[0].node;
  const attrs = {
    ...node.attrs,
    rawHtml: document.getElementById('custom-html').value,
  }
  editor.value.commands.updateFieldAnnotations(node.attrs.fieldId, attrs);
};

const setEditable = () => {
  superdoc.value?.setDocumentMode('editing');
}
const setViewing = () => {
  superdoc.value?.setDocumentMode('viewing');
}

const getHTMLField = () => {
  return {
    displayLabel: 'My placeholder field',
    fieldId: SAMPLE_HTML_FIELD_ID,
    type: 'html',
    fieldColor: '#000099',
  };
};

const getTextField = () => {
  return {
    displayLabel: 'My text field',
    fieldId: SAMPLE_TEXT_FIELD_ID,
    type: 'text',
    fieldColor: '#990000',
  };
};

const addField = (field) => {
  if (!field) field = getHTMLField();
  editor.value.commands.addFieldAnnotationAtSelection(field);
}

const exportDocx = () => {
  superdoc.value?.export({ isFinalDoc: true });

  // Or use superdoc.value?.export({ isFinalDoc: true }); 
  // If you want to fully remove all fields and replace them with their values

};

const onDragStart = (event) => {

  const getField = (id) => {
    switch (id) {
      case 'html-field':
        return getHTMLField();
      case 'text-field':
        return getTextField();
      default:
        return null;
    }
  }

  const field = getField(event.target.id);
  event.dataTransfer.setData('fieldAnnotation', JSON.stringify({ sourceField: field }));
};

onMounted(() => init());
</script>

<template>
  <div class="example-container">
    <h1>SuperDoc: Create a custom node with custom command</h1>

    <p>In this example, we create a simple custom node to pass into SuperDoc.</p>

    <div id="toolbar" class="my-custom-toolbar"></div>
    <div class="editor-and-button">
      <div class="editor-buttons fields" style="margin-right: 10px;">
        <div class="draggable-field" draggable="true" @dragstart="onDragStart" id="html-field">HTML field</div>
        <div class="draggable-field" draggable="true" @dragstart="onDragStart" id="text-field">TEXT field</div>
      </div>
      <div id="editor" class="main-editor"></div>
      <div class="editor-buttons">
        <UploadFile :update-file="handleFileUpdate" />
        <button class="custom-button" @click="saveSnapshot">Save state</button>
        <button class="custom-button" @click="restoreSnapshot" :disabled="!snapshot">Restore state</button>
        <button class="custom-button" @click="replaceField">Update HTML field content</button>
        <textarea
          id="custom-html"
          class="custom-textarea"
          placeholder="Type some HTML to replace custom nodes with"
          value="<p>Custom <b>Node</b> Content</p>"
        ></textarea>

        <br />
        <button class="custom-button" @click="setEditable">Set editable</button>
        <button class="custom-button" @click="setViewing">Set viewing</button>
        <br />
        <button class="custom-button" @click="exportDocx">Export docx</button>
      </div>
    </div>
  </div>
</template>

<style>
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
