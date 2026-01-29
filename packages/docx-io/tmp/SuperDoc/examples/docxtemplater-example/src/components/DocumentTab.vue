<!-- document tab found in control bar -->
<script setup>
import { defineEmits } from 'vue';

const props = defineProps({
  isActive: {
    type: Boolean,
    required: true,
  },
  faIconArray: {
    type: Array,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  hasBorder: {
    type: Boolean,
    required: true,
    default: true,
  },
  tooltip: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['click']);
</script>

<template>
    <div class="document-tab" :class="{ active: isActive }" @click="emit('click')" :title="tooltip">
        <font-awesome-icon :icon="faIconArray" />
        <span v-if="text" class="tab-text">{{ text }}</span>
        <div v-if="hasBorder" class="border"></div>
    </div>
</template>

<style scoped>

.document-tab {
  padding: 0 10px;
  height: 100%;
  display: flex;
  align-items: center;
  color: white;
  /* font-weight: bold; */
  cursor: pointer;
  border-radius: 10px 10px 0 0;
  border-radius: 0;
}

.tab-text {
  margin: 0 5px;
}

.document-tab.active {
  background-color: #89a6d2;
  color: #1e3d69;
  transition: background-color 0.1s;
  border-radius: 10px 10px 0 0;
}

.document-tab .border {
  width: 5px;
  border-right: solid 1px #89a6d2;
  height: 60%;
}

.document-tab:hover {
  text-decoration: underline;
}
</style>