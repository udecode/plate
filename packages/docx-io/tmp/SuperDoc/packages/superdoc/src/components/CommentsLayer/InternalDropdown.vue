<script setup>
import { computed, ref, h, onMounted, watch } from 'vue';
import { NDropdown, NTooltip, NSelect } from 'naive-ui';
import { superdocIcons } from '@superdoc/icons.js';

const emit = defineEmits(['select']);
const props = defineProps({
  state: {
    type: String,
    required: false,
  },
  isDisabled: {
    type: Boolean,
    default: false,
  },
});

const renderIcon = (icon) => {
  return () => {
    return h('div', { innerHTML: icon, class: 'internal-dropdown__item-icon' });
  };
};

const options = [
  {
    label: 'Internal',
    key: 'internal',
    icon: renderIcon(superdocIcons.internal),
    iconString: superdocIcons.internal,
    backgroundColor: '#CDE6E6',
  },
  {
    label: 'External',
    key: 'external',
    icon: renderIcon(superdocIcons.external),
    iconString: superdocIcons.external,
    backgroundColor: '#F5CFDA',
  },
];

const getState = computed(() => {
  return options.find((o) => o.key === activeState.value)?.label;
});

const getStyle = computed(() => {
  if (!props.state) return {};

  const activeOption = options.find((o) => o.key === activeState.value);
  if (!activeOption) return {};

  const style = { backgroundColor: activeOption.backgroundColor };

  if (props.isDisabled) {
    style.opacity = 0.5;
    style.cursor = 'default';
  }
  return style;
});

const handleSelect = (key, suppressEmit = false) => {
  activeState.value = key;
  activeIcon.value = options.find((o) => o.key === key)?.iconString;

  if (suppressEmit) return;
  emit('select', key);
};

const activeState = ref(props.state);
const activeIcon = ref(null);

watch(
  () => props.state,
  (newVal) => {
    handleSelect(newVal);
  },
);

onMounted(() => {
  handleSelect(props.state, true);
});
</script>

<template>
  <div class="internal-dropdown" :style="getStyle">
    <n-dropdown trigger="click" :options="options" @select="handleSelect($event)" :disabled="isDisabled">
      <div class="comment-option">
        <div class="active-icon" v-html="activeIcon"></div>
        <div class="option-state">{{ getState }}</div>
        <div class="dropdown-caret" v-html="superdocIcons.caretDown"></div>
      </div>
    </n-dropdown>
  </div>
</template>

<style scoped>
.comment-option {
  display: flex;
  align-items: center;
  font-size: 11px;
}
.comment-option i {
  font-size: 11px;
}
.option-state {
  margin: 0 7px;
}

.active-icon {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  width: 16px;
  height: 16px;
}

.active-icon :deep(svg) {
  width: 100%;
  height: 100%;
  display: block;
  fill: currentColor;
}

.dropdown-caret {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  width: 10px;
  height: 16px;
}

.dropdown-caret :deep(svg) {
  width: 100%;
  height: 100%;
  display: block;
  fill: currentColor;
}

.internal-dropdown {
  transition: all 250ms ease;
  display: inline-block;
  cursor: pointer;
  border-radius: 50px;
  padding: 2px 8px;
}
.internal-dropdown:hover {
  background-color: #f3f3f5;
}
</style>

<style>
.internal-dropdown__item-icon {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  width: 16px;
  height: 16px;
}

.internal-dropdown__item-icon svg {
  width: 100%;
  height: 100%;
  display: block;
  fill: currentColor;
}
</style>
