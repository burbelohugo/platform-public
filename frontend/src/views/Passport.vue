<template>
<div class="mt-5">
  <b-card>
    <h3 class="page-header">Swag Progression</h3>
    <p class="mb-5">
      By participating in mini games and attending workshops,
      you can earn Technica swag! See if you can earn
      all tiers of swag by the end of the event!
    </p>
    <ProgressionTriangle/>
  </b-card>
  </div>
</template>

<script>
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import generalMixin from '../mixins/general';
import usersMixin from '../mixins/users';
import ProgressionTriangle from '../components/ProgressionTriangle.vue';

export default {
  name: 'Passport',
  components: {
    LoadingSpinner,
    ProgressionTriangle,
  },
  mixins: [generalMixin, usersMixin],
  data() {
    return {
      activityLoaded: false,
      userDidFillOutProfile: false,
      achievements: [],
      eventsAttended: [],
      userPoints: 0,
    };
  },
  async mounted() {
    // Fetch a user's points and achievements
    const responses = await Promise.all([this.checkIfUserDidFillOutProfile()]);

    // Only process the responses if the requests succeeded
    if (responses.every((response) => response !== null)) {
      [this.userDidFillOutProfile] = responses;
    } else {
      console.error('Unable to retrieve points');
    }

    this.activityLoaded = true;
  },
  methods: {
    async checkIfUserDidFillOutProfile() {
      // Returns whether the user filled out their profile
      // by fetching it from the schedule

      // Fetch an up-to-date user profile
      const userParams = { id: this.getUserId() };
      const user = await this.performGetRequest(
        this.getEnvVariable('BACKEND'),
        'users',
        userParams,
      );

      // Check if the profile contains all of the requried fields
      const requiredFields = ["devpost", "github", "project_description", "profile_text", "email"];
      const isFilledOut = user.hacker_profile && requiredFields.every((field) => field in user.hacker_profile);
      return isFilledOut;
    },
  },
};
</script>

<style scoped>
.passport-container {
  padding: 30px;
}

.display-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  width: 100%;
}

.passport-wrapper {
  width: 100%;
  height: 80vh;
  display: flex;
  flex-direction: row;
  background: var(--color-foreground);
  box-sizing: border-box;
  border-radius: 35px 35px 35px 35px;
  overflow: hidden;
}

.left-panel-inner {
  width: 50%;
  height: 100%;
  border-right: 2px solid var(--color-light-border);
  display: flex;
  flex-direction: column;
}

.passport-title-bold {
  margin-left: 1rem;
  font-size: 36px;
  line-height: 46px;
}

.member-list-photo {
  border-radius: 4px;
  width: 6rem;
  height: 6rem;
  margin: 3px;
  border: 1px solid var(--color-light-border);
}

.member-list-info {
  margin-top: 1rem;
  margin-bottom: 2rem;
  margin-right: 1rem;
  margin-left: 0.75rem;
}

.attendance-title {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 30%;
  padding-top: 1rem;
  flex: 0;
}

.attendance-text {
  font-weight: bold;
  font-size: 36px;
  line-height: 46px;
  text-align: center;
  flex: 0;
}

.events-title-wrapper {
  width: 100%;
  padding-top: 1rem;
}

.events-title-wrapper p {
  margin-bottom: 0.5rem;
}

.dot-wrapper {
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  width: 100%;
  border-top: 2px solid var(--color-light-border);
  overflow-y: auto;
}

@media (max-width: 1500px) {
  .member-list-photo {
    width: 5rem;
    height: 5rem;
  }
}

.achievement {
  text-align: left;
  padding: 0.5rem;
  margin: 0 0.5rem;
}

.achievement:not(:last-child) {
  border-bottom: 2px solid var(--color-light-border);
}

.achievement-text {
  margin-bottom: 0.25rem;
  font-weight: bold;
}

.sticker-container {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  align-content: space-around;
  align-items: flex-start;
}

.sticker {
  flex-basis: 50%;
  padding: 0;
}
</style>
