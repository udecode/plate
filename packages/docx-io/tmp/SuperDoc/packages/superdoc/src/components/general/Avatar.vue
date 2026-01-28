<script setup>
const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
});

const getInitials = (name, email) => {
  if (!name && !email) return;
  const firstLetter = name?.substring(0, 1) || email?.substring(0, 1) || null;
  return firstLetter;
};
</script>

<template>
  <div class="user-container">
    <img
      class="user-bg"
      v-if="user.image"
      :src="user.image.startsWith('http') ? user.image : `data:image/png;base64,${user.image}`"
    />
    <span class="user-bg" v-else>{{ getInitials(user.name, user.email) }}</span>
  </div>
</template>

<style scoped>
.user-container {
  border-radius: 50%;
  border: 2px solid #333;
  font-size: 15px;
  color: #fff;
  background-color: #00000098;

  width: 30px;
  height: 30px;

  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

img {
  border-radius: 50%;
  width: 100%;
  background-color: transparent;
}

span {
  font-weight: 300;
}
</style>
