<template>
  <button
    type="button"
    class="btn"
    :class="{
      'btn-lg': size === 'lg',
      'btn-sm': size === 'sm',
      'btn-outline': outlined,
      'btn-secondary': secondary,
    }"
    @click="clicked"
  >
    <div class="btn-content">
      <slot></slot>
    </div>
  </button>
</template>

<script>
export default {
  name: 'Button',
  props: {
    size: {
      type: String,
      default: 'lg',
    },
    outlined: {
      type: Boolean,
      default: false,
    },
    secondary: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    clicked() {
      this.$emit('click');
    },
  },
};
</script>
