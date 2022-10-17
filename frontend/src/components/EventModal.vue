<template>
  <b-modal
    id="scheduleEventModal"
    size="lg"
    centered
    :title="selectedEvent.event_name"
    title-sr-only
  >
    <!--Empty templates to prevent default Bootstrap styles-->
    <template v-slot:modal-header>
      <div></div>
    </template>
    <template v-slot:modal-footer>
      <div></div>
    </template>

    <div class="event-modal-content">
      <!-- Left Pane -->
      <div class="left-pane">
        <!-- Close Button -->
        <button
          type="button"
          aria-label="Close"
          class="modal-close-button absolute-button"
          @click="closeModal()"
        >
          <img
            src="../assets/plus.svg"
            class="modal-close-icon"
          />
        </button>

        <!-- Favoriting Icon -->
        <button
          type="button"
          aria-label="Favorite"
          class="favorite-button absolute-button"
          @click="favoriteEvent"
        >
          <img
            :src="getFavoriteIconForEvent(selectedEvent)"
            alt="Favorite Icon"
          />
        </button>

        <!-- Banner Image -->
        <img
          class="event-banner-img"
          :src="getBannerImgForEvent(selectedEvent)"
          alt="Event Banner"
        />
      </div>

      <section class="event-modal-info">
        <!-- Basic Event Info -->
        <header class="event-modal-header">
          <div class="top-header-row">
            <h3 class="event-title">{{ selectedEvent.event_name }}
            </h3>
            <LiveIcon
              :isLive="eventIsLive"
              class="live-icon"
            />
          </div>

          <em class="text-muted">
            {{ getTimeDescriptionForEvent(selectedEvent) }}
            <br />
            <div class="location">
              {{ selectedEvent.location }}
            </div>
          </em>
          <div class="event-tags">
            <div class="tag-pill" v-for="item in getTagsForEvent(selectedEvent)" :key="item">
              {{ item }}
            </div>
          </div>
        </header>

        <!-- In-Depth Description -->
        <p class="event-description">
          {{ selectedEvent.description }}
        </p>

        <!-- Action Links -->
        <footer class="event-modal-footer">
          <AddToCalendarButton :selectedEvent="selectedEvent" />
          <ZoomButton
            :href="getLinkForEvent(selectedEvent)"
            @click="trackEventAttendance(selectedEvent)"
          >
            Attend
          </ZoomButton>
        </footer>
      </section>
    </div>
  </b-modal>
</template>

<script>
import ZoomButton from './ZoomButton.vue';
import scheduleMixin from '../mixins/schedule';
import generalMixin from '../mixins/general';
import AddToCalendarButton from './AddToCalendarButton.vue';
import LiveIcon from './LiveIcon.vue';

export default {
  mixins: [generalMixin, scheduleMixin],
  props: {
    selectedEvent: Object,
    handleListToggle: Function,
  },
  components: { ZoomButton, AddToCalendarButton, LiveIcon },
  methods: {
    favoriteEvent() {
      // Calls the provided handler, then force updates to
      // adjust the state of the button
      this.handleListToggle(this.selectedEvent);
      this.$forceUpdate();
    },
    closeModal() {
      this.$bvModal.hide('scheduleEventModal');
    },
    async trackEventAttendance(selectedEvent) {
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
  },
  async mounted() {
    // console.log('Selected Event', this.selectedEvent);
  },
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
/* Modal Content */
.event-modal-content {
  min-height: 400px;
  display: flex;
  border-radius: var(--border-radius);
  background-color: var(--color-foreground);
  position: relative;
}

.left-pane {
  min-width: 45%;
  width: 50%;
  position: relative;
  border-top-left-radius: var(--border-radius);
  border-bottom-left-radius: var(--border-radius);
  overflow: hidden;
}

@media screen and (max-width: 992px) {
  .left-pane {
    min-width: 20%;
  }
}

.favorite-button {
  top: 1rem;
  right: 1rem;
  background: transparent;
}

.favorite-button img {
  width: 100%;
  height: 100%;
}

.event-banner-img {
  width: 100%;
  height: 100%;
  align-self: stretch;
  object-fit: cover;
}

.event-modal-info {
  flex-grow: 1;
  margin: 1rem;
  display: flex;
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
}

.event-modal-footer {
  margin-top: auto;
  flex-grow: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.absolute-button {
  position: absolute;
  border: 0;
  width: 2rem;
  height: 2rem;
  padding: 0;
}

.absolute-button:focus {
  box-shadow: 0px 0px 0px 4px var(--color-focus);
}

/* Modal closing */
.modal-close-button {
  top: 1rem;
  left: 1rem;
  background-color: var(--color-foreground);
  border-radius: 50%;
  box-shadow: 0px 4px 4px var(--color-shadow);
}

.modal-close-icon {
  /* I could create a new asset for the x-icon... or I could do this 🙃 */
  transform: rotate(45deg);
  height: 100%;
  transition: transform 250ms ease-in-out;
  border-radius: 50%;
}

.modal-close-button:hover .modal-close-icon {
  transform: rotate(135deg);
}

.event-description {
  margin: 1rem 0 0.5rem;
}

.event-tags {
  display: inline-block;
  padding-top: 1vh;
}
.tag-pill {
  float: left;
  transition: all 250ms ease-in-out;
  background-color: #b6a1c4;
  color: #fff;
  margin: 0.1rem;
  border-radius: 10px;
  padding: 0rem 0.5rem 0rem 0.5em;
}
.tag-pill:hover {
  background-color: #9484a1;
}

/* Fix word wrapping */
.event-description,
.event-title {
  word-break: break-word;
}

@media screen and (max-width: 992px) {
  .event-modal-footer {
    flex-direction: column-reverse;
    align-items: stretch;
  }
}

/* Removing default bootstrap styles */
#scheduleEventModal,
::v-deep .modal-header,
::v-deep .modal-footer,
::v-deep .modal-footer > *,
::v-deep .modal-body,
::v-deep .modal-content {
  border: 0;
  padding: 0;
  margin: 0;
  background: transparent;
}
</style>
