<template>
  <div>
    <h2 class="page-header">Expo</h2>
    <div class="container mx-auto">
      <template v-if="dataLoaded">
        <template v-if="group === 'hacker'">
          <template v-if="hasTeam && projectHasAlreadyBeenSubmitted">
            <template v-if="schedule.length !== 0">
              <p>
                Great work submitting a hack! In order to demo your hack to our judges, please join
                the zoom call at the specified time. When you join a demo session, please rename
                yourself in Zoom to <strong>"&lt;Your Name&gt; (&lt;Your Team Name&gt;)"</strong>
              </p>
              <div class="demos-container">
                <template v-for="demo in schedule">
                  <DemoCard
                    :demo="demo"
                    :key="demo.id"
                  />
                </template>
              </div>
            </template>
            <p v-else>
              Sit tight&mdash;we're currently creating the Expo schedule. We will update this page when the demo times are finalized.
            </p>
          </template>
          <p v-else>
            You cannot participate in Expo if you didn't <router-link to="/project">submit your hack</router-link>
          </p>
        </template>
        <template v-else>
          <template v-if="schedule.length !== 0">
            <p class="table-description">Below is a list of the demos and corresponding Zoom Rooms. For an individual prize category, the Zoom room will stay the same.</p>
            <ExpoTable :items="formatSchedule(schedule)" />
          </template>
          <p v-else>
            Sit tight&mdash;we're currently creating the Expo schedule. We will update this page when the demo times are finalized.
          </p>
        </template>
      </template>
      <LoadingSpinner v-else />
    </div>
  </div>
</template>

<script>

import DemoCard from '@/components/DemoCard.vue';
import ExpoTable from '@/components/ExpoTable';
import LoadingSpinner from '@/components/LoadingSpinner';
import generalMixin from '../mixins/general';

export default {
  name: 'Expo',
  mixins: [generalMixin],
  components: {
    DemoCard,
    ExpoTable,
    LoadingSpinner,
  },
  data() {
    return {
      projectHasAlreadyBeenSubmitted: false,
      schedule: null,
      dataLoaded: false,
      currentTeamId: null,
      access_level: null,
      group: null,
    };
  },
  async created() {
    this.access_level = this.getCurrentUser().access_level;
    this.group = this.getUserGroup();
    await this.getSchedule();
    this.dataLoaded = true;
  },
  methods: {
    async getTeam() {
      const teamParams = {
        user_id: this.getUserId(),
      };
      const team = await this.performGetRequest(this.getEnvVariable('BACKEND'), 'teams/membership', teamParams);
      if (team.team) {
        this.hasTeam = true;
        const params = {
          team_id: team.team,
        };
        // check submission status of project
        const status = await this.performGetRequest(this.getEnvVariable('BACKEND'), 'teams/submission', params);
        this.projectHasAlreadyBeenSubmitted = status.project_submitted;
        this.currentTeamId = team.team;
      }
    },
    async getTeamExpoSchedule() {
      await this.getTeam();
      const params = {
        teamId: this.currentTeamId,
      };
      const schedule = await this.performGetRequest(this.getEnvVariable('BACKEND'), 'expo/schedule/user', params);
      return schedule.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
    },
    async getSponsorExpoSchedule() {
      const params = {
        sponsorName: this.access_level,
      };
      return this.performGetRequest(this.getEnvVariable('BACKEND'), 'expo/schedule/sponsor', params);
    },
    async getFullExpoSchedule() {
      return this.performGetRequest(
        this.getEnvVariable('BACKEND'),
        'expo/schedule',
        {},
      );
    },
    async getSchedule() {
      if (this.group === 'hacker') {
        this.schedule = await this.getTeamExpoSchedule();
      } else if (this.group === 'sponsor') {
        this.schedule = await this.getSponsorExpoSchedule();
        if (this.schedule.length === 0) {
          this.schedule = await this.getFullExpoSchedule();

          // Try to filter only for this sponsor's demos
          const demosForSponsor = this.schedule.filter((demo) => demo.sponsor_name === this.access_level);

          // If this filtering didn't work, just render the full schedule
          this.schedule = demosForSponsor.length > 0 ? demosForSponsor : this.schedule;
        }
      } else {
        this.schedule = await this.getFullExpoSchedule();
      }
    },
    formatSchedule(schedule) {
      const items = [];
      if (schedule) {
        Object.values(schedule).forEach((k) => {
          const item = {};
          item.team_name = k.team_name;

          // convert times to EST
          let startTime = new Date(k.start_time);
          startTime.setHours(startTime.getHours());
          startTime = this.formatAMPM(startTime);

          let endTime = new Date(k.end_time);
          endTime.setHours(endTime.getHours());
          endTime = this.formatAMPM(endTime);

          item.time = `${startTime} - ${endTime}`;
          item.sponsor_name = k.sponsor_name;
          item.zoom_link = k.zoom_link;
          items.push(item);
        });
      }
      return items;
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.filler {
  cursor: text !important;
}

.content-container {
  border-radius: 8px;
  padding: 3rem;
  background-color: var(--color-foreground);
  border-radius: 4px;
  text-align: center;
  margin-bottom: 2rem;
}
.demos-container {
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.table-description {
  margin: -1rem auto 3rem;
  width: 75%;
}
</style>
