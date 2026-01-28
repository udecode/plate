<script setup>
import { onMounted } from 'vue';
import DocumentMapItem from './DocumentMapItem.vue';

const emit = defineEmits(['reorder']);
const props = defineProps({
  documentMapData: {
    type: Array,
    required: true
  },
  editor: {
    type: Object,
    required: true
  }
});

const handleItemDrop = ({ draggedItem, targetItem }) => {
  // Find indexes of draggedItem and targetItem
  const draggedIndex = props.documentMapData.findIndex(i => i.id === draggedItem.id);
  const targetIndex = props.documentMapData.findIndex(i => i.id === targetItem.id);

  if (draggedIndex > -1 && targetIndex > -1) {
    emit('reorder', { draggedIndex, targetIndex })
  }
};

const handleContentSync = ({ item, editor: contentEditor }) => {
  const result = props.editor.commands.syncContent({ item, contentEditor } );
}

const handleBlur = () => {
  props.editor.commands.updateDocumentMap();
}

</script>

<template>
  <div class="document-map">
    <ul>
      <document-map-item
        @item-drop="handleItemDrop"
        @content-sync="handleContentSync"
        @blur="handleBlur"
        v-for="item in documentMapData"
        :key="item.id"
        :item="item"
      />
    </ul>
  </div>
</template>
