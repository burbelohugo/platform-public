<template>
  <div>
    <div
      v-if="dataLoaded"
      id="app-12"
    >
      <b-container style="margin-bottom: 3rem;">
        <b-row>
          <b-col cols="12">
            <h2 class="schedule-carousel-title">
              {{ title }}
            </h2>
            <carousel
              :perPage="3"
              :navigationEnabled="true"
              paginationColor="var(--color-placeholder)"
              paginationActiveColor="var(--color-dark-text)"
              :mouseDrag="false"
              :centerMode="true"
              :loop="true"
            >
              <slide
                class="p-2"
                v-for="event in sortedRawEvents"
                :key="event.id"
              >
                <b-card
                  :title="event.event_name"
                  :img-src="getBannerImgForEvent(event)"
                  img-alt="Image"
                  img-top
                  tag="article"
                  style="height: 100%;"
                >
                  <b-card-text>
                    {{ getTimeDescriptionForEvent(event) }}
                  </b-card-text>
                  <Button
                    secondary
                    @click="openSchedModal(event)"
                  >More info</Button>
                </b-card>
              </slide>
              <p
                v-if="sortedRawEvents.length === 0 && useSavedEvents"
                style="margin-top: 1rem;"
              >Add an event to your list by clicking the star icon next to an event card! Once you add events to your list, you can see your event list here.</p>
            </carousel>
          </b-col>
        </b-row>
      </b-container>
    </div>
    <LoadingSpinner v-else />
  </div>
</template>

<script>
import { Carousel, Slide } from 'vue-carousel';
import Button from './Button';
import generalMixin from '../mixins/general';
import scheduleMixin from '../mixins/schedule';
import LoadingSpinner from './LoadingSpinner.vue';

export default {
  name: 'ScheduleCarousel',
  components: {
    carousel: Carousel,
    slide: Slide,
    LoadingSpinner,
    Button,
  },
  props: {
    title: String,
    useSavedEvents: {
      type: Boolean,
      default: false,
    },
    selectedEvent: Object,
    dataLoaded: Boolean,
    rawEvents: Array,
  },
  mixins: [generalMixin, scheduleMixin],
  data() {
    return {
      slide: 0,
      sliding: null,
    };
  },
  methods: {
    onSlideStart() {
      this.sliding = true;
    },
    onSlideEnd() {
      this.sliding = false;
    },
    openSchedModal(event) {
      this.$emit('openScheduleModal', event);
    },
  },
  computed: {
    sortedRawEvents() {
      const events = this.rawEvents;
      return events.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
    },
  },
};
</script>

<style>
.row {
  margin-top: 100px;
}

.schedule-carousel-title {
  font-style: normal;
  font-weight: bold;
  font-size: 26px;
  line-height: 31px;
  text-align: center;
}

.card {
  overflow: hidden;
}

.card-title {
  font-size: 20px;
}

.VueCarousel-dot-container {
  margin-top: 0px !important;
}
</style>
