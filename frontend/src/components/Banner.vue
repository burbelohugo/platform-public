<template>
  <div class="banner-wrapper">
    <template v-if="html">
      <span
        class="banner-text"
        v-html="html"
      ></span>
    </template>
    <span
      v-else
      class="banner-text"
    >{{ text }}</span>
    <Button
      v-if="displayAcceptButton"
      @click="handleAcceptClick"
      size="sm"
      class="banner-btn"
      outlined
    >
      Accept
    </Button>
    <Button
      v-if="displayViewButton"
      @click="handleViewClick"
      size="sm"
      class="banner-btn"
      outlined
    >
      View
    </Button>
  </div>
</template>

<script>
import Button from '@/components/Button.vue';

export default {
  name: 'Banner',
  components: {
    Button,
  },
  props: {
    text: String,
    displayAcceptButton: {
      type: Boolean,
      default: false,
    },
    displayViewButton: {
      type: Boolean,
      default: false,
    },
    html: {
      type: String,
      default: '',
    },
  },
  methods: {
    handleAcceptClick() {
      this.$emit('accept');
    },
    handleViewClick() {
      this.$emit('view');
    },
  },
};
</script>

<style scoped>
.banner-wrapper {
  display: flex;
  align-items: center;
  text-align: left;
  width: 100%;
  padding: 1.25rem 1rem;
  border-top: 3px solid var(--color-light-border);
}
.banner-wrapper:first-of-type {
  border-top: 0;
}
.banner-btn {
  margin-left: auto;
}
@media (max-width: 1400px) {
  .banner-text {
    font-size: 14px;
  }
}
</style>
