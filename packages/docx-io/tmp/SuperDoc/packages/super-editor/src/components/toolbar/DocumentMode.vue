<script setup>
import { ref, onMounted } from 'vue';
import { useHighContrastMode } from '../../composables/use-high-contrast-mode';

const emit = defineEmits(['select']);

const documentModeRefs = ref([]);
const { isHighContrastMode } = useHighContrastMode();

const props = defineProps({
  options: {
    type: Array,
  },
});

const handleClick = (item) => {
  emit('select', item);
};

const moveToNextOption = (index) => {
  if (index === documentModeRefs.value.length - 1) return;
  const nextOption = documentModeRefs.value[index + 1];
  if (nextOption) {
    nextOption.setAttribute('tabindex', '0');
    nextOption.focus();
  }
};

const moveToPreviousOption = (index) => {
  if (index === 0) return;
  const previousOption = documentModeRefs.value[index - 1];
  if (previousOption) {
    previousOption.setAttribute('tabindex', '0');
    previousOption.focus();
  }
};

const handleKeyDown = (e, index) => {
  switch (e.key) {
    case 'ArrowDown':
      moveToNextOption(index);
      break;
    case 'ArrowUp':
      moveToPreviousOption(index);
      break;
    case 'Enter':
      handleClick(props.options[index]);
      break;
    default:
      break;
  }
};

onMounted(() => {
  // Focus on the first option
  documentModeRefs.value[0].setAttribute('tabindex', '0');
  documentModeRefs.value[0].focus();
});
</script>

<template>
  <div class="document-mode" :class="{ 'high-contrast': isHighContrastMode }">
    <div
      class="option-item"
      v-for="(option, index) in options"
      @click="handleClick(option)"
      :class="{ disabled: option.disabled }"
      data-item="btn-documentMode-option"
      role="menuitem"
      ref="documentModeRefs"
      @keydown.prevent="(event) => handleKeyDown(event, index)"
    >
      <div class="document-mode-column icon-column">
        <div class="icon-column__icon" v-html="option.icon"></div>
      </div>

      <div class="document-mode-column text-column">
        <div class="document-mode-type">
          {{ option.label }}
        </div>
        <div class="document-mode-description">
          {{ option.description }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.document-mode {
  display: flex;
  flex-direction: column;
  padding: 10px;
  box-sizing: border-box;

  :deep(svg) {
    width: 100%;
    height: 100%;
    display: block;
    fill: currentColor;
  }

  .option-item {
    display: flex;
    flex-direction: row;
    background-color: white;
    padding: 10px;
    border-radius: 4px;
    cursor: pointer;
    box-sizing: border-box;

    &:hover {
      background-color: #c8d0d8;
    }
  }

  &.high-contrast {
    .option-item {
      &:hover {
        background-color: #000;
        color: #fff;

        .icon-column__icon {
          color: #fff;
        }

        .text-column {
          > .document-mode-type,
          > .document-mode-description {
            color: #fff;
          }
        }
      }
    }
  }
}

.disabled {
  opacity: 0.5;
  cursor: not-allowed !important;
  pointer-events: none;
}
.document-mode-column {
  display: flex;
  flex-direction: column;
}

.document-mode-type {
  font-weight: 400;
  font-size: 15px;
  color: #222;
}

.icon-column {
  margin-right: 5px;
  justify-content: flex-start;
  align-items: center;
  padding: 0 5px;
  color: black;
  height: 100%;
  box-sizing: border-box;

  &__icon {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
    height: 18px;
    color: #47484a;
  }
}

.icon-column__icon :deep(svg) {
  width: auto;
  /* needed for safari */
  max-height: 18px;
}

.document-mode-description {
  font-size: 12px;
  color: #666;
}
</style>
