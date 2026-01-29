<script setup>
import { computed, onMounted, ref } from 'vue';
import { toolbarIcons } from './toolbarIcons.js';

const emit = defineEmits(['select', 'clickoutside']);
const props = defineProps({
  icons: {
    type: Array,
    required: true,
  },
  activeColor: {
    type: Object,
    required: false,
  },
});

const isActive = computed(() => (option) => {
  if (!props.activeColor.value) return false;
  return props.activeColor.value.toUpperCase() === option.value;
});

const getCheckStyle = (color, optionIndex) => {
  const lightColors = ['#FFFFFF', '#FAFF09'];
  if (optionIndex === 5 || lightColors.includes(color)) return { color: '#000' };
  return { color: '#FFF' };
};

const handleClick = (option) => {
  emit('select', option.value);
};

const rowRefs = ref([]);
const iconRefs = ref([]);

const ROW_SIZE = 7;
onMounted(() => {
  const isMatrix = props.icons.every((row) => Array.isArray(row));
  if (!isMatrix) throw new Error('icon props must be 2d array');

  // Focus on the first icon
  const firstIcon = iconRefs.value[0];
  if (firstIcon) {
    firstIcon.setAttribute('tabindex', '0');
    firstIcon.focus();
  }
});

const moveToNextIcon = (rowIndex, optionIndex) => {
  const iconIndex = ROW_SIZE * rowIndex + optionIndex + 1;
  const nextIcon = iconRefs.value[iconIndex];
  if (nextIcon) {
    nextIcon.setAttribute('tabindex', '0');
    nextIcon.focus();
  }
};

const moveToPreviousIcon = (rowIndex, optionIndex) => {
  const iconIndex = ROW_SIZE * rowIndex + optionIndex - 1;
  const previousIcon = iconRefs.value[iconIndex];
  if (previousIcon) {
    previousIcon.setAttribute('tabindex', '0');
    previousIcon.focus();
  }
};

const moveToNextRow = (rowIndex, optionIndex) => {
  const iconIndex = optionIndex + ROW_SIZE * (rowIndex + 1);
  const nextIcon = iconRefs.value[iconIndex];
  if (nextIcon) {
    nextIcon.setAttribute('tabindex', '0');
    nextIcon.focus();
  }
};

const moveToPreviousRow = (rowIndex, optionIndex) => {
  const iconIndex = optionIndex + ROW_SIZE * (rowIndex - 1);
  const previousIcon = iconRefs.value[iconIndex];
  if (previousIcon) {
    previousIcon.setAttribute('tabindex', '0');
    previousIcon.focus();
  }
};

const handleKeyDown = (event, rowIndex, optionIndex, option) => {
  switch (event.key) {
    case 'ArrowRight':
      moveToNextIcon(rowIndex, optionIndex);
      break;
    case 'ArrowLeft':
      moveToPreviousIcon(rowIndex, optionIndex);
      break;
    case 'ArrowDown':
      moveToNextRow(rowIndex, optionIndex);
      break;
    case 'ArrowUp':
      moveToPreviousRow(rowIndex, optionIndex);
      break;
    case 'Enter':
      handleClick(option);
      break;
    case 'Escape':
      emit('clickoutside');
      break;
    default:
      break;
  }
};
</script>
<template>
  <div class="option-row" v-for="(row, rowIndex) in icons" :key="rowIndex" role="group" ref="rowRefs">
    <div
      class="option"
      v-for="(option, optionIndex) in row"
      :key="optionIndex"
      :aria-label="option.label"
      role="menuitem"
      ref="iconRefs"
      @click.stop.prevent="handleClick(option)"
      @keydown.prevent="(event) => handleKeyDown(event, rowIndex, optionIndex, option)"
    >
      <div class="option__icon" v-html="option.icon" :style="option.style"></div>

      <div
        v-if="isActive(option)"
        class="option__check"
        v-html="toolbarIcons.colorOptionCheck"
        :style="getCheckStyle(option.value, optionIndex)"
      ></div>
    </div>
  </div>
</template>

<style scoped>
.option-row {
  display: flex;
  flex-direction: row;
}
.option {
  border-radius: 50%;
  cursor: pointer;
  padding: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-sizing: border-box;
}

.option:hover {
  background-color: #dbdbdb;
}

.option__icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.option__check {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  position: absolute;
}
</style>
