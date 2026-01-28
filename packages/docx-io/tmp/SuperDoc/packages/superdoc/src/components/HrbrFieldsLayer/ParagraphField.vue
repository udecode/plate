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
  return {
    fontSize: '11pt',
  };
});
</script>

<template>
  <div class="paragraph-field" v-if="field.value" v-html="field.value"></div>
  <span :style="getStyle" v-else>{{ field.placeholder || field.label }}</span>
</template>

<style scoped>
.paragraph-field {
  margin: 0;
  padding: 1px;
}
</style>
