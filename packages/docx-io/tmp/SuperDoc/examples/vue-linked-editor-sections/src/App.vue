<script setup>
import '@harbour-enterprises/superdoc/style.css';
import { onMounted, shallowRef, ref } from 'vue';
import { SuperDoc } from '@harbour-enterprises/superdoc';
import UploadFile from './UploadFile.vue';
import { SectionHelpers } from '@harbour-enterprises/superdoc';


const superdoc = shallowRef(null);
const editor = shallowRef(null);
const snapshot = shallowRef(null);
const locks = ref({
  section1: false,
  section2: false,
});
const activeSections = ref({
  html1: false,
  html2: false,
});

const init = (fileToLoad) => {
  const config = {
    selector: '#editor',
    pagination: true,
    toolbar: '#toolbar',
    toolbarGroups: ['center'],
    onReady,
  }
  if (fileToLoad) config.document = { data: fileToLoad };
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
}

const exportDocx = () => {
  superdoc.value?.export();
};

// Manually calling the command to create a section
const addSection = (section) => {
  activeSections.value[section] = true;
  const html = loadedMockHTML[section];

  const id = section === 'html1' ? '1' : '2';
  editor.value.commands.createDocumentSection({
    title: `Section: ${section}`,
    id,
    description: 'This is a new section created from the button click from mock html data.',
    html,
  });

  const sectionId = `section${id}-editor`;
  const sectionContainer = document.getElementById(sectionId);
  const options = {
    element: sectionContainer,
    html,
  }

  const subEditor = SectionHelpers.getLinkedSectionEditor(id, options, editor.value);
}

const removeSection = (id) => {
  activeSections.value[`html${id}`] = false;
  editor.value.commands.removeSectionById(id);

  const element = document.getElementById(`section${id}-editor`);
  if (element) {
    element.innerHTML = ''; // Clear the section editor container
  };
}

const html1 = `<p>This is a custom HTML field.</p><p>You can edit this HTML as needed.</p>`;
const html2 = `<p>Another custom <i>HTML</i> field.</p>`;
const loadedMockHTML = {
  html1,
  html2,
}

const saveSectionsHTML = () => {
  const sections = SectionHelpers.exportSectionsToHTML(editor.value);
  console.log('Saving sections to DB:', sections);
}

const saveSectionsJSON = () => {
  const sections = SectionHelpers.exportSectionsToJSON(editor.value);
  console.log('Saving sections to DB:', sections);
}

const lockSection = (id) => {
  const isLocked = locks.value[`section${id}`];
  editor.value.commands.lockSectionById(id, isLocked);
}

onMounted(() => init());
</script>

<template>
  <div class="example-container">
    <h1>SuperDoc: Document section nodes</h1>

    <p>In this example, we explore the API for using document sections, specifically from previously-stored html or JSON for sections</p>
    <br />
    <div style="display: flex; flex-direction: column;">
      <p>This example uses the below initial HTML:</p>
      <p>section 1: <span style="font-family:'Courier New', Courier, monospace; user-select: none; pointer-events: none;">{{ html1 }}</span></p>
      <p>section 2: <span style="font-family:'Courier New', Courier, monospace; user-select: none; pointer-events: none;">{{ html2 }}</span></p>
    </div>
    <br />

    <div id="toolbar" class="my-custom-toolbar"></div>
    <div class="editor-and-button">
      <div class="editor-buttons fields" style="margin-right: 10px;">

        <!-- Section 1 -->
        <div class="question">
          <h3>Add section 1?</h3>

          <label for="section1-yes">
            <input
              type="radio"
              id="section1-yes"
              name="add-section-1"
              value="yes"
              @change="addSection('html1')"
            />
            Yes
          </label>

          <label for="section1-no">
            <input
              type="radio"
              id="section1-no"
              name="add-section-1"
              value="no"
              checked
              @change="removeSection('1')"
            />
            No
          </label>
          <div id="section1-editor" class="sub-editor"></div>
        </div>

        <!-- Section 2 -->
        <div class="question">
          <h3>Add section 2?</h3>

          <label for="section2-yes">
            <input
              type="radio"
              id="section2-yes"
              name="add-section-2"
              value="yes"
              @change="addSection('html2')"
            />
            Yes
          </label>

          <label for="section2-no">
            <input
              type="radio"
              id="section2-no"
              name="add-section-2"
              value="no"
              checked
              @change="removeSection('2')"
            />
            No
          </label>
          <!-- Locking will be added in a future iteration -->
          <!-- <div v-if="activeSections.html2" class="section-title">
            <label for="section2-lock" class="lock-toggle">
              <input
                type="checkbox"
                id="section2-lock"
                v-model="locks.section2"
                @change="lockSection('2')"
              />
              Lock
            </label>
          </div> -->
          <div id="section2-editor" class="sub-editor"></div>
        </div>

      </div>
      <div id="editor" class="main-editor"></div>
      <div class="editor-buttons">
        <UploadFile :update-file="handleFileUpdate" />
        <br />
        <br />
        <button class="custom-button" @click="exportDocx">Export docx</button>
        <button class="custom-button" @click="saveSectionsHTML">Save sections as HTML (console.log)</button>
        <button class="custom-button" @click="saveSectionsJSON">Save sections as JSON (console.log)</button>
      </div>
    </div>
  </div>
</template>

<style>
.section-title {
  display: flex;
  justify-content: space-between;
}
h3 {
  padding: 0;
  margin: 0;
}

.ProseMirror {
  outline: none;
  border: none;
}
.sub-editor {
  margin: 10px 0;
}
.sub-editor .ProseMirror {
  border: 1px solid #1355FF33;
  border-radius: 8px;
  padding: 10px;
  max-width: 250px;
  width: 250px;
}
p {
  margin: 0;
  padding: 0;
}
.fields > div {
  margin-bottom: 10px;
}
textarea {
  margin-left: 10px;
  margin-bottom: 10px;
  resize: none;
  border-radius: 5px;
  min-width: 200px;
  padding: 10px;
  min-height: 200px;
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
.editor-buttons {
  margin-top: 30px;
}
</style>
