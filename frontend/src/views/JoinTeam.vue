<template>
  <b-container>
    <b-row align-h="center">
      <b-card class="col-10">
        <template v-if="!dataLoading">

          <template v-if="!error">
            <h3 class="mb-3">You've been invited to join a team!</h3>
            <p
              class="warning-text"
              v-if="oldTeam"
            >Careful! If you join this team, you'll be removed from your current team!</p>

            <Button
              @click="$router.push('/team')"
              outlined
            >
              Cancel
            </Button>
            <Button @click="handleJoinTeamClick">{{this.oldTeam ? 'Leave Old Team And ' : ''}}Join This Team</Button>
          </template>

          <template v-else>
            <h3>{{error.title}}</h3>
            <p>{{error.description}}</p>
            <Button @click="$router.push('/team')">Go Back to My Team Page</Button>
          </template>
        </template>

        <LoadingSpinner
          class="m-0"
          v-else
        />
      </b-card>
    </b-row>
  </b-container>
</template>

<script>
import Button from '../components/Button.vue';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import generalMixin from '../mixins/general';

const MAX_TEAM_SIZE = 4; // As per MLH rules

export default {
  mixins: [generalMixin],
  name: 'JoinTeam',
  components: {
    Button,
    LoadingSpinner,
  },
  data() {
    return {
      dataLoading: true,
      error: null,
      team: null,
      oldTeam: null,
      teamMembers: null,
      teamId: this.$route.params.team,
    };
  },
  async mounted() {
    // Fetch team-related info info
    [this.team, this.oldTeam, this.teamMembers] = await Promise.all([
      this.fetchTeamInfo(),
      this.fetchUsersOldTeam(),
      this.fetchTeamMembers(),
    ]);

    // Check for errors
    if (!this.team) {
      this.raiseInvalidLinkError();
    } else if (this.teamMembers.length >= MAX_TEAM_SIZE) {
      this.raiseTooManyMembersError();
    } else if (this.oldTeam && this.oldTeam.team === this.teamId) {
      this.raiseAlreadyPartOfTeamError();
    }

    this.dataLoading = false;
  },
  methods: {
    /**
     * Given a team id in the route parameters, fetch that team's info
     */
    fetchTeamInfo() {
      const params = { id: this.teamId };

      return this.performGetRequest(
        this.getEnvVariable('BACKEND'),
        'teams',
        params,
      );
    },
    /**
     * Fetches the current team of the given user, if it exists
     */
    async fetchUsersOldTeam() {
      const params = {
        user_id: this.getUserId(),
      };

      // Extract most recent team that a user joined (first team in the list returned
      // by the HTTP route)
      const mostRecentTeam = await this.performGetRequest(
        this.getEnvVariable('BACKEND'),
        'teams/membership',
        params,
      );

      return mostRecentTeam;
    },
    /**
     * Enters the loading state while trying to join a team
     */
    async handleJoinTeamClick() {
      this.dataLoading = true;
      await this.acceptInvitation();
      this.dataLoading = false;
    },
    /**
     * Accepts the team invitation, removing the user from their current team if necessary
     */
    async acceptInvitation() {
      // Make sure there's enough space on this team for a new member
      this.teamMembers = await this.fetchTeamMembers();
      if (this.teamMembers.length >= MAX_TEAM_SIZE) {
        this.raiseTooManyMembersError();
        return;
      }

      // Leave the old team if it exists
      if (this.oldTeam) {
        await this.leaveOldTeam();

        // Broadcast to the UI that the user left their team
        this.$emit('teamMembershipChanged', false);
      }

      const joinedTeam = await this.joinTeam();
      // // console.log({ joinedTeam });

      if (!joinedTeam) {
        this.raiseCouldntJoinTeamError();
      } else {
        // Broadcast to the UI that the user joined a new team
        this.$emit('teamMembershipChanged', true);
        this.$router.push('/team');
      }
    },
    /**
     * Leaves the old team the user was on
     */
    async leaveOldTeam() {
      const params = {
        user_id: this.getUserId(),
        team_id: this.oldTeam.team
      };

      return this.performPostRequest(
        this.getEnvVariable('BACKEND'),
        'teams/leave',
        params,
      );
    },
    /**
     * Join the new team (that the user was invited to)
     */
    async joinTeam() {
      const params = {
        team_id: this.teamId,
        user_id: this.getUserId(),
        team_name: this.team.team_name,
      };

      return this.performPostRequest(
        this.getEnvVariable('BACKEND'),
        'teams/join',
        params,
      );
    },
    /**
     * Gets the current members on the provided team
     */
    async fetchTeamMembers() {
      const params = { team_id: this.teamId };

      return this.performGetRequest(
        this.getEnvVariable('BACKEND'),
        'teams/members',
        params,
      );
    },
    /**
     * Handles cases where the team id is invalid
     */
    raiseInvalidLinkError() {
      this.error = {
        title: 'Invalid Team Invite Link',
        description: 'The invite link you entered doesn\'t match any teams in our system.',
      };
    },
    /**
     * Handles cases where the user already belongs to the team they're being invited to
     */
    raiseAlreadyPartOfTeamError() {
      this.error = {
        title: 'You Are Already a Member of This Team',
        description: '',
      };
    },
    /**
     * Handles cases where the user was unable to leave the team
     */
    raiseCouldntLeaveTeamError() {
      this.error = {
        title: 'Error Leaving Your Current Team',
        description: 'We ran into an issue removing you from your current team. Sorry! Please try joining this team again.',
      };
    },
    /**
     * Handles cases where the user was unable to join the team
     */
    raiseCouldntJoinTeamError() {
      this.error = {
        title: 'Error Joining New Team',
        description: 'We ran into an issue adding you to makin team. Sorry! Please try joining this team again.',
      };
    },
    /**
     * Handles cases where there are already the maximum number of users on a given team
     */
    raiseTooManyMembersError() {
      this.error = {
        title: 'This Team is Already Full!',
        description: 'The team you are trying to join already has 4 members (the maximum allowed by MLH).',
      };
    },
  },
};
</script>

<style scoped>
.warning-text {
  color: var(--color-error);
  font-size: 20px;
  font-weight: bold;
  padding: 2rem 0;
}
</style>
