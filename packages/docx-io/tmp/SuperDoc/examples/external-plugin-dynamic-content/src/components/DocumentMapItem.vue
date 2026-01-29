<script setup>
import { computed, onMounted, ref, shallowRef, watch, nextTick } from 'vue';
import { Editor as SuperDocEditor, getRichTextExtensions } from '@harbour-enterprises/superdoc';

const emit = defineEmits(['item-click', 'item-drop', 'content-sync', 'blur', 'lock']);
const props = defineProps({
  item: {
    type: Object,
    required: true
  },
});

const activeTab = ref('superdoc');
const currentText = ref('test');
const isActive = ref(false);
const showHtml = ref(false);
const superdoc = shallowRef(null);
const editor = shallowRef(null);
const editorElem = ref(null);
const itemId = `editorItem-${Math.random().toString(36).substring(7)}`;

const hasChildren = computed(() => {
  return props.item.children && props.item.children.length > 0;
});

const handleDragStart = (item, event) => {
  event.dataTransfer.setData('application/json', JSON.stringify(item));
};

const handleDrop = (targetItem, event) => {
  const draggedItem = JSON.parse(event.dataTransfer.getData('application/json'));
  emit('item-drop', { draggedItem, targetItem });
};

const onUpdate = ({ editor: currentEditor, transaction }) => {
  if (transaction.docChanged) {
    emit('content-sync', { editor: currentEditor, item: props.item });

    const newText = currentEditor.getHTML();
    currentText.value = newText;
    editorElem.value.focus();
  };
};

const onBlur = ({ editor, transaction }) => {
  emit('blur');
}

const initEditor = (initialContent, sourceType = 'json') => {
  if (editor.value) editor.value.destroy();

  let div;
  if (sourceType === 'html') {
    div = document.createElement('div');
    div.innerHTML = initialContent ? initialContent : props.item.html;
  }

  editor.value = new SuperDocEditor({
    mode: 'text',
    content: sourceType === 'html' ? div : props.item.json,
    loadFromSchema: sourceType === 'json' ? true : false,
    element: editorElem.value,
    onUpdate,
    onBlur,
  });

  div?.remove();
};

watch(() => props.item, (newItem, oldItem) => {
  currentText.value = props.item.html;
  initEditor(props.item.json, 'json');
  }, { deep: true }
);

onMounted(() => {
  initEditor();
  currentText.value = props.item.html;
});
</script>

<template>
  <li class="document-map-item" :key="item.id" @click="isActive = !isActive">
      <div class="document-map-list"
        @click="emit('item-click', item)"
        draggable="true"
        @dragstart="handleDragStart(item, $event)"
        @dragover.prevent
        @drop="handleDrop(item, $event)">
        <div class="chevron" :class="{ 'has-children': hasChildren }">&rsaquo;</div>
        <div class="document-map-item-text" v-html="currentText"></div>
      </div>

    <div class="editor-container" v-show="isActive" >
      <div>
        <div id="toolbar" class="sd-toolbar"></div>
        <div class="sub-editor" ref="editorElem" @click.stop.prevent></div>
      </div>
    </div>

    <ul v-if="hasChildren">
      <document-map-item
        v-for="child in item.children"
        :key="child.id"
        :item="child"
      />
    </ul>
  </li>
</template>

<style>
.sub-editor .ProseMirror {
  max-height: 180px;
  height: 180px;
  padding: 5px 10px;
  width: 350px;
  outline: none;
  overflow: auto;
}
</style>

<style scoped>
.lock {
  position: absolute;
  left: -13px;
  top: 2px;
}
button {
  padding: 4px 8px;
  border-radius: 8px;
  background-color: white;
  outline: none;
  border: 1px solid #DBDBDB;
  margin-bottom: 5px;
  cursor: pointer;
}
.tabs { 
  margin-top: 10px;
  display: flex;
}
.tabs .tab {
  padding: 5px;
  cursor: pointer;
  background-color: #a7a7a7;
  border-radius: 8px;
  margin-right: 10px;
}
.tab:hover {
  background-color: #DBDBDB;
}
.active-tab {
  background-color: rgb(255, 255, 255) !important;
}
.editor-container {
  display: flex;
  flex-direction: column;
}
.disabled {
  opacity: 0.5;
  user-select: none;
  pointer-events: none;
}
.sub-editor {
  margin: 10px 0;
  box-sizing: border-box;
  max-width: 350px;
  min-width: 350px;
  max-height: 200px;
  min-height: 200px;
  height: 200px;
  display: flex;
  justify-content: center;
  padding: 10px 5px;
  border-radius: 8px;
  background-color: white;
}
.document-map-item {
  position: relative;
  box-sizing: border-box;
  max-width: 100%;
  margin: 10px;
}
.document-map-list {
  display: flex;
  align-items: center;
  padding: 2px 4px;
  border-radius: 8px;
  cursor: pointer;
}
.document-map-list:hover {
  background-color: #f0f0f0;
}
.chevron {
  margin-right: 8px;
}
.has-children {
  transform: rotate(0deg);
}
.document-map-item-text {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
