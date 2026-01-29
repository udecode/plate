<script setup>
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import { useHrbrFieldsStore } from '@superdoc/stores/hrbr-fields-store';
import { useSuperdocStore } from '@superdoc/stores/superdoc-store';

const hrbrFieldsStore = useHrbrFieldsStore();
const { getAnnotations } = storeToRefs(hrbrFieldsStore);
const { fieldComponentsMap, getField } = hrbrFieldsStore;

const props = defineProps({
  fields: {
    type: Object,
    required: true,
  },
});

const getStyle = computed(() => (entry) => {
  const { coordinates, field } = entry;

  // Adjust for padding
  const adjustTypes = ['TEXTINPUT', 'SELECT'];
  if (adjustTypes.includes(field.fieldType)) {
    const top = coordinates.top.split('px')[0];
    const newTop = top - 4;
    coordinates.top = `${newTop}px`;
  }

  const widthAdjustTypes = ['HTMLINPUT'];
  if (widthAdjustTypes.includes(field.fieldType)) {
    const scaleFactor = 1.3362445414847162;
    const minWidthNum = coordinates.minWidth.split('px')[0];
    const newWidth = minWidthNum / scaleFactor;
    coordinates.width = `${newWidth}px`;
  }

  return {
    position: 'absolute',
    //field,
    ...coordinates,
    lineHeight: 1,
  };
});

const getAnnotationWithField = computed(() => {
  const annotationsWithFields = [];

  getAnnotations.value.forEach((annotation) => {
    const field = getField(annotation.documentId, annotation.fieldId);
    if (!field) return;
    annotationsWithFields.push({ ...annotation, field });
  });

  return annotationsWithFields;
});
</script>

<template>
  <div class="main-container">
    <div
      v-for="entry in getAnnotationWithField"
      :style="getStyle(entry)"
      class="field-container"
      :class="{ 'field-container--no-style': entry.nostyle }"
    >
      <component
        class="field-component"
        :is="fieldComponentsMap[entry.field.fieldType]"
        :field="entry.field"
        :style-override="entry.style"
        :option-id="entry.originalAnnotationId"
        :no-style="entry.nostyle"
        :is-editing="false"
      />
    </div>
  </div>
</template>

<style scoped>
.field-container {
  border-radius: 2px;
  background-color: #efd0f0 !important;
  border: 2px solid #b015b3;
}

.field-container--no-style {
  background: none !important;
  border-color: transparent;
}
</style>
