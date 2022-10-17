<template>
  <div class="page-container">
    <img src="@/assets/livestream.png" style="width: 100%; height: 100%" />
    <div id="iframe-wrapper">
      <iframe
        id="live-stream-wrapper"
        :src="liveStreamLink"
        frameBorder="0"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      ></iframe>
    </div>
  </div>
</template>

<script>
import generalMixin from '../mixins/general';

export default {
  name: 'LiveStream',
  mixins: [generalMixin],
  computed: {
    liveStreamLink() {
      return this.getEnvVariable('LIVESTREAM_LINK');
    },
  },
};
</script>

<style scoped>
.live-stream-background {
  z-index: 188;
}
.page-container {
  width: 100vw;
  height: 90vh;
  display: flex;
  align-content: center;
  justify-content: center;
}
#iframe-wrapper {
  width: 70vw;
  height: 60vh;
  position: absolute;
  align-self: center;
  z-index: 1000;
  border: 2rem solid var(--color-light-border);
  padding: 0;
  padding-top: 0px;
  margin-top: -1px;
}
#live-stream-wrapper {
  width: 100.25%;
  height: 100%;
  margin-bottom: -1px;
}
</style>
