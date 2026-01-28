<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick, computed, markRaw } from 'vue';
import { SlashMenuPluginKey } from '@/extensions/slash-menu';
import { getPropsByItemId } from './utils.js';
import { moveCursorToMouseEvent } from '../cursor-helpers.js';
import { getItems } from './menuItems.js';
import { getEditorContext } from './utils.js';

const props = defineProps({
  editor: {
    type: Object,
    required: true,
  },
  openPopover: {
    type: Function,
    required: true,
  },
  closePopover: {
    type: Function,
    required: true,
  },
});

const searchInput = ref(null);
const searchQuery = ref('');
const isOpen = ref(false);
const menuPosition = ref({ left: '0px', top: '0px' });
const menuRef = ref(null);
const sections = ref([]);
const selectedId = ref(null);

// Helper to close menu if editor becomes read-only
const handleEditorUpdate = () => {
  if (!props.editor?.isEditable && isOpen.value) {
    closeMenu({ restoreCursor: false });
  }
};

// Flatten sections into items for navigation and filtering
const flattenedItems = computed(() => {
  const items = [];
  sections.value.forEach((section) => {
    section.items.forEach((item) => {
      items.push(item);
    });
  });
  return items;
});

// Filter items based on search query
const filteredItems = computed(() => {
  if (!searchQuery.value) {
    return flattenedItems.value;
  }

  return flattenedItems.value.filter((item) => item.label?.toLowerCase().includes(searchQuery.value.toLowerCase()));
});

// Get sections with filtered items for rendering
const filteredSections = computed(() => {
  if (!searchQuery.value) {
    return sections.value;
  }

  // If searching, return a single section with filtered items
  return [
    {
      id: 'search-results',
      items: filteredItems.value,
    },
  ];
});

watch(isOpen, (open) => {
  if (open) {
    nextTick(() => {
      if (searchInput.value) {
        searchInput.value.focus();
      }
    });
  }
});

watch(flattenedItems, (newItems) => {
  if (newItems.length > 0) {
    selectedId.value = newItems[0].id;
  }
});

const handleGlobalKeyDown = (event) => {
  // ESCAPE: always close popover or menu
  if (event.key === 'Escape') {
    event.preventDefault();
    event.stopPropagation();
    closeMenu();
    props.editor?.view?.focus();
    return;
  }

  // Only handle navigation/selection if menu is open and input is focused
  if (isOpen.value && (event.target === searchInput.value || (menuRef.value && menuRef.value.contains(event.target)))) {
    const currentItems = filteredItems.value;
    const currentIndex = currentItems.findIndex((item) => item.id === selectedId.value);
    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault();
        if (currentIndex < currentItems.length - 1) {
          selectedId.value = currentItems[currentIndex + 1].id;
        }
        break;
      }
      case 'ArrowUp': {
        event.preventDefault();
        if (currentIndex > 0) {
          selectedId.value = currentItems[currentIndex - 1].id;
        }
        break;
      }
      case 'Enter': {
        event.preventDefault();
        const selectedItem = currentItems.find((item) => item.id === selectedId.value);
        if (selectedItem) {
          executeCommand(selectedItem);
        }
        break;
      }
    }
  }
};

const handleGlobalOutsideClick = (event) => {
  if (isOpen.value && menuRef.value && !menuRef.value.contains(event.target)) {
    moveCursorToMouseEvent(event, props.editor);
    closeMenu({ restoreCursor: false });
  }
};

const handleRightClick = async (event) => {
  // If the document is read-only, don't open the context menu
  // If user is also holding control, don't open the menu
  const readOnly = !props.editor?.isEditable;
  const isHoldingCtrl = event.ctrlKey;
  if (readOnly || isHoldingCtrl) {
    return;
  }

  event.preventDefault();
  props.editor.view.dispatch(
    props.editor.view.state.tr.setMeta(SlashMenuPluginKey, {
      type: 'open',
      pos: props.editor.view.state.selection.from,
      clientX: event.clientX,
      clientY: event.clientY,
    }),
  );
  searchQuery.value = '';
  // Set sections and selectedId when menu opens
  const context = await getEditorContext(props.editor, event);
  sections.value = getItems({ ...context, trigger: 'click' });
  selectedId.value = flattenedItems.value[0]?.id || null;
};

const executeCommand = async (item) => {
  if (props.editor) {
    // First call the action if needed on the item
    item.action ? await item.action(props.editor) : null;

    if (item.component) {
      const menuElement = menuRef.value;
      const componentProps = getPropsByItemId(item.id, props);
      props.openPopover(markRaw(item.component), componentProps, {
        left: menuPosition.value.left,
        top: menuPosition.value.top,
      });
      closeMenu({ restoreCursor: false });
    } else {
      // For paste operations, don't restore cursor
      const shouldRestoreCursor = item.id !== 'paste';
      closeMenu({ restoreCursor: shouldRestoreCursor });
    }
  }
};

const closeMenu = (options = { restoreCursor: true }) => {
  if (props.editor?.view) {
    // Get plugin state to access anchorPos
    const pluginState = SlashMenuPluginKey.getState(props.editor.view.state);
    const { anchorPos } = pluginState;

    // Update prosemirror state to close menu
    props.editor.view.dispatch(
      props.editor.view.state.tr.setMeta(SlashMenuPluginKey, {
        type: 'close',
      }),
    );

    // Restore cursor position and focus only if requested
    if (options.restoreCursor && anchorPos !== null) {
      const tr = props.editor.view.state.tr.setSelection(
        props.editor.view.state.selection.constructor.near(props.editor.view.state.doc.resolve(anchorPos)),
      );
      props.editor.view.dispatch(tr);
      props.editor.view.focus();
    }

    // Update local state
    isOpen.value = false;
    searchQuery.value = '';
    sections.value = [];
  }
};

/**
 * Lifecycle hooks on mount and onBeforeUnmount
 */
onMounted(() => {
  if (!props.editor) return;

  // Add global event listeners
  document.addEventListener('keydown', handleGlobalKeyDown);
  document.addEventListener('mousedown', handleGlobalOutsideClick);

  // Close menu if the editor becomes read-only while it's open
  props.editor.on('update', handleEditorUpdate);

  // Listen for the slash menu to open
  props.editor.on('slashMenu:open', async (event) => {
    // Prevent opening the menu in read-only mode
    const readOnly = !props.editor?.isEditable;
    if (readOnly) return;
    isOpen.value = true;
    menuPosition.value = event.menuPosition;
    searchQuery.value = '';
    // Set sections and selectedId when menu opens
    const context = await getEditorContext(props.editor);
    sections.value = getItems({ ...context, trigger: 'slash' });
    selectedId.value = flattenedItems.value[0]?.id || null;
  });

  props.editor.view.dom.addEventListener('contextmenu', handleRightClick);

  props.editor.on('slashMenu:close', () => {
    isOpen.value = false;
    searchQuery.value = '';
  });
});

// Cleanup function for event listeners
onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleGlobalKeyDown);
  document.removeEventListener('mousedown', handleGlobalOutsideClick);
  if (props.editor) {
    try {
      props.editor.off('slashMenu:open');
      props.editor.off('slashMenu:close');
      props.editor.off('update', handleEditorUpdate);
      props.editor.view.dom.removeEventListener('contextmenu', handleRightClick);
    } catch (error) {}
  }
});
</script>

<template>
  <div v-if="isOpen" ref="menuRef" class="slash-menu" :style="menuPosition" @mousedown.stop>
    <!-- Hide the input visually but keep it focused for typing -->
    <input
      ref="searchInput"
      v-model="searchQuery"
      type="text"
      class="slash-menu-hidden-input"
      @keydown="handleGlobalKeyDown"
      @keydown.stop
    />

    <div class="slash-menu-items">
      <template v-for="(section, sectionIndex) in filteredSections" :key="section.id">
        <!-- Render divider before section (except for first section) -->
        <div v-if="sectionIndex > 0 && section.items.length > 0" class="slash-menu-divider" tabindex="0"></div>

        <!-- Render section items -->
        <template v-for="item in section.items" :key="item.id">
          <div class="slash-menu-item" :class="{ 'is-selected': item.id === selectedId }" @click="executeCommand(item)">
            <!-- Render the icon if it exists -->
            <span v-if="item.icon" class="slash-menu-item-icon" v-html="item.icon"></span>
            <span>{{ item.label }}</span>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<style>
.slash-menu {
  position: absolute;
  z-index: 50;
  width: 175px;
  color: #47484a;
  background: white;
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.05),
    0px 10px 20px rgba(0, 0, 0, 0.1);
  margin-top: 0.5rem;
  font-size: 12px;
}

/* Hide the input but keep it functional */
.slash-menu-hidden-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
  height: 0;
  width: 0;
  padding: 0;
  margin: 0;
  border: none;
}

.slash-menu-items {
  max-height: 300px;
  overflow-y: auto;
}

.slash-menu-search {
  padding: 0.5rem;
  border-bottom: 1px solid #eee;
}

.slash-menu-search input {
  width: 100%;
  padding: 0.25rem 0.5rem;
  border: 1px solid #ddd;
  outline: none;
}

.slash-menu-search input:focus {
  border-color: #0096fd;
}

/* Remove unused group styles */
.slash-menu-group-label {
  display: none;
}

.slash-menu-item {
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.15s ease;
  display: flex;
  align-items: center;
}

.slash-menu-item:hover {
  background: #f5f5f5;
}

.slash-menu-item.is-selected {
  background: #edf6ff;
  color: #0096fd;
  fill: #0096fd;
}

.slash-menu-item-icon {
  display: flex;
  align-items: center;
  margin-right: 10px;
}

.slash-menu-item-icon svg {
  height: 12px;
  width: 12px;
}

.popover {
  background: white;
  border-radius: 6px;
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.05),
    0px 10px 20px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.slash-menu-divider {
  height: 1px;
  background: #eee;
  margin: 4px 0;
}
</style>
