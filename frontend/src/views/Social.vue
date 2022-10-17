<template>
    <div>
        
      <div id="social-page">
        <b-row>

          <b-col class="px-5 mx-5">
            <b-card class="watercooler">
              <div class="column-card">
                <h4 class="section-title">Networking: Virtual Water Cooler</h4>
                <div class="description">
                  <p class="cooler-text">The water cooler is a room where you will be paired up with other hackers
                      to meet, network, and interact. Once you join the room, you will be paired with
                      other hackers by Technica organizers in a breakout room for 10 minutes at a time.
                  </p>
                  <p class="cooler-text">Click the link below to join and meet other people!</p>
                  <div>
                    <ZoomButton :href="waterCoolerLink">Join the Cooler</ZoomButton>
                  </div>

                </div>
                <div><img src="../assets/Watercooler_Image.png" alt="watercooler illustration" class="watercooler-img"></div>
              </div>
            </b-card>
          </b-col>

        </b-row>
        <EasterEgg
              :index=1
              :hint="'You found me! If you want to take a break before continuing, join the watercooler groups! If you’re ready, here is your next Techniclue: translate the following hexadecimal into UTF-8 to know where the next character is: 73 70 6f 6e 73 6f 72 73 68 69 70.'"
              :fileName="'scavenger-hunt/2.png'"
            />
      </div>
    </div>
</template>

<script>
import Button from '@/components/Button.vue';
import ZoomButton from '@/components/ZoomButton.vue';
import EasterEgg from '@/components/EasterEgg.vue';
import SectionTitle from '../components/SectionTitle';
import generalMixin from '../mixins/general';
import Config from '../config/general';

export default {
  name: 'Social',
  components: {
    Button,
    ZoomButton,
    SectionTitle,
    EasterEgg,
  },
  mixins: [generalMixin],
  methods: {
    getSlackLink() {
      window.open(Config.shared.SLACK_INVITE_LINK, '_blank');
    },
  },
  computed: {
    waterCoolerLink() {
      return this.getEnvVariable('WATER_COOLER_ZOOM_LINK');
    },
    eventIds() {
      return this.getEnvVariable('eventIds');
    },
  },
};
</script>

<style scoped>

#social-page {
  /* Screen size minus approx navbar height */
  box-sizing: border-box;
  width: 100%;
  padding: 2rem 5rem;
}

.row {
  margin-top: 0;
}

.section-container {
  width: 80%;
  height: fit-content;
}

.description {
  margin: 1rem;
}

.watercooler-img {
  border-radius: 10px;
  width: 80%;
}

p.cooler-text{
  margin-left: 2rem !important;
  margin-right: 2rem !important;
  font-size: medium;
  word-wrap: break-word;
}

h3.section-title{
  margin-bottom: 2rem;
}

h4.section-title {
  margin: 1rem;
}


.btn{
  margin-top:1.5rem !important;
}

.column-card {
  display: flex !important;
  height: 100%;
  flex-direction: column;
  min-height: 0;
}


h4.games-section-title {
  margin: 1rem;
}

::v-deep .card-body {
  display: flex;
  flex-direction: column;
}
</style>
