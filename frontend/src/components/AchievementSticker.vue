<!-- Displays a sticker and its description -->

<template>
  <div class="sticker">
    <div
      class="sticker-placeholder"
      :class="{'active': active}"
    >
      <img
        v-if="imgSrc && active"
        class="sticker-image"
        :src="imgSrc"
        :alt="`Sticker for ${description}`"
      >
    </div>
    <p class="sticker-description">{{ description }}</p>
  </div>
</template>

<script>
export default {
  props: {
    description: String,
    active: Boolean,
    imgSrc: String,
  },
};
</script>

<style scoped>
.sticker {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
}

.sticker-placeholder {
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
  background-color: var(--color-placeholder);
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1rem;
}

.sticker-placeholder.active {
  background-color: transparent;
}

.sticker-image {
  width: 100%;
}

.sticker-description {
  font-weight: bold;
  font-size: 0.85rem;
  padding: 0 0.5rem;
}
</style>
