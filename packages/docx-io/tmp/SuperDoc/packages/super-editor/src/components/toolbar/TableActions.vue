<script setup>
const emit = defineEmits(['select']);

const props = defineProps({
  options: {
    type: Array,
  },
});

const handleClick = (item) => {
  emit('select', { command: item.command });
};
</script>

<template>
  <div class="toolbar-table-actions">
    <div
      class="toolbar-table-actions__item"
      :class="{ 'toolbar-table-actions__item--border': option.bottomBorder }"
      v-for="option in options"
      @click="handleClick(option)"
      :data-item="option.props?.['data-item'] || ''"
      :ariaLabel="option.props?.ariaLabel"
      role="menuitem"
    >
      <div class="toolbar-table-actions__icon">
        <div class="toolbar-table-actions__icon-wrapper" v-html="option.icon"></div>
      </div>
      <div class="toolbar-table-actions__label">
        {{ option.label }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.toolbar-table-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px;
  box-sizing: border-box;
}

.toolbar-table-actions :deep(svg) {
  width: 100%;
  height: 100%;
  display: block;
  fill: currentColor;
}

.toolbar-table-actions__item {
  display: flex;
  gap: 5px;
  background-color: #fff;
  padding: 4px 10px;
  border-radius: 4px;
  cursor: pointer;
  box-sizing: border-box;
  position: relative;
}

.toolbar-table-actions__item:hover {
  background-color: #c8d0d8;
}

.toolbar-table-actions__item--border:after {
  content: '';
  display: block;
  position: absolute;
  bottom: -3px;
  left: -10px;
  right: 0;
  height: 1px;
  width: calc(100% + 20px);
  background: #c8d0d8;
}

.toolbar-table-actions__icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 20px;
  color: black;
  box-sizing: border-box;
}

.toolbar-table-actions__icon-wrapper {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  height: 14px;
  color: #47484a;
}

.toolbar-table-actions__icon-wrapper :deep(svg) {
  width: auto;
  max-height: 14px;
}

.toolbar-table-actions__label {
  font-size: 15px;
  font-weight: 400;
  color: #222;
  white-space: nowrap;
}
</style>
