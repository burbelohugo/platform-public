<template>
  <div
    v-if="dataLoaded"
    class="card-container"
  >
    <template v-if="upcomingEvents.length > 0">
      <div
        class="d-flex event-card"
        v-for="event in upcomingEvents"
        :key="event.id"
      >
        <div class="banner-img-container">
          <img
            class="banner-img"
            :src="getBannerImgForEvent(event)"
          />
        </div>
        <div class="card-content ml-3 text-left d-flex flex-column">
          <div class="top-header-row">
            <h3 class="event-title">{{ event.event_name }}
            </h3>
            <LiveIcon
              :isLive="eventIsLive(event)"
              class="live-icon"
            />
          </div>
          <p class="text-muted"><em>{{getTimeDescriptionForEvent(event)}}</em></p>
          <p class="max-lines-2">{{event.description}}</p>
          <div class="btn-container d-flex">
            <Button
              outlined
              size="sm"
              @click="openSchedModal(event)"
            >
              Learn More
            </Button>
            <ZoomButton
              v-if="eventIsLive(event)"
              :href="getLinkForEvent(event)"
              @click="trackEventAttendance(event)"
              class="ml-auto"
            >
              Attend
            </ZoomButton>
          </div>
        </div>
      </div>
    </template>
    <div v-else>
      <!--
        TODO: waiting on design for updated error image, will replace when we can
        <img
        class="error-img mt-5"
        src="../assets/error-icon.png"
      />-->
      <p class="no-events-text">No upcoming events!</p>
    </div>
  </div>
  <LoadingSpinner v-else />
</template>

<script>
import generalMixin from '../mixins/general';
import scheduleMixin from '../mixins/schedule';
import ZoomButton from './ZoomButton.vue';
import Button from './Button.vue';
import LoadingSpinner from './LoadingSpinner.vue';
import LiveIcon from './LiveIcon';

export default {
  name: 'EventBulletin',
  mixins: [generalMixin, scheduleMixin],
  props: {
    eventCount: {
      type: Number,
      default: 8,
    },
  },
  components: {
    LoadingSpinner,
    ZoomButton,
    Button,
    LiveIcon,
  },
  data() {
    return {
      rawEvents: [],
      days: [],
      selectedEvent: null,
      dataLoaded: false,
      startDate: new Date(this.getEnvVariable('START_DATE')),
      endDate: new Date(this.getEnvVariable('END_DATE')),
      targetEventId: null,
    };
  },
  methods: {
    openSchedModal(event) {
      // console.log({ event });
      this.$emit('openScheduleModal', event);
    },
    async trackEventAttendance(selectedEvent) {
      // console.log('event', selectedEvent.category);
      // Why must you do this to me Eslint
      // eslint-disable-next-line camelcase
      const { id, mode } = selectedEvent;

      const params = {
        online: (mode !== 'In-Person'),
        event: id,
        user_id: this.getUserId()
      };

      return this.performPostRequest(this.getEnvVariable('BACKEND'), 'tracking/attendance', params);
    },
    eventIsLive(event) {
      // Returns if the event us currently happening
      const start = new Date(event.start_time);
      const end = new Date(event.end_time);
      const now = new Date();

      return (start <= now) && (now <= end);
    },
  },
  async mounted() {
    this.rawEvents = await this.getData(
      this.getEnvVariable('BACKEND'),
      'schedule',
    );
    this.dataLoaded = true;
  },
  computed: {
    upcomingEvents() {
      const now = new Date();

      const eventsWithDates = this.rawEvents.map((event) => ({
        ...event,
        start_time: new Date(event.start_time),
        end_time: new Date(event.end_time),
      }));

      return eventsWithDates
        .filter((a) => a.end_time >= now)
        .sort((a, b) => {
          const btime = b.start_time;
          const atime = a.start_time;
          return atime.getTime() - btime.getTime();
        })
        .slice(0, this.eventCount);
    },
  },
};
</script>

<style scoped>
.top-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.live-icon {
  margin-left: 0.5rem;
  flex-shrink: 0;
}

.event-title {
  font-family: var(--body-font);
  margin-bottom: -0.25rem;
  font-size: 1.75rem;
}

.banner-img-container {
  width: 33%;
  min-width: 150px;
  border-radius: var(--border-radius);
  overflow: hidden;
  flex-shrink: 0;
}

.banner-img {
  height: 100%;
  width: 100%;
  object-fit: cover;
}

.event-card {
  border-top: 3px solid var(--color-light-border);
  padding: 2rem 1rem;
}

.event-card:first-of-type {
  border-top: 0;
}

.btn {
  margin: 0;
}

.btn-container {
  margin-top: auto;
}

.card-content {
  /* Flexbox witchcraft due to the default min-width being auto */
  min-width: 0px;
  flex: 1;
}

.event-title {
  margin-bottom: 0;
  font-family: var(--body-font);
}

.error-img {
  width: 200px;
}

.no-events-text {
  font-size: 1.75rem;
  margin-top: 3rem;
  font-weight: bold;
}
</style>
