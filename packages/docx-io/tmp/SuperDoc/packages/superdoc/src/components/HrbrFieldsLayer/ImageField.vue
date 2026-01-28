<script setup>
import { computed } from 'vue';

const props = defineProps({
  field: {
    type: Object,
    required: true,
  },
  isEditing: {
    type: Boolean,
    required: false,
    default: false,
  },
  styleOverride: {
    type: Object,
    required: false,
    default: () => ({}),
  },
  optionId: {
    type: String,
    required: true,
  },
  noStyle: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const getStyle = computed(() => {
  return {
    maxHeight: props.styleOverride.coordinates?.minHeight,
    maxWidth: props.styleOverride.coordinates?.minWidth,
  };
});

const imageValue = computed(() => {
  if (props.field.valueGetter && typeof props.field.valueGetter === 'function') {
    return props.field.valueGetter({ annotationId: props.optionId });
  }
  if (typeof props.field.value === 'string') return props.field.value;
});
</script>

<template>
  <div class="image-field" :style="getStyle">
    <img v-if="field.value && imageValue" :src="imageValue" alt="image" :style="getStyle" />
    <span v-else-if="!noStyle">{{ field.placeholder || field.label }}</span>
  </div>
</template>

<style scoped>
.image-field {
  overflow: hidden;
  display: flex;
  align-items: center;
  margin-top: 2px;
}

img {
  max-height: 100%;
}
</style>
