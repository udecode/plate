<script setup>
import { onMounted, ref, watch } from 'vue';
import { useHighContrastMode } from '../../composables/use-high-contrast-mode';

import { toolbarIcons } from './toolbarIcons.js';

const { isHighContrastMode } = useHighContrastMode();
const emit = defineEmits(['select']);

const alignmentButtonsRefs = ref([]);
const alignmentButtons = [
  {
    key: 'left',
    ariaLabel: 'Align left',
    icon: toolbarIcons.alignLeft,
  },
  {
    key: 'center',
    ariaLabel: 'Align center',
    icon: toolbarIcons.alignCenter,
  },
  {
    key: 'right',
    ariaLabel: 'Align right',
    icon: toolbarIcons.alignRight,
  },
  {
    key: 'justify',
    ariaLabel: 'Justify',
    icon: toolbarIcons.alignJustify,
  },
];
const select = (alignment) => {
  emit('select', alignment);
};

const moveToNextButton = (index) => {
  if (index === alignmentButtonsRefs.value.length - 1) return;
  const nextButton = alignmentButtonsRefs.value[index + 1];
  if (nextButton) {
    nextButton.setAttribute('tabindex', '0');
    nextButton.focus();
  }
};

const moveToPreviousButton = (index) => {
  if (index === 0) return;
  const previousButton = alignmentButtonsRefs.value[index - 1];
  if (previousButton) {
    previousButton.setAttribute('tabindex', '0');
    previousButton.focus();
  }
};

const handleKeyDown = (e, index) => {
  switch (e.key) {
    case 'ArrowLeft':
      moveToPreviousButton(index);
      break;
    case 'ArrowRight':
      moveToNextButton(index);
      break;
    case 'Enter':
      select(alignmentButtons[index].key);
      break;
    default:
      break;
  }
};
onMounted(() => {
  // Focus on the first button
  const firstButton = alignmentButtonsRefs.value[0];
  if (firstButton) {
    firstButton.setAttribute('tabindex', '0');
    firstButton.focus();
  }
});
</script>

<template>
  <div class="alignment-buttons" :class="{ 'high-contrast': isHighContrastMode }">
    <div
      v-for="(button, index) in alignmentButtons"
      :key="button.key"
      class="button-icon"
      @click="select(button.key)"
      v-html="button.icon"
      data-item="btn-textAlign-option"
      role="menuitem"
      :aria-label="button.ariaLabel"
      ref="alignmentButtonsRefs"
      @keydown.prevent="(event) => handleKeyDown(event, index)"
    ></div>
  </div>
</template>

<style scoped>
.alignment-buttons {
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 8px;
  box-sizing: border-box;

  .button-icon {
    cursor: pointer;
    padding: 5px;
    font-size: 16px;
    width: 25px;
    height: 25px;
    border-radius: 4px;
    display: flex;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;

    &:hover {
      background-color: #d8dee5;
    }

    :deep(svg) {
      width: 100%;
      height: 100%;
      display: block;
      fill: currentColor;
    }
  }

  &.high-contrast {
    .button-icon {
      &:hover {
        background-color: #000;
        color: #fff;
      }
    }
  }
}
</style>
