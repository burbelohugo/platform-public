<template>
  <Button
    :size="size"
    class="zoom-button"
    @click="handleClick"
  >
    <img
      src="../assets/zoom-icon.svg"
      alt="Zoom Logo"
      class="btn-icon btn-icon-left"
    />
    <slot>Attend</slot>
  </Button>
</template>

<script>
import Button from './Button';
import generalMixin from '../mixins/general';
import scheduleMixin from '../mixins/schedule';

export default {
  props: {
    href: String,
    size: {
      type: String,
      default: 'sm',
    },
  },
  components: { Button },
  mixins: [generalMixin, scheduleMixin],
  methods: {
    async handleClick() {
      // Run any parent click handlers sent to this element
      this.$emit('click');

      // Fix bug with localhost links missing HTTP status codes--preventing the
      // click from completing
      const link = this.href.includes('http') ? this.href : `http://${this.href}`;
      window.open(link, '_blank');
    },
  },
};
</script>

<style scoped>
.zoom-button {
  --color-zoom: #0e71eb;
  background-color: var(--color-zoom) !important;
  border-color: var(--color-zoom) !important;
}

.zoom-button:hover,
.zoom-button:focus,
.zoom-button:active {
  --color-zoom-hover: #2681f2;
  background-color: var(--color-zoom-hover) !important;
  border-color: var(--color-zoom-hover) !important;
  color: var(--color-light-text);
}

.zoom-button[disabled] {
  opacity: 0.4;
}
</style>
