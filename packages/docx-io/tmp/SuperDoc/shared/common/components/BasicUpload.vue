<script setup>
const emit = defineEmits(['file-change']);

const props = defineProps({
  accept: {
    type: String,
    default: '.docx, .pdf, .html, .md',
  },
});
const onFileChange = (event) => {
  emit('file-change', event.target.files[0]);
};
</script>

<template>
  <div>
    <input type="file" id="fileInput" @change="onFileChange" :accept="accept" />
  </div>
</template>

<style scoped></style>
