<template>
  <svg
    :class="['chevron', `chevron-${direction}`]"
    width="142"
    height="257"
    viewBox="0 0 142 257"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M135 6.5L13 128.5L135 250.5"
      stroke-width="23"
    />
  </svg>
</template>

<script>
export default {
  props: {
    direction: {
      type: String,
      default: 'left',
      validator(value) {
        // Direction is an enum with the following strings
        return value === 'up' || value === 'down' || value === 'left' || value === 'right';
      },
    },
  },
};
</script>

<style scoped>
.chevron {
  stroke: var(--color-bitcamp);
  height: 1em;
  width: 1em;
}

.chevron-down {
  transform: rotate(-90deg);
}

.chevron-up {
  transform: rotate(90deg);
}

.chevron-right {
  transform: rotate(180deg);
}
</style>
