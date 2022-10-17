<template>
  <div>
    <!-- TODO: Center image inside Passport -->
    <div v-b-modal.modal>
      <img :src="require('../assets/passport/'+modalImage)" class="stamp-img">
    </div>
    <b-modal id="modal" :title="modalTitle" size="lg" style="padding-left: 4rem; padding-right: 4rem;">
      <div class="ee-modal-container">
        <!-- TODO: Beautify this text -->
        <p class="modal-text my-3" v-if="this.progress >= 2">Awesome! You've unlocked the first tier of swag! <br> <a href="https://technica.notion.site/Technica-Workbook-6cff11cbb41345019fcf31a7649a8c55" target="_blank" >Get your Technica Workbook here.</a></p>
        <p class="modal-text my-3" v-if="this.progress >= 4">You're on a roll! You've unlocked the second tier! <br> <a href="https://technica.notion.site/Wallpapers-881290890647496a918428f78f7606b4" target="_blank" >Your Technica Wallpapers are waiting for you here.</a></p>
        <p class="modal-text my-3" v-if="this.progress >= 7">Congratulations on unlocking Tier 3 of the Technica Passport! <br> We have entered your name into a raffle for a Digital Art Commission from our Technica Design Team. Keep an eye on your Slack DM’s, we will message you if you are one of the lucky winners!</p>
      </div>
      <template v-slot:modal-footer>
        <Button @click="goBack">Back to page</Button>
      </template>
    </b-modal>
  </div>
</template>

<script>
import Button from '@/components/Button.vue';
import Axios from 'axios';
import generalMixin from '../mixins/general';

const jwt = require('jsonwebtoken');

export default {
  name: 'ProgressionTriangle',
  mixins: [generalMixin],
  components: {
    Button,
  },
  data() {
    // STRETCH GOAL: Add check for domestic / international student
    return {
      progress: this.getProgress(),
    };
  },
  computed: {
    modalTitle() {
      return "Revisit this module as you unlock Tiers of the Technica Passport!";
    },
    modalImage() {
      // STRETCH GOAL: Add check for domestic / international student
      if (this.progress >= 7) {
        return "1_4.png";
      } 
      if (this.progress >= 4) {
        return "1_3.png";
      }
      if (this.progress >= 2) {
        return "1_2.png";
      }
      return "1_1.png";
    }
  },
  methods: {
    async getProgress() {
      const params = {
        id: this.getUserId(),
      };
      const result = await this.performGetRequest(this.getEnvVariable('BACKEND'), 'tracking/attendance/get', params);

      let virtualCount = 0;
      let inPersonCount = 0;

      if (result.inperson && (typeof(result.inperson) === 'string')) {
        inPersonCount = JSON.parse(result.inperson).length;
      }
      if (result.virtual && (typeof(result.virtual) === 'string')) {
        virtualCount = JSON.parse(result.virtual).length;
      }

      this.progress = inPersonCount + virtualCount;
    },
    viewModal() {
      this.$bvModal.show('modal');
    },
    goBack() {
      this.$bvModal.hide('modal');
    },
  },
};
</script>

<style scoped>

p.modal-text {
  max-width: 80%;
  text-align: center;
}

.stamp-img {
  width: 600px;
}

.stamp-img:hover {
  filter: drop-shadow(0px 0px 12px rgba(255, 80, 145, 0.7));
  cursor: pointer;
}

.ee-modal-container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.modal-footer {
  justify-content: center !important;
}

</style>
