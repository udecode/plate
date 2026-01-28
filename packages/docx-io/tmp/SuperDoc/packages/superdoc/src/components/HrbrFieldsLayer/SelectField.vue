<script setup>
import { computed } from 'vue';
import { NSelect } from 'naive-ui';

const props = defineProps({
  field: {
    type: Object,
    required: true,
  },
  fieldStyle: {
    type: Object,
    required: false,
    default: () => ({}),
  },
  styleOverride: {
    type: Object,
    required: false,
    default: () => ({}),
  },
});

const getStyle = computed(() => {
  if (!props.isEditing) return { ...props.styleOverride };
});
</script>

<template>
  <div :style="getStyle" class="select-container">
    <div v-if="!props.isEditing">{{ field.value || field.placeholder }}</div>
  </div>
</template>

<style scoped>
.select-container {
  padding: 1px;
}
</style>
