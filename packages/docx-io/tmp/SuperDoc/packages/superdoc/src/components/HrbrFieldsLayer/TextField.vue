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
});

const getStyle = computed(() => {
  const style = { ...props.styleOverride };
  if (!props.isEditing) return style;

  // Custom style for text field if editing is enabled
  style.backgroundColor = '#FFF';
  return style;
});

const handleBlur = (e) => {
  props.field.value.value = e;
};
</script>

<template>
  <div class="text-field" :style="getStyle">
    {{ field.value || field.placeholder }}
  </div>
</template>

<style scoped>
.text-field {
  white-space: nowrap;
  height: 100%;
  width: 100%;
  border-radius: 2px;
  margin: 0;
  display: flex;
  align-items: center;
}
</style>
