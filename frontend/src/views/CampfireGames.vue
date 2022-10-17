<template>
  <b-container class="pb-3">
    <h3 id="page-title">The Campfire Games</h3>

    <b-row>
      <b-col cols="7">
        <b-card class="description">
          <h4>About</h4>
          <p class="text-left">
            The <strong>Campfire Games</strong> is a brand new way to learn, grow, and build
            with the Bitcamp Community. At the start of this year's event, you will join one of three teams based
            on your personality and interests—joining forces with hackers from around the world! By winning unique
            challenges, attending workshops, and participating in mini-events, you'll rack up points
            for your team. At the end of Bitcamp, members of the winning team will receive limited edition Bitcamp
            Apparel.
            Find your community, develop your team identity, and collaborate on something bigger than yourself:
            <strong>#ExploreTogether</strong>
          </p>
          <hr class="hr" />

          <h5>How to Earn Points</h5>
          <ul class="text-left">
            <li><strong>Attend</strong> workshops, mini-events, and more events!</li>
            <li><strong>Help</strong> out your fellow hackers in the Bitcamp Slack</li>
            <li><strong>Speak</strong> to sponsors in their open Zoom rooms</li>
            <li><strong>Visit</strong> the <router-link to="/sponsors">Sponsor Tents</router-link> pages during the event
            </li>
          </ul>
        </b-card>
      </b-col>
      <b-col
        cols="5"
        class="pl-0 d-flex flex-column"
      >
        <b-card :style="{marginBottom: '15px'}">
          <h4>My Team</h4>
          <div v-if=!assignedCampfireTeam>
            No team found!
          </div>
          <div v-else>
            <b-row>
              <b-col
                cols="4"
                class="d-flex align-items-center"
              >
                <img
                  class="img campfire-img"
                  :src="require('../assets/campfire_games/'+campfireGamesData[assignedCampfireTeam].imgLink)"
                  alt="campfire_games_logo"
                >
              </b-col>
              <b-col>
                <p class="text-left mb-0">
                  The
                  <strong :style="`color: ${campfireGamesData[assignedCampfireTeam].textColor}`">
                    {{campfireGamesData[assignedCampfireTeam].teamName}}
                  </strong>
                  {{campfireGamesData[assignedCampfireTeam].text}}
                </p>
              </b-col>
            </b-row>
          </div>
        </b-card>
        <b-card class="scoreboard">
          <h4>Scoreboard</h4>
          <Leaderboard :teamData="campfireGamesData" />
        </b-card>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import generalMixin from '../mixins/general';
import Leaderboard from '../components/Leaderboard.vue';

export default {
  name: 'CampfireGames',
  mixins: [generalMixin],
  components: {
    Leaderboard,
  },
  data() {
    return {
      campfireGamesData: {
        red: {
          teamName: 'Red Team',
          textColor: '#ff3f46',
          text: 'is passionate and fiery! Their emotion is their strength in handling whatever comes their way!',
          cssID: 'campfire-games-1',
        },
        green: {
          teamName: 'Green Team',
          textColor: '#009050',
          text: 'is adaptable, always growing and thriving in new and challenging circumstances!',
        },
        blue: {
          teamName: 'Blue Team',
          textColor: '#2875cc',
          text: 'is rational and clear-headed. Their curiosity and intelligence are some of their greatest assets in understanding and exploring the world around them!',
        },
      },
      assignedCampfireTeam: null,
    };
  },
  mounted() {
    this.assignedCampfireTeam = this.getCurrentUser().campfire_team;
  },

};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.hr {
  border-top: 3px solid var(--color-light-border);
}

#page-title {
  padding: 1rem;
}

.row {
  margin-top: 0%;
}

.card {
  width: 100%;
}

.description {
  height: 100%;
  padding-left: 1rem;
  padding-right: 1rem;
}

.scoreboard {
  flex: 1;
}

.filler {
  cursor: text !important;
}

a {
  text-decoration: underline;
}

.display-center {
  margin-top: 1rem;
}

.campfire-img {
  width: 100%;
}
</style>
