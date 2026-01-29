<script setup>
import { onMounted, onBeforeUnmount, ref, watch, computed } from 'vue';
import { moveCursorToMouseEvent } from '../cursor-helpers.js';

const props = defineProps({
  editor: { type: Object, required: true },
  styles: { type: Object, default: () => ({}) },
  visible: { type: Boolean, default: false },
  position: { type: Object, default: () => ({ left: '0px', top: '0px' }) },
});
const emit = defineEmits(['close']);

const popover = ref(null);

function handleClickOutside(event) {
  if (popover.value && !popover.value.contains(event.target)) {
    emit('close');
  }

  // Move the cursor to the new click location
  // Same logic as in Slash Menu (might be able to combine similar logic)
  moveCursorToMouseEvent(event, props.editor);
}

function handleEscape(event) {
  if (event.key === 'Escape') {
    emit('close');
  }
}

watch(
  () => props.visible,
  (val) => {
    if (val) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    }
  },
);

onMounted(() => {
  if (props.visible) {
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
  }
});
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside);
  document.removeEventListener('keydown', handleEscape);
});

const derivedStyles = computed(() => ({
  left: props.position.left,
  top: props.position.top,
  ...props.styles,
}));
</script>

<template>
  <div v-if="visible" class="generic-popover" :style="derivedStyles" ref="popover" @mousedown.stop @click.stop>
    <slot />
  </div>
</template>
<style scoped>
/* @remarks - popover adds a slight shadow, this can be removed if needed */
.generic-popover {
  /* @remarks - this should ideally be handled by the content or component - but some are missing */
  background-color: white;
  position: absolute;
  z-index: 1000;
  border-radius: 6px;
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.05),
    0px 10px 20px rgba(0, 0, 0, 0.1);
  min-width: 120px;
  min-height: 40px;
}
</style>
