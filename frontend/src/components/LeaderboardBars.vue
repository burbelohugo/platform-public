<template>
  <!-- info -->
  <b-container id="campfire-games">
    <div
      v-for="team in this.campfireGamesData"
      :text="team.teamName"
      :key="team.teamName"
      :style="{color: team.textColor}"
    >

        <div class="row points-bar" :style="{backgroundColor: team.backgroundColor, width: team.width}">
          <div class="col-9 bar-col" style="text-align: left">
            <strong>{{team.teamName}}</strong>: {{team.points}} points
          </div>
          <div class="col-3 bar-col" style="justify-content: right">
            <img class="h-100 d-inline-block" :src="require('../assets/campfire_games/'+team.imgLink)" alt="campfire_games_logo">
          </div>
        </div>
    </div>
  </b-container>

</template>

<script>
import generalMixin from '../mixins/general';

export default {
  name: 'Leaderboard',
  mixins: [generalMixin],
  data() {
    return {
      campfireGamesData: {
        red: {
          teamName: 'Red Team',
          points: 0,
          backgroundColor: '#EBC0C0',
          textColor: '#ff3f46',
        },
        blue: {
          teamName: 'Blue Team',
          points: 0,
          backgroundColor: '#C2D5EB',
          textColor: '#2875cc',
        },
        green: {
          teamName: 'Green Team',
          points: 0,
          backgroundColor: '#A7D3C0',
          textColor: '#009050',
        },
      },
    };
  },
  methods: {
    async getPoints() {
      const campfirePoints = await this.performGetRequest(this.getEnvVariable('BACKEND'), 'get_point_totals', {});
      const minWidth = 40;
      let totalPoints = 0;
      Object.keys(campfirePoints).forEach((teamName) => {
        this.campfireGamesData[teamName].points = campfirePoints[teamName];
        totalPoints += campfirePoints[teamName];
      });

      Object.keys(campfirePoints).forEach((teamName) => {
        this.campfireGamesData[teamName].width = `${minWidth + ((campfirePoints[teamName] / totalPoints) * (90 - minWidth))}%`;
      });
    },
  },
  async mounted() {
    await this.getPoints();
  },
  async created() {
    setInterval(() => { this.getPoints(); }, 60000);
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

.points-bar {
  align-items: center !important;
  justify-content: center !important;
  height: 6rem;
  margin: 1rem;
  border-radius: var(--border-radius);
  font-size: 16pt;
}

.bar-col {
  display: flex;
  height: 5rem;
  align-items: center !important;
}

ul {
  text-align: left;
}
</style>
