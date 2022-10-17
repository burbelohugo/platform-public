<template>
  <b-card class="text-left">
    <div class="d-flex flex-column h-100">
      <b-card-title class="title">
        {{ demo.sponsor_name }}
      </b-card-title>
      <p>
        {{ `${formatAMPM(new Date(demo.start_time))} – ${formatAMPM(new Date(demo.end_time))}` }}
      </p>
      <div class="zoom-btn-container">
        <ZoomButton
          :href="demo.zoom_link"
          size="sm"
          class="m-0 w-100"
        >
          <span>Attend</span>
        </ZoomButton>
      </div>
    </div>
  </b-card>
</template>

<script>
import ZoomButton from '@/components/ZoomButton.vue';
import generalMixin from '../mixins/general';

export default {
  name: 'DemoCard.vue',
  props: {
    demo: Object,
  },
  mixins: [generalMixin],
  components: {
    ZoomButton,
  },
};
</script>

<style scoped>
.card {
  border: 1px solid var(--color-border);
  margin: 1rem;
  max-width: 300px;
}
.title {
  font-family: var(--body-font);
  font-weight: bold;
  margin-bottom: 0;
  font-size: 1.75rem;
}

.zoom-btn-container {
  margin: 0;
  margin-top: 1rem;
  flex: 1;
  display: flex;
  align-items: flex-end;
}
</style>
