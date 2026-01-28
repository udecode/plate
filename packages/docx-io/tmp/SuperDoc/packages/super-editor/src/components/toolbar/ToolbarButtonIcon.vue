<script setup>
import { computed } from 'vue';

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    default: null,
  },
  icon: {
    type: String,
    default: null,
  },
});

const getBarColor = computed(() => {
  if (props.name === 'color') return { backgroundColor: props.color || '#111111' };
  if (props.name === 'highlight') return { backgroundColor: props.color || '#D6D6D6' };
});

const hasColorBar = computed(() => {
  return ['color', 'highlight'].includes(props.name);
});
</script>

<template>
  <div class="toolbar-icon">
    <div class="toolbar-icon__icon" :class="[`toolbar-icon__icon--${props.name}`]" v-html="icon"></div>
    <div class="color-bar" v-if="hasColorBar" :style="getBarColor"></div>
  </div>
</template>

<style scoped>
.toolbar-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.toolbar-icon__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  height: 16px;
  &--highlight {
    width: 16px;
    margin-left: 3px;
    margin-bottom: 1px;
  }
}

.toolbar-icon__icon :deep(svg) {
  width: auto; /* needed for safari */
  max-height: 16px;
}

.toolbar-icon__icon--color :deep(svg) {
  max-height: 14px;
  margin-top: -3px;
}

.toolbar-button:hover {
  color: black;
  background-color: #d8dee5;
}
.toolbar-button:active,
.active {
  background-color: #c8d0d8;
}

.color-bar {
  border-radius: 4px;
  position: absolute;
  z-index: 5;
  height: 4px;
  left: 50%;
  bottom: 6px;
  transform: translateX(-50%);
  width: 16px;
}
</style>
