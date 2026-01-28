<script setup>
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import { useSuperdocStore } from '@stores/superdoc-store';

const superdocStore = useSuperdocStore();
const { documentUsers } = storeToRefs(superdocStore);

const props = defineProps({
  filter: {
    type: String,
    required: false,
  },
});

const getFilteredUsers = computed(() => {
  const filter = props.filter?.toUpperCase();
  if (!filter) return documentUsers.value;
  return documentUsers.value.filter((n) => n.name.toUpperCase().startsWith(filter));
});
</script>

<template>
  <div class="document-users">
    <div v-for="user in getFilteredUsers" :key="user.email" class="user-row">
      {{ user.name }}
    </div>
  </div>
</template>

<style scoped>
.document-users {
  position: absolute;
  top: 0;
  left: 0;
  background-color: white;
}
.user-row {
  margin: 10px 0;
}
</style>
