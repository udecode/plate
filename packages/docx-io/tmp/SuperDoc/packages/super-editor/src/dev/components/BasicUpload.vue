<script setup>
const emit = defineEmits(['file-change']);
const onFileChange = (event) => {
  emit('file-change', event.target.files[0]);
};
</script>

<template>
  <div>
    <input type="file" id="fileInput" @change="onFileChange" accept=".docx .md" />
  </div>
</template>

<style scoped></style>
