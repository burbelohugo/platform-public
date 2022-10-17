<template>
  <div class="event-modal-wrapper row">
    <!-- Banner Image -->
    <div class="col-3 p-0 event-img-wrapper">
      <img
        class="img-fluid event-banner-img"
        :src="getBannerImgForEvent(selectedEvent)"
        alt="Event Banner"
      />
    </div>
    <div class="col-9 event-modal-content">
      <div class="event-modal-info">
        <!-- Basic Event Info -->
        <div class="event-modal-header">
          <div class="top-header-row">
            <h5 class="event-title">{{ selectedEvent.event_name }}
            </h5>
            <LiveIcon
              :isLive="eventIsLive"
              class="live-icon"
            />
          </div>

          <!-- In-Depth Description -->
          <p class="event-description">
            {{ selectedEvent.description }}
          </p>

          <em class="text-muted">
            {{ getTimeDescriptionForEvent(selectedEvent) }}
          </em>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import scheduleMixin from '../mixins/schedule';
import generalMixin from '../mixins/general';
import LiveIcon from './LiveIcon.vue';

export default {
  mixins: [generalMixin, scheduleMixin],
  props: {
    selectedEvent: Object,
    handleListToggle: Function,
  },
  components: { LiveIcon },
  computed: {
    eventIsLive() {
      // Returns if the event us currently happening
      const start = new Date(this.selectedEvent.start_time);
      const end = new Date(this.selectedEvent.end_time);
      const now = new Date();

      return start <= now && now <= end;
    },
  },
};
</script>

<style scoped>
.event-modal-wrapper {
  display: flex;
  text-align: left;
  margin: 0.5rem;
  border-radius: 8px;
  border: 2px solid var(--color-border);
  width: 90%;
  min-height: auto;
}

.event-modal-content {
  height: auto;
  min-height: auto !important;
}

.event-img-wrapper {
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;
  overflow: hidden;
  background-color: var(--color-border);
}

.event-banner-img {
  display: block;
  height: 100%;
  width: 100%;
  object-fit: cover;
}

.event-modal-info {
  flex-grow: 1;
  margin: 0.5rem 1rem;
  display: block;
  flex-direction: column;
}

.top-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.live-icon {
  margin-left: 0.5rem;
  flex-shrink: 0;
}

.event-title {
  font-family: var(--body-font);
  margin-bottom: -0.25rem;
}

.event-description {
  margin: 1rem 0 0.5rem;
}

/* Fix word wrapping */
.event-description,
.event-title {
  word-break: break-word;
}
</style>
