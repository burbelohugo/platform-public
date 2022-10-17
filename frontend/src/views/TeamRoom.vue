<!-- Removed this page because it didn't have any meaningful content -->

<template>
  <div>
    <b-container class="teams-container">
      <h2 class="page-header">Team Room</h2>
      <p>
        Your Team Room lists the current members of your team, and enables you
        to join a private video call that is only accessible to members of your
        team.
      </p>
      <div v-if="dataLoaded && hasTeam">
        <div class="d-flex justify-content-center flex-wrap">
          <div>
            <Button
              @click="joinSlack()"
              class="create-team-button"
            >
              <img
                src="../assets/chat-icon.svg"
                class="btn-icon btn-icon-left"
              >
              Team Slack Chat
            </Button>
          </div>
          <ZoomButton
            @click="joinZoom()"
            class="create-team-button"
            size="lg"
          >Private Team Video Call</ZoomButton>
        </div>
        <div class="d-flex justify-content-center mt-5 flex-wrap">
          <div
            v-for="member in currentTeam.members"
            :key="member.id"
            class="member-list-item"
          >
            <img
              v-bind:src="getProfileImageForUser(member)"
              class="member-list-photo"
            />
            <div class="member-list-info">
              <div>
                <b>{{ member.full_name }}</b>
              </div>
              <div>{{ member.email }}</div>
            </div>
          </div>
        </div>
      </div>
      <div
        v-if="dataLoaded && !hasTeam"
        class="display-container d-flex justify-content-center"
      >
        <div style="margin-bottom: 1rem">
          You must create or join a team to access your team room.
        </div>
        <Button
          size="lg"
          @click="createTeam()"
          class="create-team-button"
        >Create or Join a Team</Button>
      </div>
      <LoadingSpinner v-if="!dataLoaded" />
    </b-container>
  </div>
</template>

<script>
import Button from '@/components/Button.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import generalMixin from '../mixins/general';
import usersMixin from '../mixins/users';
import ZoomButton from '../components/ZoomButton.vue';

export default {
  name: 'TeamRoom',
  components: {
    Button,
    LoadingSpinner,
    ZoomButton,
  },
  mixins: [generalMixin, usersMixin],
  data() {
    return {
      currentTeam: null,
      dataLoaded: false,
      hasTeam: false,
    };
  },
  async mounted() {
    await this.getTeam();
    this.dataLoaded = true;
  },
  methods: {
    async getTeam() {
      const teamParams = {
        user_id: this.getUserId(),
      };
      const team = await this.performGetRequest(
        this.getEnvVariable('BACKEND'),
        'teams/membership',
        teamParams,
      );
      if (team[0]) {
        this.hasTeam = true;
        const params = {
          team_id: team[0].team_id,
        };
        const teamMembers = await this.performGetRequest(
          this.getEnvVariable('BACKEND'),
          'teams/members',
          params,
        );
        const teamInfoParams = {
          id: team[0].team_id,
        };
        const teamInfo = await this.performGetRequest(
          this.getEnvVariable('BACKEND'),
          'teams',
          teamInfoParams,
        );
        this.currentTeam = {};
        this.currentTeam.members = teamMembers;
        this.currentTeam.name = 'My Team';
        // eslint-disable-next-line prefer-destructuring
        this.currentTeam.teamInfo = teamInfo;
        this.currentTeam.id = team[0].team_id;
      }
    },
    joinSlack() {
      const win = window.open(
        this.getEnvVariable('SLACK_INVITE_LINK'),
        '_blank',
      );
      win.focus();
    },
    createTeam() {
      this.$router.push('Team');
    },
  },
};
</script>

<style scoped>
.teams-container {
  padding: 30px;
}

.display-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.member-list-item {
  box-sizing: border-box;
  box-shadow: 0px 2px 2px var(--color-shadow);
  border-radius: 4px;
  background-color: var(--color-foreground);
  display: flex;
  margin: 1rem;
}

.member-list-photo {
  border-radius: 2px;
  width: 7rem;
  height: 7rem;
  margin: 3px;
}

.member-list-info {
  margin-top: 1rem;
  margin-bottom: 2rem;
  margin-right: 1rem;
  margin-left: 0.75rem;
}
</style>
