<template>
  <div class="about">
    <h2 class="page-header">Technica Cooler</h2>
    <div
      id="help-body"
      class="container my-3 my-md-5"
    >
      <div class="row justify-content-center">
        <div class="col-md-10">
          <b-card>
            <p>
              Hangout at the Technica Cooler! When you join, you'll be greeted by Technica organizers and other hackers. Click the link below to join and meet new people!
            </p>
            <ZoomButton
              class="text-center"
              :href="waterCoolerLink"
            >Join the Cooler</ZoomButton>
          </b-card>
        </div>
      </div>
    </div>
    <div class="d-flex justify-content-around">
    </div>
    <EasterEgg
      :index=1
      :hint="'You found me! If you want to take a break before continuing, join the watercooler groups! If you’re ready, here is your next Techniclue: translate the following hexadecimal into UTF-8 to know where the next character is: 73 70 6f 6e 73 6f 72 73 68 69 70.'"
      :fileName="'scavenger-hunt/2.png'"
    />
  </div>
</template>

<script>
import ZoomButton from '@/components/ZoomButton.vue';
import generalMixin from '../mixins/general';
import EasterEgg from '../components/EasterEgg.vue';

export default {
  name: 'WaterCooler',
  mixins: [generalMixin],
  components: {
    ZoomButton,
    EasterEgg,
  },
  computed: {
    waterCoolerLink() {
      return this.getEnvVariable('WATER_COOLER_ZOOM_LINK');
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.row {
  margin-top: 0;
}

.card {
  background-color: var(--color-foreground);
}

.watercooler-image {
  max-height: 30vh;
  max-width: 80vw;
}
</style>
