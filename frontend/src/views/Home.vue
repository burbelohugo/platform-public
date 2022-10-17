<template>
  <div id="home-page">
    <div class="home-header">
      <h2 class="page-header my-0">{{randomGreeting}}</h2>
      <div
        v-if="getUserGroup() === 'sponsor'"
        class="sponsor-buttons"
      >
        <Button
          @click="openIntercom()"
          class="sponsor-button"
        >
          Chat with an Organizer
        </Button>
        <Button
          class="sponsor-button"
          @click="goToSponsorAnalytics()"
        >
          My Sponsor Booth
        </Button>
      </div>
    </div>
    <b-card class="bulletin">
      <div class="column-card">
        <h4 class="section-title">Event Bulletin</h4>
        <p class="text-muted">
          <vue-countdown
            :time="countdownTime"
            :transform="transformSlotProps"
            v-if="hackingHasStarted"
            v-slot="{ hours, minutes }"
          >
            <em><strong>Time Left to Hack</strong>: {{ hours }} hours {{ minutes }} minutes</em>
          </vue-countdown>
          <em v-else>Hacking begins Saturday {{ hackingStartTime }}</em>
        </p>
        <div class="list-wrapper">
          <EventBulletin @openScheduleModal="openScheduleModalDirect"></EventBulletin>
        </div>
      </div>
    </b-card>
    <b-card class="announcements">
      <div class="column-card">
        <h4 class="section-title">Announcements</h4>
        <div class="announcement-list list-wrapper">
          <template v-if="dataLoaded">
            <template v-if="announcements.length > 0">
              <Banner
                v-for="announcement in announcements"
                :html="announcement.text"
                :key="announcement.id"
              />
            </template>
            <template v-else>
              <Banner text="Welcome to Technica 2021!" />
            </template>
          </template>
          <LoadingSpinner v-else />
        </div>
      </div>
    </b-card>
    <EventModal
      :selectedEvent="selectedEvent"
      :handleListToggle="toggleEventInList"
    />
    <EasterEgg
      :index=0
      :hint="'Welcome to the Technica 2021 Scavenger Hunt! Find all the Technica characters to win a special prize. Here’s your first Techniclue: decipher “CAOLSI” to know the name of the page the next character is located.'"
      :fileName="'scavenger-hunt/1.png'"
    />
  </div>
</template>

<script>
import Banner from '@/components/Banner.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
// import ScheduleCarousel from '@/components/ScheduleCarousel.vue';
import Vue from 'vue';
import VueCountdown from '@chenfengyuan/vue-countdown';
import EventBulletin from '@/components/EventBulletin';
import Button from '../components/Button.vue';
import EventModal from '../components/EventModal';
import generalMixin from '../mixins/general';
import scheduleMixin from '../mixins/schedule';
import EasterEgg from '../components/EasterEgg.vue';

Vue.component(VueCountdown.name, VueCountdown);

export default {
  name: 'Home',
  components: {
    Banner,
    // ScheduleCarousel,
    Button,
    LoadingSpinner,
    VueCountdown,
    EventModal,
    EventBulletin,
    EasterEgg,
  },
  mixins: [generalMixin, scheduleMixin],
  methods: {
    initiateOnboardingWalkthrough() {
      // eslint-disable-next-line no-undef
      Intercom('startTour', this.getEnvVariable('PLATFORM_WALKTHROUGH_ID'));
    },
    openIntercom() {
      // eslint-disable-next-line no-undef
      Intercom('show');
    },
    async getAnnouncements() {
      const announcements = await this.performGetRequest(
        this.getEnvVariable('BACKEND'),
        'admin/announcements',
        {},
      );
      const formattedAnnouncements = Object.values(announcements);
      // sort the ISO time strings lexicographigally in descending order
      formattedAnnouncements.sort((a1, a2) => String(a2.timestamp).localeCompare(String(a1.timestamp)));
      this.announcements = formattedAnnouncements;
    },
    async setupIntercomUserData() {
      const user = await this.getCurrentUser();
      window.intercomSettings = {
        email: user.email,
        name: user.full_name,
        app_id: this.getEnvVariable('INTERCOM_APP_ID'),
      };
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
      rawEvents: [],
      formattedEvents: {},
      eventsInUserList: [],
      selectedDay: null,
      days: [],
      timeWindows: [],
      scheduleColumns: 3,
      dataLoaded: false,
      selectedEvent: {},
      startDate: new Date(this.getEnvVariable('START_DATE')),
      endDate: new Date(this.getEnvVariable('END_DATE')),
      announcements: [],
      countdownTime: deadline - now,
      campfireGamesData: {
        red: { teamName: 'Red', points: 0 },
        blue: { teamName: 'Blue', points: 0 },
        green: { teamName: 'Green', points: 0 },
      },
      assignedCampfireTeam: null,
    };
  },
  async mounted() {
    [, , this.rawEvents] = await Promise.all([
      this.getAnnouncements(),
      this.getEventsFromUserList(),
      this.getData(
        this.getEnvVariable('BACKEND'),
        'schedule',
      ),
    ]);
    this.dataLoaded = true;
    await this.activityTracking('HOME');
    this.setupIntercomUserData();
  },
  beforeCreate() {
    document.body.className = 'home';
  },
  beforeDestroy() {
    document.body.className = '';
  },
  computed: {
    randomGreeting() {
      const greetings = [
        'Hello',
        'Welcome',
        'Hola',
        'Guten Tag',
        'G\'day',
        'Bonjour',
        'Konnichiwa',
        'Zdravstvuyte',
        'Nǐ hǎo',
        'Assalaam u alaikum',
        'Hej',
        'Namaste',
        'Selamat siang',
        'Shalom',
        'Dzień dobry',
        'Anyoung haseyo',
        'Salve',

      ];

      const someGreeting = greetings[Math.floor(greetings.length * Math.random())];

      return `${someGreeting}, ${this.getUserName()}`;
    },
    hackingHasStarted() {
      return new Date() > new Date(this.getEnvVariable('START_DATE'));
    },
    hackingStartTime() {
      let time = this.formatAMPM(new Date(this.getEnvVariable('START_DATE')));
      if (time[0] === '0') {
        time = time.slice(1);
      }

      return time;
    },
  },
};
</script>

<style scoped>
#home-page {
  /* Screen size minus approx navbar height */
  box-sizing: border-box;
  width: 100%;
  padding: 2rem 4rem;
  display: grid;
  gap: 2rem;
  grid-template-columns: 3fr 2fr;
  grid-template-rows: max-content 340px 340px;
  grid-template-areas:
    "header header"
    "bulletin announcements"
    "bulletin announcements";
  place-items: stretch;
}

@media only screen and (max-width: 968px) {
  #home-page {
    padding: 1rem;
    gap: 1rem;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: max-content 400px 400px;
    grid-template-areas:
      "header header"
      "bulletin bulletin"
      "announcements announcements";
  }
}

.home-header {
  grid-area: header;
}

.announcements {
  grid-area: announcements;
}

.bulletin {
  grid-area: bulletin;
  min-height: 0;
}

.scoreboard {
  grid-area: scoreboard;
}

.section-title {
  padding: 0 1rem;
}

.list-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-bottom: 1rem;
  border: 3px solid var(--color-light-border);
  border-left: none;
  border-right: none;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
}

.column-card {
  display: flex;
  height: 100%;
  flex-direction: column;
  min-height: 0;
  
}


::v-deep .card-body {
  display: flex;
  flex-direction: column;
}
</style>
