<template>
  <div class="page">
    <div v-if="isReady">
      <h1>A sponsor is ready to see you!</h1>
    </div>
    <div v-else>
    <h1>Hold On...</h1>
    <p class="important-text">This may take some time. Thank you for your patience</p>
    <p>Please keep this tab open while we connect you with a sponsor. </p>
    <p>Reminder: Here are some things you can talk about with the sponsor:</p>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
      tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
      veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
      commodo consequat.
    </p>
    </div>
    <div v-if="isReady">
      <Button class="btn-secondary" @click="onClick">Join Meeting</Button>
    </div>
    <div v-else>
      <Button class="btn-secondary" disabled>Not ready yet...</Button>
    </div>
  </div>
</template>

<script>
// TODO: Update the template with nice words for how they should wait patiently
import Button from '@/components/Button.vue';
import Axios from 'axios';
import generalMixin from '../mixins/general';

const jwt = require('jsonwebtoken');

export default {
  name: 'SpeedChattingQueue',
  mixins: [generalMixin],
  components: {
    Button,
  },
  computed: {
    isReady() {
      return this.ready;
    }
  },
  data() {
    return {
      ready: false,
      roomName: '',
    };
  },
  async mounted() {
    this.user = jwt.verify(this.$cookie.get('token'), 'technica');

    this.checkQueueStatus();

    // TODO SOMETIMES HACKERS NEED TO RELOAD TO CHECK QUEUE STATUS
    this.timer = setInterval(this.checkQueueStatus, 10000);
  },
  methods: {
    checkQueueStatus() {
      Axios.get(`${this.getEnvVariable('BACKEND')}/chats/status`, {
        headers: {
          Authorization: `Bearer ${jwt.sign({ email: this.user.email }, 'technica')}`,
        },
      }).then((result) => {
        if (result.data.assigned_to) {
          this.roomName = result.data.assigned_to;
          this.ready = true;
      }
      });
    },
    onClick() {
      this.$router.push({ path: '/speed-chatting/room', query: { email: this.user.email, room_name: this.roomName } });
      clearInterval(this.timer);
    },
  },
};
</script>

<style scoped>
.page {
  margin: 5% 10%;
}

.important-text {
  font-size: 24pt;
}
</style>
