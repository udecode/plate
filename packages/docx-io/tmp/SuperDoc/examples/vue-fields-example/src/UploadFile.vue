<script setup>
import { ref } from 'vue';
const fileInput = ref(null);

const props = defineProps({
  updateFile: {
    type: Function,
    required: true
  }
})

const handleFileChange = () => {
  console.debug('File input changed');
  props.updateFile(fileInput.value.files[0]);
}

</script>

<template>
  <div>
    <button class="custom-button" @click="fileInput?.click()">Import document</button>
    <input 
        type="file" 
        ref="fileInput" 
        accept=".docx" 
        class="hidden"
        @change="handleFileChange"
      >
  </div>
</template>
