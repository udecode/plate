<script setup>
import { ref, getCurrentInstance, onMounted, onDeactivated, nextTick } from 'vue';
import { throttle } from './helpers.js';
import ButtonGroup from './ButtonGroup.vue';

const { proxy } = getCurrentInstance();
const emit = defineEmits(['command', 'toggle', 'select']);

let toolbarKey = ref(1);

const showLeftSide = proxy.$toolbar.config?.toolbarGroups?.includes('left');
const showRightSide = proxy.$toolbar.config?.toolbarGroups?.includes('right');
const excludeButtonsList = proxy.$toolbar.config?.toolbarButtonsExclude || [];

const getFilteredItems = (position) => {
  return proxy.$toolbar.getToolbarItemByGroup(position).filter((item) => !excludeButtonsList.includes(item.name.value));
};

onMounted(() => {
  window.addEventListener('resize', onResizeThrottled);
  window.addEventListener('keydown', onKeyDown);
});

onDeactivated(() => {
  window.removeEventListener('resize', onResizeThrottled);
  window.removeEventListener('keydown', onKeyDown);
});

const onKeyDown = async (e) => {
  if (e.metaKey && e.key === 'f') {
    const searchItem = proxy.$toolbar.getToolbarItemByName('search');
    if (searchItem) {
      e.preventDefault();
      searchItem.expand.value = true;
      await nextTick();
      if (searchItem.inputRef.value) {
        searchItem.inputRef.value.focus();
      }
    }
  }
};

const onWindowResized = async () => {
  await proxy.$toolbar.onToolbarResize();
  toolbarKey.value += 1;
};
const onResizeThrottled = throttle(onWindowResized, 300);

const handleCommand = ({ item, argument, option }) => {
  proxy.$toolbar.emitCommand({ item, argument, option });
};

const restoreSelection = () => {
  proxy.$toolbar.activeEditor?.commands?.restoreSelection();
};
</script>

<template>
  <div class="superdoc-toolbar" :key="toolbarKey" role="toolbar" aria-label="Toolbar">
    <ButtonGroup
      tabindex="0"
      v-if="showLeftSide"
      :toolbar-items="getFilteredItems('left')"
      position="left"
      @command="handleCommand"
      @item-clicked="restoreSelection"
      class="superdoc-toolbar-group-side"
    />
    <ButtonGroup
      tabindex="0"
      :toolbar-items="getFilteredItems('center')"
      :overflow-items="proxy.$toolbar.overflowItems"
      position="center"
      @command="handleCommand"
      @item-clicked="restoreSelection"
    />
    <ButtonGroup
      tabindex="0"
      v-if="showRightSide"
      :toolbar-items="getFilteredItems('right')"
      position="right"
      @command="handleCommand"
      @item-clicked="restoreSelection"
      class="superdoc-toolbar-group-side"
    />
  </div>
</template>

<style scoped>
.superdoc-toolbar {
  display: flex;
  width: 100%;
  justify-content: space-between;
  padding: 4px 16px;
  box-sizing: border-box;
}

@media (max-width: 1280px) {
  .superdoc-toolbar-group-side {
    min-width: auto !important;
  }
}

@media (max-width: 768px) {
  .superdoc-toolbar {
    padding: 4px 10px;
    justify-content: inherit;
  }
}
</style>
