<script setup>
import { computed, ref, h } from 'vue';
import ToolbarButton from './ToolbarButton.vue';
import ToolbarSeparator from './ToolbarSeparator.vue';
import OverflowMenu from './OverflowMenu.vue';
import { NDropdown, NTooltip, NSelect } from 'naive-ui';
import { useHighContrastMode } from '../../composables/use-high-contrast-mode';

const emit = defineEmits(['command']);

const toolbarItemRefs = ref([]);
const props = defineProps({
  toolbarItems: {
    type: Array,
    required: true,
  },
  overflowItems: {
    type: Array,
    default: () => [],
  },
  position: {
    type: String,
    default: 'left',
  },
  fromOverflow: {
    type: Boolean,
    default: false,
  },
});

const currentItem = ref(null);
const { isHighContrastMode } = useHighContrastMode();
// Matches media query from SuperDoc.vue
const isMobile = window.matchMedia('(max-width: 768px)').matches;
const styleMap = {
  left: {
    minWidth: '120px',
    justifyContent: 'flex-start',
  },
  right: {
    minWidth: '120px',
    justifyContent: 'flex-end',
  },
  default: {
    // Only grow if not on a mobile device
    flexGrow: isMobile ? 0 : 1,
    justifyContent: 'center',
  },
};

const getPositionStyle = computed(() => {
  return styleMap[props.position] || styleMap.default;
});

const isButton = (item) => item.type === 'button';
const isDropdown = (item) => item.type === 'dropdown';
const isSeparator = (item) => item.type === 'separator';
const isOverflow = (item) => item.type === 'overflow';
const handleToolbarButtonClick = (item, argument = null) => {
  emit('item-clicked');
  currentItem.value = item;
  currentItem.value.expand = !currentItem.value.expand;
  if (item.disabled.value) return;
  emit('command', { item, argument });
};

const handleToolbarButtonTextSubmit = (item, argument) => {
  if (item.disabled.value) return;
  currentItem.value = null;
  emit('command', { item, argument });
};

const closeDropdowns = () => {
  if (!currentItem.value) return;
  currentItem.value.expand = false;
  currentItem.value = null;
};

const selectedOption = ref(null);
const handleSelect = (item, option) => {
  closeDropdowns();
  const value = item.dropdownValueKey.value ? option[item.dropdownValueKey.value] : option.label;
  emit('command', { item, argument: value, option });
  selectedOption.value = option.key;
};

const dropdownOptions = (item) => {
  if (!item.nestedOptions?.value?.length) return [];
  return item.nestedOptions.value.map((option) => {
    return {
      ...option,
      props: {
        ...option.props,
        class: selectedOption.value === option.key ? 'selected' : '',
      },
    };
  });
};

const getDropdownAttributes = (option, item) => {
  return {
    role: 'menuitem',
    ariaLabel: `${item.attributes.value.ariaLabel} - ${option.label}`,
  };
};

const handleClickOutside = (e) => {
  closeDropdowns();
};

const moveToNextButton = (e) => {
  const currentButton = e.target;
  const nextButton = e.target.closest('.toolbar-item-ctn').nextElementSibling;
  if (nextButton) {
    currentButton.setAttribute('tabindex', '-1');
    nextButton.setAttribute('tabindex', '0');
    nextButton.focus();
  }
};

const moveToPreviousButton = (e) => {
  const currentButton = e.target;
  const previousButton = e.target.closest('.toolbar-item-ctn').previousElementSibling;
  if (previousButton) {
    currentButton.setAttribute('tabindex', '-1');
    previousButton.setAttribute('tabindex', '0');
    previousButton.focus();
  }
};

const moveToNextButtonGroup = (e) => {
  const nextButtonGroup = e.target.closest('.button-group').nextElementSibling;
  if (nextButtonGroup) {
    nextButtonGroup.setAttribute('tabindex', '0');
    nextButtonGroup.focus();
  } else {
    // Move to the editor
    const editor = document.querySelector('.ProseMirror');
    if (editor) {
      editor.focus();
    }
  }
};

const moveToPreviousButtonGroup = (e) => {
  const previousButtonGroup = e.target.closest('.button-group').previousElementSibling;
  if (previousButtonGroup) {
    previousButtonGroup.setAttribute('tabindex', '0');
    previousButtonGroup.focus();
  }
};

// Implement keyboard navigation using Roving Tabindex
// https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#kbd_roving_tabindex
// Set tabindex to 0 for the current focused button
// Set tabindex to -1 for all other buttons
const handleKeyDown = (e, item) => {
  const isTypingField = e.target.nodeName === 'INPUT' || e.target.nodeName === 'TEXTAREA';
  const isTypingToolbarItem = item.name.value === 'fontSize';
  // If the user is typing in a field or textarea, and the toolbar item is a font size,
  // don't prevent the default behavior. Allow normal typing behavior.
  if (isTypingField && isTypingToolbarItem) {
    return;
  }
  e.preventDefault();

  switch (e.key) {
    case 'Enter':
      console.log('Enter');
      handleToolbarButtonClick(item, null, false);
      break;
    case 'Escape':
      closeDropdowns();
      break;
    case 'ArrowRight':
      closeDropdowns();
      moveToNextButton(e);
      break;
    case 'ArrowLeft':
      closeDropdowns();
      moveToPreviousButton(e);
      break;
    case 'Tab':
      if (e.shiftKey) {
        moveToPreviousButtonGroup(e);
      } else {
        moveToNextButtonGroup(e);
      }
      break;
    default:
      break;
  }
};
const handleFocus = (e) => {
  // Set the focus to the first button inside the button group that is not disabled
  const firstButton = toolbarItemRefs.value.find((item) => !item.classList.contains('disabled'));
  if (firstButton) {
    firstButton.setAttribute('tabindex', '0');
    firstButton.focus();
  }
};
</script>

<template>
  <div :style="getPositionStyle" class="button-group" role="group" @focus="handleFocus">
    <div
      v-for="(item, index) in toolbarItems"
      :key="item.id.value"
      :class="{
        narrow: item.isNarrow.value,
        wide: item.isWide.value,
        disabled: item.disabled.value,
      }"
      @keydown="(e) => handleKeyDown(e, item)"
      class="toolbar-item-ctn"
      ref="toolbarItemRefs"
      :tabindex="index === 0 ? 0 : -1"
    >
      <!-- toolbar separator -->
      <ToolbarSeparator v-if="isSeparator(item)" style="width: 20px" />

      <!-- Toolbar button -->
      <n-dropdown
        v-if="isDropdown(item) && item.nestedOptions?.value?.length"
        :options="dropdownOptions(item)"
        :trigger="item.disabled.value ? null : 'click'"
        :show="item.expand.value"
        size="medium"
        placement="bottom-start"
        class="toolbar-button toolbar-dropdown sd-editor-toolbar-dropdown"
        :class="{ 'high-contrast': isHighContrastMode }"
        @select="(key, option) => handleSelect(item, option)"
        @clickoutside="handleClickOutside"
        :style="item.dropdownStyles.value"
        :menu-props="
          () => ({
            role: 'menu',
          })
        "
        :node-props="(option) => getDropdownAttributes(option, item)"
      >
        <n-tooltip trigger="hover" :disabled="!item.tooltip?.value">
          <template #trigger>
            <ToolbarButton
              :toolbar-item="item"
              :disabled="item.disabled.value"
              @textSubmit="handleToolbarButtonTextSubmit(item, $event)"
              @buttonClick="handleToolbarButtonClick(item)"
            />
          </template>
          <div>
            {{ item.tooltip }}
            <span v-if="item.disabled.value">(disabled)</span>
          </div>
        </n-tooltip>
      </n-dropdown>

      <n-tooltip trigger="hover" v-else-if="isButton(item)" class="sd-editor-toolbar-tooltip">
        <template #trigger>
          <ToolbarButton
            :toolbar-item="item"
            :is-overflow-item="fromOverflow"
            @textSubmit="handleToolbarButtonTextSubmit(item, $event)"
            @buttonClick="handleToolbarButtonClick(item)"
          />
        </template>
        <div v-if="item.tooltip">
          {{ item.tooltip }}
          <span v-if="item.disabled.value">(disabled)</span>
        </div>
      </n-tooltip>

      <!-- Overflow menu -->
      <OverflowMenu
        v-if="isOverflow(item) && overflowItems.length"
        :toolbar-item="item"
        @buttonClick="handleToolbarButtonClick(item)"
        :overflow-items="overflowItems"
      />
    </div>
  </div>
</template>

<style lang="postcss">
.sd-editor-toolbar-dropdown {
  border-radius: 8px;
  min-width: 80px;
  cursor: pointer;
}

.sd-editor-toolbar-dropdown {
  &.high-contrast {
    .n-dropdown-option-body {
      &:hover {
        &::before,
        &::after {
          background-color: #000 !important;
        }
      }

      &__label {
        &:hover {
          color: #fff !important;
        }
      }
    }
  }

  .n-dropdown-option-body {
    &:hover {
      &::before,
      &::after {
        background-color: #d8dee5 !important;
      }
    }
  }
}

.sd-editor-toolbar-tooltip,
.sd-editor-toolbar-tooltip.n-popover {
  background-color: #333333 !important;
  font-size: 14px;
  border-radius: 8px !important;
}
</style>

<style lang="postcss" scoped>
.button-group {
  display: flex;
}
</style>
