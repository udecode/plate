<script setup>
import ToolbarButtonIcon from './ToolbarButtonIcon.vue';
import { ref, computed, nextTick } from 'vue';
import { toolbarIcons } from './toolbarIcons.js';
import { useHighContrastMode } from '../../composables/use-high-contrast-mode';
const emit = defineEmits(['buttonClick', 'textSubmit']);

const props = defineProps({
  iconColor: {
    type: String,
    default: null,
  },
  active: {
    type: Boolean,
    default: false,
  },
  isNarrow: {
    type: Boolean,
    default: false,
  },
  isWide: {
    type: Boolean,
    default: false,
  },
  toolbarItem: {
    type: Object,
    required: true,
  },
  defaultLabel: {
    type: String,
    default: null,
  },
  isOverflowItem: {
    type: Boolean,
    default: false,
  },
});

const {
  name,
  active,
  icon,
  label,
  hideLabel,
  iconColor,
  hasCaret,
  disabled,
  inlineTextInputVisible,
  hasInlineTextInput,
  minWidth,
  style,
  attributes,
} = props.toolbarItem;

const inlineTextInput = ref(label);
const inlineInput = ref(null);
const { isHighContrastMode } = useHighContrastMode();

const handleClick = () => {
  if (hasInlineTextInput) {
    nextTick(() => {
      inlineInput.value?.focus();
      inlineInput.value?.select();
    });
  }
  emit('buttonClick');
};

const handleInputSubmit = () => {
  const value = inlineTextInput.value;
  const cleanValue = value.replace(/[^0-9]/g, '');
  emit('textSubmit', cleanValue);
  inlineTextInput.value = cleanValue;
};

const getStyle = computed(() => {
  if (style.value) return style.value;
  return {
    minWidth: props.minWidth,
  };
});

const onFontSizeInput = (event) => {
  let { value } = event.target;
  inlineTextInput.value = value.replace(/[^0-9]/g, '');
};

const caretIcon = computed(() => {
  return active.value ? toolbarIcons.dropdownCaretUp : toolbarIcons.dropdownCaretDown;
});
</script>

<template>
  <div
    :class="['toolbar-item', attributes.className]"
    :style="getStyle"
    :role="isOverflowItem ? 'menuitem' : 'button'"
    :aria-label="attributes.ariaLabel"
    @click="handleClick"
    @keydown.enter.stop="handleClick"
    tabindex="0"
  >
    <div
      class="toolbar-button"
      :class="{
        active,
        disabled,
        narrow: isNarrow,
        wide: isWide,
        'has-inline-text-input': hasInlineTextInput,
        'high-contrast': isHighContrastMode,
      }"
      :data-item="`btn-${name || ''}`"
    >
      <ToolbarButtonIcon v-if="icon" :color="iconColor" class="toolbar-icon" :icon="icon" :name="name">
      </ToolbarButtonIcon>

      <div class="button-label" v-if="label && !hideLabel && !inlineTextInputVisible">
        {{ label }}
      </div>

      <span v-if="inlineTextInputVisible">
        <input
          v-if="name === 'fontSize'"
          v-model="inlineTextInput"
          @keydown.enter.prevent="handleInputSubmit"
          type="text"
          class="button-text-input"
          :class="{ 'high-contrast': isHighContrastMode }"
          :id="'inlineTextInput-' + name"
          autocomplete="off"
          ref="inlineInput"
        />
        <input
          v-else
          v-model="inlineTextInput"
          :placeholder="label"
          @keydown.enter.prevent="handleInputSubmit"
          type="text"
          class="button-text-input"
          :id="'inlineTextInput-' + name"
          autocomplete="off"
          ref="inlineInput"
        />
      </span>

      <div v-if="hasCaret" class="dropdown-caret" v-html="caretIcon" :style="{ opacity: disabled ? 0.6 : 1 }"></div>

      <div aria-live="polite" class="visually-hidden">
        {{ `${attributes.ariaLabel} ${active ? 'selected' : 'unset'}` }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.toolbar-item {
  position: relative;
  z-index: 1;
  min-width: 30px;
  margin: 0 1px;
}

.visually-hidden {
  position: absolute;
  left: -9999px;
  height: 1px;
  width: 1px;
  overflow: hidden;
}

.toolbar-button {
  padding: 5px;
  height: 32px;
  max-height: 32px;
  border-radius: 6px;
  overflow-y: visible;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #47484a;
  transition: all 0.2s ease-out;
  user-select: none;
  position: relative;
  box-sizing: border-box;
}

.toolbar-button:hover {
  background-color: #dbdbdb;

  .toolbar-icon {
    &.high-contrast {
      color: #fff;
    }
  }

  &.high-contrast {
    background-color: #000;
    color: #fff;
  }
}

.toolbar-button:active,
.active {
  background-color: #c8d0d8;
}

.button-label {
  overflow: hidden;
  width: 100%;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 400;
  font-size: 15px;
  margin: 5px;
}

.toolbar-icon + .dropdown-caret {
  margin-left: 4px;
}

.left,
.right {
  width: 50%;
  height: 100%;
  background-color: #dbdbdb;
  border-radius: 60%;
}

.has-inline-text-input:hover {
  cursor: text;
}

.disabled {
  cursor: default;
}

.disabled:hover {
  cursor: default;
  background-color: initial;
}

.disabled .toolbar-icon,
.disabled .caret,
.disabled .button-label {
  opacity: 0.35;
}

.caret {
  font-size: 1em;
  padding-left: 2px;
  padding-right: 2px;
}

.button-text-input {
  color: #47484a;
  border-radius: 4px;
  text-align: center;
  width: 30px;
  font-size: 14px;
  margin-right: 5px;
  font-weight: 400;
  background-color: transparent;
  padding: 2px 0;
  outline: none;
  border: 1px solid #d8dee5;
  box-sizing: border-box;

  &.high-contrast {
    background-color: #fff;
  }
}

.button-text-input::placeholder {
  color: #47484a;
}

.dropdown-caret {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: auto;
  width: 10px;
  height: 10px;
}

@media (max-width: 1280px) {
  .toolbar-item--doc-mode .button-label {
    display: none;
  }

  .toolbar-item--doc-mode .toolbar-icon {
    margin-right: 5px;
  }

  .toolbar-item--linked-styles {
    width: auto !important;
  }

  .toolbar-item--linked-styles .button-label {
    display: none;
  }
}
</style>
