<template>
  <div class="about">
    <h2 class="page-header">Help Desk</h2>
    <div id="help-body">
      <div class="container">
        <div class="row justify-content-center">
          <p class="col-md-8">
            If you have platform related questions, you are in the right place! Click on
            one of the buttons below to get help from a Technica organizer. 
          </p>
        </div>
      </div>
      <div class="btn-container">
        <!-- <Button
          @click="initiateOnboardingWalkthrough"
          class="mt-0"
        >
          <img
            src="../assets/tour-icon.svg"
            class="btn-icon btn-icon-left"
          >
          Take the Platform Tour
        </Button> -->
        <ZoomButton
          size="lg"
          :href="helpDeskLink"
        >Talk to an organizer over video</ZoomButton>
        <Button
          @click="openIntercom"
          secondary
        >
          <img
            src="../assets/chat-icon.svg"
            class="btn-icon btn-icon-left"
          >
          Chat with an organizer
        </Button>
      </div>
    </div>
  </div>
</template>

<script>
import Button from '@/components/Button.vue';
import ZoomButton from '@/components/ZoomButton.vue';
import generalMixin from '../mixins/general';

export default {
  name: 'HelpDesk',
  mixins: [generalMixin],
  components: {
    Button,
    ZoomButton,
  },
  async mounted() {
    await this.activityTracking('HELPDESK');
  },
  computed: {
    helpDeskLink() {
      return this.getEnvVariable('HELPDESK_ZOOM_LINK');
    },
  },
  methods: {
    initiateOnboardingWalkthrough() {
      // eslint-disable-next-line no-undef
      Intercom('startTour', this.getEnvVariable('PLATFORM_WALKTHROUGH_ID'));
    },
    openIntercom() {
      // eslint-disable-next-line no-undef
      Intercom('show');
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.row {
  margin-top: 0;
}

.card,
.card-body {
  border: 0;
  border-radius: var(--border-radius);
}

.card-body {
  background-color: var(--color-foreground-accent);
}

.filler {
  cursor: text !important;
}

.help-links {
  font-weight: bold;
  color: var(--color-dark-text);
}
.btn-container {
  margin: 2rem auto;
  display: inline-flex;
  flex-direction: column;
  align-items: stretch;
}
</style>
