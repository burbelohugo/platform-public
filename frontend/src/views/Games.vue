<template>
  <div class="page-container pb-5">
    <h2 class="page-header">Games</h2>
    <b-container>
      <div>
        <SectionTitle title="Mini Games" />
        <div class="game-container">
          <router-link :to="'/schedule?event=' + eventIds.miniGames1">
            <div class="game-card">
              <img src="../assets/Skribbl.png" />
              <div>
                Mini-Games Session #1
              </div>
            </div>
          </router-link>
          <router-link :to="'/schedule?event=' + eventIds.miniGames2">
            <div class="game-card">
              <img src="../assets/Skribbl.png" />
              <div>
                Mini-Games Session #2
              </div>
            </div>
          </router-link>
        </div>
      </div>
      <div>
        <SectionTitle title="Minecraft" />
        <div class="game-container">
          <router-link :to="'/schedule?event=' + eventIds.minecraft1">
            <div class="game-card">
              <img src="../assets/minecraft.png" />
              <div>
                Minecraft Free Build
              </div>
            </div>
          </router-link>
        </div>
      </div>
      <div>
        <SectionTitle title="Trivia" />
        <div class="game-container">
          <router-link :to="'/schedule?event=' + eventIds.Trivia1">
            <div class="game-card">
              <div>
                Trivia Session
              </div>
            </div>
          </router-link>
        </div>
      </div>
    </b-container>
  </div>
</template>

<script>
import SectionTitle from '../components/SectionTitle';
import generalMixin from '../mixins/general';

export default {
  name: 'Games',
  components: {
    SectionTitle,
  },
  mixins: [generalMixin],
  computed: {
    eventIds() {
      return this.getEnvVariable('eventIds');
    },
  },
};
</script>

<style scoped>
.section-container {
  width: 80%;
  height: fit-content;
}

.game-container {
  margin-top: 1rem;
  display: flex;
  justify-content: space-around;
}

.game-card {
  background: var(--color-foreground);
  border-radius: 8px;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 1rem;
}

.game-card img {
  height: 80px;
  margin: 0.5rem;
  margin-right: 1rem;
}
</style>
