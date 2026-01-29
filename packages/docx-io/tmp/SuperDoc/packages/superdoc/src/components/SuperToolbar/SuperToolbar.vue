<script setup>
import { getCurrentInstance, ref, onMounted } from 'vue';
import { Toolbar } from '@harbour-enterprises/super-editor';

const { proxy } = getCurrentInstance();
const toolbar = ref(null);
const innerToolbar = ref(null);

const handleToolbarCommand = ({ item, argument }) => {
  proxy.$superdoc.onToolbarCommand({ item, argument });
};

defineExpose({
  innerToolbar,
});
</script>

<template>
  <div ref="toolbar">
    <Toolbar class="toolbar" @command="handleToolbarCommand" ref="innerToolbar" />
  </div>
</template>

<style scoped></style>
