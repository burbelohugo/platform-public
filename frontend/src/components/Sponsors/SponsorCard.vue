<template>
  <b-card>
    <LiveIcon
      class="live-icon"
      :isLive="sponsor.booth_open"
    />
    <img
      v-bind:src="sponsor.logo_image_url"
      v-bind:alt="sponsor.name"
      v-bind:id="sponsor.name"
      class="img"
    />
  </b-card>
</template>

<script>
import LiveIcon from '../LiveIcon.vue';

export default {
  components: { LiveIcon },
  name: 'SponsorCard',
  props: {
    sponsor: Object,
  },
};
</script>

<style scoped>
.img {
  width: 100%;
  height: 150px;
  object-fit: contain;
  /* border: 1px solid red; */
}

.card {
  position: relative;
  padding: 1rem 0;
  margin-bottom: 1rem;
}

.live-icon {
  position: absolute;
  top: 0.5rem;
  right: 1rem;
}
</style>
