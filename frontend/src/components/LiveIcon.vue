<template>
  <div
    v-if="isLive"
    class="text-container"
  >
    <strong class="text">Live</strong>
    <span class="dot"></span>
  </div>
</template>

<script>
export default {
  props: {
    isLive: Boolean,
  },
};
</script>

<style scoped>
.text {
  vertical-align: middle;
  color: var(--color-marshie-green);
}

.dot {
  vertical-align: middle;
  display: inline-block;
  width: 0.5em;
  height: 0.5em;
  vertical-align: middle;
  margin-left: 0.5rem;
  border-radius: 50%;
  background-color: var(--color-marshie-green);
  animation: 1s infinite alternate ease-in-out blink;
}

@keyframes blink {
  from {
    opacity: 0.25;
  }
  to {
    opacity: 1;
  }
}
</style>
