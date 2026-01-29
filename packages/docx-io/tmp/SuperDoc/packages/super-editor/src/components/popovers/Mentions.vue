<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  users: {
    type: Array,
    required: true,
  },
  mention: {
    type: String,
    default: '',
  },
  inserMention: {
    type: Function,
    required: true,
  },
});

const container = ref(null);
const activeUserIndex = ref(null);

const getFilteredUsers = computed(() => {
  // Remove the '@' symbol from the mention
  const mention = props.mention.slice(1)?.toLowerCase();
  const filtered =
    props.users.filter((user) => {
      const isViewer = user.role === 'viewer';
      const userMatch = user.name?.toLowerCase().startsWith(mention);
      const emailMatch = user.email?.toLowerCase().startsWith(mention);
      return !isViewer && (userMatch || emailMatch);
    }) || [];
  return filtered;
});

const handleClick = (user) => {
  props.inserMention(user);
};

const handleKeydown = (event) => {
  if (event.key === 'ArrowDown') {
    activeUserIndex.value += 1;
    if (activeUserIndex.value === getFilteredUsers.value.length) {
      activeUserIndex.value = 0;
    }
  } else if (event.key === 'ArrowUp') {
    activeUserIndex.value -= 1;
    if (activeUserIndex.value < 0) {
      activeUserIndex.value = getFilteredUsers.value.length - 1;
    }
  } else if (event.key === 'Enter') {
    const user = getFilteredUsers.value[activeUserIndex.value];
    if (user) {
      props.inserMention(user);
    }
  }
};

const handleFocus = () => {
  activeUserIndex.value = 0;
};
</script>

<template>
  <div
    class="mentions-container"
    ref="container"
    @keydown.prevent="handleKeydown"
    @focus.stop.prevent="handleFocus"
    tabindex="0"
  >
    <div
      v-for="(user, index) in getFilteredUsers"
      @click.stop.prevent="handleClick(user)"
      @mouseenter="activeUserIndex = index"
      @mouseleave="activeUserIndex = null"
      :key="user.email"
      class="user-row"
      :class="{ selected: activeUserIndex === index }"
    >
      <div v-if="user.name">
        <span v-if="user.name">{{ user.name }}</span>
        <span v-if="user.name && user.email"> ({{ user.email }})</span>
      </div>
      <div v-else>
        <span>{{ user.email }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.selected {
  background-color: #dbdbdb;
}
.mentions-container {
  outline: none !important;
  border: none;
  max-height: 300px;
  overflow-y: auto;
}
.mentions-container:focus {
  border: none;
  outline: none !important;
}
.user-row {
  padding: 10px 15px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-sizing: border-box;
}
</style>
