<template>
  <div class="banner-wrapper">

    <div class="banner-body">
      <img
        src="../../assets/technica/technica-logo-icon.png"
        class="logo-icon"
      />
      <span class="banner-text">{{requestDescription}}</span>
    </div>

    <div style="text-align:right !important">
      <Button
        class="banner-action"
        v-b-modal.request-view-modal
        @click="view"
      >
        View
      </Button>
      <Button>Claim</Button>
    </div>

  </div>
</template>

<script>
import Button from '../Button.vue';

export default {
  name: 'MentorManagementCard',
  components: {
    Button,
  },
  props: {
    requestDescription: String,
  },
  methods: {
    view() {
      this.$emit('viewCard', { title: this.requestDescription });
    },
  },

};
</script>

<style scoped>
.banner-wrapper {
  background: var(--color-foreground);
  border-radius: 8px;
  box-shadow: 0px 2px 2px var(--color-shadow);
  padding: 5px;
  padding-bottom: 10px;
  margin: 0.5rem;
}

.banner-body {
  display: flex;
  justify-content: left;
  align-content: center;
  text-align: left;
}

.logo-icon {
  width: 2rem;
  height: 2rem;
  margin-left: 0.75rem;
  margin-right: 0.75rem;
  margin-top: 0.75rem;
}

.banner-text {
  margin-left: 1rem;
  margin-right: 1rem;
  margin-top: 0.25rem;
}

.banner-action {
  margin-left: 1rem;
  margin-right: 1rem;
  font-weight: bold;
}

.banner-action:hover {
  /* color: var(--color-primary-hover) !important; */
  cursor: pointer;
}
</style>
