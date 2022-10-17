<template>
  <!-- info -->
  <b-container id="campfire-games">
    <b-row
      id="campfire-games-row"
      v-if="dataLoaded"
    >
      <b-col
        v-for="team in sortedCampfireTeams"
        class="campfire-games-col"
        :text="team.teamName"
        :key="team.teamName"
        :style="{color: team.textColor}"
      >
        <div class="campfire-bar">
          <div
            class="img-container"
            :id="team.cssID"
            :style="{backgroundColor: team.backgroundColor}"
          >
            <img
              class="img"
              :src="require('../assets/campfire_games/'+team.imgLink)"
              alt="campfire_games_logo"
            >

          </div>
          <strong>{{team.teamName}}</strong> <br />
          {{team.points}}
        </div>
      </b-col>
    </b-row>
    <LoadingSpinner
      v-else
      class="mb-3"
    />
  </b-container>

</template>

<script>
import generalMixin from '../mixins/general';
import LoadingSpinner from './LoadingSpinner.vue';

export default {
  components: { LoadingSpinner },
  name: 'LeaderboardBars',
  mixins: [generalMixin],
  data() {
    return {
      campfireGamesData: {
        red: {
          teamName: 'Red Team',
          points: 0,
          backgroundColor: '#EBC0C0',
          textColor: '#ff3f46',
          cssID: 'campfire-games-1',
        },
        green: {
          teamName: 'Green Team',
          points: 0,
          backgroundColor: '#A7D3C0',
          textColor: '#009050',
          cssID: 'campfire-games-3',
        },
        blue: {
          teamName: 'Blue Team',
          points: 0,
          backgroundColor: '#C2D5EB',
          textColor: '#2875cc',
          text: 'is rational and clear-headed. Their curiosity and intelligence are some of their greatest assets in understanding and exploring the world around them!',
          cssID: 'campfire-games-2',
        },
      },
      dataLoaded: false,
    };
  },
  async mounted() {
    const campfirePoints = await this.performGetRequest(
      this.getEnvVariable('BACKEND'),
      'get_point_totals',
      {},
    );

    Object.keys(campfirePoints).forEach((teamName) => {
      this.campfireGamesData[teamName].points = campfirePoints[teamName];
    });

    this.dataLoaded = true;
  },
  computed: {
    sortedCampfireTeams() {
      // Process the campfire games teams
      const campfireList = Object.values(this.campfireGamesData);
      campfireList.sort((a, b) => a.points - b.points);

      let j = 0;
      for (let i = 0; i < campfireList.length; i += 1) {
        if (i > 0) {
          if (campfireList[i].points === campfireList[i - 1].points) {
            j -= 1;
          }
        }

        campfireList[i].cssID = `campfire-games-${j}`;
        j += 1;
      }

      return campfireList.reverse();
    },
  },
};
</script>

<style scoped>
#campfire-games {
  padding: 0;
}

#campfire-games-row {
  margin: 0%;
}

.campfire-games-col {
  display: flex;
  justify-content: center;
}

.img-container {
  margin: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 5em;
  width: 5em;
  border-radius: var(--border-radius);
}

#campfire-games-2 {
  height: 10em;
}

#campfire-games-1 {
  height: 7.5em;
}

.img {
  width: 90%;
  height: 90%;
  object-fit: contain;
}

.campfire-bar {
  align-self: flex-end;
}

ul {
  text-align: left;
}
</style>
