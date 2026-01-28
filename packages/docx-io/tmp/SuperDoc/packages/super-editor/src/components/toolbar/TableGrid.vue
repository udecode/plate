<script setup>
import { ref, onMounted } from 'vue';
import { useHighContrastMode } from '../../composables/use-high-contrast-mode';
const emit = defineEmits(['select', 'clickoutside']);

const ROW_SIZE = 5;
const selectedRows = ref(0);
const selectedCols = ref(0);
const { isHighContrastMode } = useHighContrastMode();

const tableGridItems = ref([]);
const onTableGridMouseOver = (event) => {
  let target = event.target;
  let isGrid = !!target.dataset.grid;

  if (isGrid) {
    return;
  }

  let grid = target.parentElement;
  let allItems = [...grid.querySelectorAll('[data-item]')];
  let cols = parseInt(target.dataset.cols, 10);
  let rows = parseInt(target.dataset.rows, 10);

  selectGridItems(allItems, cols, rows);
};

const selectGridItems = (allItems, cols, rows) => {
  selectedCols.value = cols;
  selectedRows.value = rows;

  for (let i = 0; i < allItems.length; i++) {
    let item = allItems[i];
    let itemsCols = parseInt(item.dataset.cols, 10);
    let itemsRows = parseInt(item.dataset.rows, 10);

    if (itemsCols <= cols && itemsRows <= rows) {
      item.classList.add('selected');
    } else {
      item.classList.remove('selected');
    }
  }
};

const handleClick = ({ cols, rows }) => {
  emit('select', { cols, rows });
};

const handleKeyDown = (event, cols, rows) => {
  let normalizedCols = cols - 1;
  let normalizedRows = rows - 1;

  switch (event.key) {
    case 'ArrowRight': {
      if (normalizedCols >= 4) {
        return;
      }

      // Move to the next column
      const currentRow = normalizedRows * ROW_SIZE;
      tableGridItems.value[currentRow + normalizedCols + 1].setAttribute('tabindex', '0');
      tableGridItems.value[currentRow + normalizedCols + 1].focus();

      selectGridItems(tableGridItems.value, cols + 1, rows);
      break;
    }
    case 'ArrowLeft': {
      if (normalizedCols <= 0) {
        return;
      }

      // Move to the previous column
      const currentRow = normalizedRows * ROW_SIZE;
      tableGridItems.value[currentRow + normalizedCols - 1].setAttribute('tabindex', '0');
      tableGridItems.value[currentRow + normalizedCols - 1].focus();

      selectGridItems(tableGridItems.value, cols - 1, rows);
      break;
    }
    case 'ArrowDown': {
      if (normalizedRows >= 4) {
        return;
      }

      // Move to the next row
      const nextRow = (normalizedRows + 1) * ROW_SIZE;
      tableGridItems.value[nextRow + normalizedCols].setAttribute('tabindex', '0');
      tableGridItems.value[nextRow + normalizedCols].focus();
      selectGridItems(tableGridItems.value, cols, rows + 1);
      break;
    }
    case 'ArrowUp': {
      if (normalizedRows <= 0) {
        return;
      }

      // Move to the previous row
      const previousRow = (normalizedRows - 1) * ROW_SIZE;
      tableGridItems.value[previousRow + normalizedCols].setAttribute('tabindex', '0');
      tableGridItems.value[previousRow + normalizedCols].focus();
      selectGridItems(tableGridItems.value, cols, rows - 1);
      break;
    }

    case 'Enter': {
      handleClick({ cols, rows });
      break;
    }
    default:
      break;
  }
};

onMounted(() => {
  // Focus on the first item
  tableGridItems.value[0].setAttribute('tabindex', '0');
  tableGridItems.value[0].focus();

  selectGridItems(tableGridItems.value, 1, 1);
});
</script>

<template>
  <div class="toolbar-table-grid-wrapper" :class="{ 'high-contrast': isHighContrastMode }">
    <div class="toolbar-table-grid" @mouseover="onTableGridMouseOver" data-grid="true">
      <template v-for="i in 5" :key="i">
        <div
          class="toolbar-table-grid__item"
          v-for="n in 5"
          :key="`${i}_${n}`"
          :data-cols="n"
          :data-rows="i"
          data-item="true"
          ref="tableGridItems"
          @keydown.prevent="(event) => handleKeyDown(event, n, i)"
          @click.stop.prevent="handleClick({ cols: n, rows: i })"
        ></div>
      </template>
    </div>

    <div class="toolbar-table-grid-value" :aria-valuetext="`${selectedRows} x ${selectedCols}`">
      {{ selectedRows }} x {{ selectedCols }}
    </div>
  </div>
</template>

<style scoped>
.toolbar-table-grid-wrapper {
  .toolbar-table-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 2px;
    padding: 8px;
    box-sizing: border-box;
  }

  .toolbar-table-grid__item {
    width: 20px;
    height: 20px;
    border: 1px solid #d3d3d3;
    cursor: pointer;
    transition: all 0.15s;
  }

  .toolbar-table-grid__item.selected {
    background-color: #dbdbdb;
  }

  &.high-contrast {
    .toolbar-table-grid__item {
      border-color: #000;
    }

    .toolbar-table-grid__item.selected {
      background: #000;
    }
  }

  .toolbar-table-grid-value {
    font-size: 13px;
    line-height: 1.1;
    padding: 0px 8px 2px;
  }
}
</style>
