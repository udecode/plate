<script setup>
import '@harbour-enterprises/superdoc/style.css';
import { onMounted, shallowRef } from 'vue';
import { SuperDoc } from '@harbour-enterprises/superdoc';
import UploadFile from './UploadFile.vue';
import sampleDocument from '../assets/sample-document.docx?url';

// These custom SVG icons are in our public folder as an example. You should import in the correct way for your project.
import headphonesSVG from '/headphones-solid.svg?raw'; 
import chevronDownSVG from '/circle-chevron-down-solid.svg?raw';

// This is our custom mark that we are creating for this example
import { CustomMark } from './custom-mark.js';


/** Customization of toolbar buttons with custom button, icon */
const customButton = {
  type: 'button',
  name: 'insertCustomMark',

  // Since this command is already in editor.commands (from the custom-mark extension), we can use the command name directly
  command: 'setMyCustomMark',

  tooltip: 'Insert Custom Mark',
  group: 'center',
  icon: headphonesSVG, // You can use a custom icon here
};

const customButtonUsingCustomFunction = {
  type: 'button',
  name: 'insertCustomMark',

  // We can also pass in a function as the command
  command: () => {
    const id = Math.random().toString(36).substring(2, 7);
    return superdoc.value?.activeEditor?.commands.setMyCustomMark(id);
  },

  tooltip: 'Insert Custom Mark',
  group: 'center',
  icon: headphonesSVG, // You can use a custom icon here
};

const customDropDown = {
  type: 'dropdown',
  name: 'customDropdown',
  command: ({ item, option }) => {
    if (!item || !option) return; // Case where the dropdown is being expanded or collapsed but no option selected

    const { key, label } = option; // This is from the options array defined below

    // Do something with the selected option here
    // For example, we can call a command or a custom function based on the key
    console.log(`[customDropDown Selected option: ${label} (key: ${key})`);
    if (key === 'custom-mark') {
      superdoc.value?.activeEditor?.commands.setMyCustomMark();
    } else if (key === 'export-docx') {
      exportDocx();
    }
  },
  tooltip: 'Custom Dropdown',
  group: 'center',
  icon: chevronDownSVG,
  hasCaret: true,
  suppressActiveHighlight: true,
  options: [
    { label: 'Insert Custom Mark', key: 'custom-mark', },
    { label: 'Export to DOCX', key: 'export-docx', },
  ],
};

const superdoc = shallowRef(null);
const init = (fileToLoad) => {
  const config = {
    selector: '#editor', // Can also be a class ie: .main-editor

    pagination: true,

    rulers: true,

    editorExtensions: [CustomMark],
    onReady: myCustomOnReady,

    modules: {
      // Customize the toolbar
      toolbar: {
        selector: '#toolbar',
        toulbarGroups: ['center'],

        // You can pass in custom buttons here
        customButtons: [
          customButton,
          customButtonUsingCustomFunction,
          customDropDown,
        ],
      }

    }
  };

  if (fileToLoad) config.document = { data: fileToLoad };
  // config.document = sampleDocument; // or try sample document

  superdoc.value = new SuperDoc(config);
};


/**
 * When SuperDoc is ready, we can listen for updates coming from the editor.
 */
const myCustomOnReady = () => {
  superdoc.value?.activeEditor?.on('update', async ({ editor }) => {
    // Let's log the HTML representation of the editor on each update;
    console.log('Content updated: ', editor.getHTML());
  });
}

/**
 * This is an example of how to export the content of the editor to a DOCX file.
 * @param { Editor } editor - The editor instance.
 * @returns { Promise<void> } - A promise that resolves when the export is complete.
 */
const exportToDocx = async (editor) => {
  const docx = await editor.exportDocx();
  console.debug('Exported to DOCX - we have a blob now: ', docx);
};

const insertCustomMark = () => {
  const randomId = Math.random().toString(36).substring(2, 7);
  superdoc.value?.activeEditor?.commands.setMyCustomMark(randomId);
};

const exportDocx = () => {
  superdoc.value?.export({
    exportType: ['docx']
  });
};

const handleFileUpdate = (file) => {
  // Handle file update logic here
  console.log('File updated:', file);
  superdoc.value?.destroy();

  init(file);
};

onMounted(() => init());
</script>

<template>
  <div class="example-container">
    <h1>SuperDoc: Create a custom mark with custom command</h1>

    <p>In this example, we create a simple custom mark to pass into SuperDoc.</p>

    <div id="toolbar" class="my-custom-toolbar"></div>
    <div class="editor-and-button">
      <div id="editor" class="main-editor"></div>
      <div class="editor-buttons">
        <UploadFile :update-file="handleFileUpdate" />
        <button class="custom-button" @click="insertCustomMark">Insert custom mark</button>
        <button class="custom-button" @click="exportDocx">Export</button>
      </div>
    </div>
  </div>
</template>
