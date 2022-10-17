<template>
  <div id="" class="row m-0 p-0">
    <!-- SCHEDULE -->
    <div class="col-4 dash-section info">
      <div class="panel" style="flex: 1 1 auto">
        <h3>Upcoming Events</h3>
        <StreamEventBulletin></StreamEventBulletin>
      </div>

    </div>

    <!-- MIDDLE -->
    <div class="col-4 dash-section" style="justify-content: center;">
      <div class="middle my-auto">
        <img src="../assets/technica/loader.gif" class="bitcamp-flame" />
        <h1>Technica</h1>
      </div>

      <div class="bottom pb-5 info">
        <vue-countdown :time="countdownTime" :transform="transformSlotProps" v-slot="{ hours, minutes }">
          <h3>{{ hours }} hours {{ minutes }} minutes</h3>
        </vue-countdown>
        <h3>left to submission</h3>
      </div>

    </div>

    <!-- ANNOUNCEMENTS AND LEADERBOARD -->
    <div class="col-4 dash-section info">

      <div class="panel" style="flex: 1 1 auto">
        <h3>Announcements</h3>
        <div class="list">
          <template v-if="dataLoaded">
            <Banner
              v-for="announcement in announcements"
              :html="announcement.text"
              :key="announcement.id"
              :hideLogo="true"
              style="font-size: 20px"
            />
          </template>
          <LoadingSpinner v-else />
        </div>
      </div>

      <div class="panel" style="flex: 0 0 auto">
      <h3>Campfire Leaderboard</h3>
          <LeaderboardBars />
      </div>

    </div>

  </div>
</template>

<script>
import Banner from '@/components/Banner.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import LeaderboardBars from '@/components/LeaderboardBars.vue';
import Vue from 'vue';
import VueCountdown from '@chenfengyuan/vue-countdown';
import StreamEventBulletin from '@/components/StreamEventBulletin';
import generalMixin from '../mixins/general';
import scheduleMixin from '../mixins/schedule';

Vue.component(VueCountdown.name, VueCountdown);

export default {
  name: 'Event',
  components: {
    Banner,
    LoadingSpinner,
    LeaderboardBars,
    VueCountdown,
    StreamEventBulletin,
  },
  mixins: [generalMixin, scheduleMixin],
  methods: {
    async getAnnouncements() {
      const announcements = await this.performGetRequest(
        this.getEnvVariable('BACKEND'),
        'admin/announcements',
        {},
      );
      const formattedAnnouncements = [];
      Object.keys(announcements).forEach((a) => {
        formattedAnnouncements.push(announcements[a]);
      });
      // sort the ISO time strings lexicographigally in descending order
      formattedAnnouncements.sort().reverse();
      this.announcements = formattedAnnouncements;
    },
    goToSponsorAnalytics() {
      this.$router.push(`/sponsor-analytics?id=${this.getSponsorBoothId()}`);
    },
    transformSlotProps(props) {
      const formattedProps = {};
      Object.entries(props).forEach(([key, value]) => {
        if (key !== 'days') { formattedProps[key] = value; }
      });
      formattedProps.hours += props.days * 24;
      return formattedProps;
    },
  },
  data() {
    const now = new Date();
    const deadline = new Date(this.getEnvVariable('STOP_HACKING_DATE'));

    return {
      dataLoaded: false,
      startDate: new Date(this.getEnvVariable('START_DATE')),
      endDate: new Date(this.getEnvVariable('END_DATE')),
      announcements: [],
      countdownTime: deadline - now,
      assignedCampfireTeam: null,
    };
  },
  async mounted() {
    this.getAnnouncements();
    const { mode } = this.$route.query;
    if (mode === 'hero') {
      document.body.className += ' hero';
    }
    if (mode === 'hide' || mode === 'hero') {
      document.getElementsByClassName('info').forEach((e) => {
        e.style.visibility = 'hidden';
      });
    }

    this.dataLoaded = true;
  },
  beforeCreate() {
    document.body.className = 'event';
  },
  beforeDestroy() {
    document.body.className = '';
  },
  async created() {
    setInterval(() => { this.getAnnouncements(); }, 10000);
  },
};
</script>

<style scoped>

h1 {
  font-size: 116px;
  /* color: var(--orange); */
}

h3 {
  margin-top: 2rem;
  margin-bottom: 2rem;
}

.bitcamp-flame {
  height: 20rem;
  margin-bottom: 1rem;
}

.middle {
  justify-content: center;
}

.bottom {
  justify-content: flex-end;
}

.dash-section {
  display: flex;
  flex-flow: column;
  height: 100vh;
}

.panel {
  background: var(--color-foreground);
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem;
  overflow-y: hidden !important;
  -webkit-overflow-y: hidden !important;
}

.list {
  display: flex;
  align-items: center;
  flex-direction: column;
  max-height: 85vh;
  overflow-y: hidden !important;
  -webkit-max-height: 85vh !important;
  -webkit-overflow-y: hidden !important;
}
</style>

<style>

body.event .intercom-lightweight-app {
  display: none;
}
</style>
