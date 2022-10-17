<template>
 <div>
    <h2 class="page-header">Welcome to Sponsor Speed Chatting!</h2>
    <div class="row mx-5">

      <!-- LEFT COLUMN -->
      <div class="col-3"></div>

      <!-- VIDEO PANE -->
      <div>
        <div>
          <vue-jitsi-meet ref="jitsiRef" domain="meet.jit.si" :options="jitsiOptions">
          </vue-jitsi-meet>

          <!-- TODO: Only render after hacker has ended the call (on videoConferenceLeft)-->
          <Button v-if="group === 'hacker'" @click="checkVisitedStatus()">End meeting</Button>

          <!-- TODO: Only render after 30 seconds of successfully popping a hacker -->
          <Button v-if="group !== 'hacker'" @click="endSession()">Mark current hacker as no-show and get new hacker</Button>
        </div>
      </div>
      <!-- RIGHT COLUMN -->
      <div class="col-3"></div>

    </div>
  </div>
</template>

<script>
import { JitsiMeet } from '@mycure/vue-jitsi-meet';
import Axios from 'axios';
import generalMixin from '../mixins/general';

const jwt = require('jsonwebtoken');

export default {
  name: 'SpeedChatting',
  props: {
    email: String,
    room_name: String,
  },
  data() {
    return {
      group: null,
    };
  },
  mixins: [generalMixin],
  components: {
    VueJitsiMeet: JitsiMeet,
  },
  computed: {
    jitsiOptions() {
      return {
        roomName: this.room_name,
        noSSL: false,
        userInfo: {
          email: this.email,
        },
        configOverwrite: {
          enableNoisyMicDetection: false,
        },
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          SHOW_CHROME_EXTENSION_BANNER: false,
        },
        height: 300,
        width: 500,
        onload: this.onIFrameLoad,
      };
    },
  },
  created() {
    this.group = this.getUserGroup();
  },
  mounted() {
    this.user = jwt.verify(this.$cookie.get('token'), 'technica');
  },
  methods: {
    async checkVisitedStatus(e) {
      const MAX_VISITS = 2;

      const result = await Axios.get(`${this.getEnvVariable('BACKEND')}/chats/status`, {
        headers: {
          Authorization: `Bearer ${jwt.sign({ email: this.user.email }, 'technica')}`,
        },
      });

      // TODO: Hide the iFrame when going offline
      if (result.data.visited_set !== undefined && result.data.visited_set.length > MAX_VISITS) {
        this.$router.push({ path: '/speed-chatting/thanks' });
        this.$forceUpdate();
      } else {
        this.$router.push({ path: '/speed-chatting/lobby' });
        this.$forceUpdate();
      }
    },
    // TODO: Add a heads-up prompt before kicking hackers out
    async startTimer(e) {
      // start timer for 4 min -> show 4 min warning
      await this.sleep(60000);
      this.$refs.jitsiRef.executeCommand('kickParticipant', e.id);
    },
    async endSession(e) {
      this.markComplete();
      this.popHacker();
    },
    async popHacker() {
      let b = true;
      do {
        // eslint-disable-next-line no-await-in-loop
        await this.sleep(10000);
        // eslint-disable-next-line no-await-in-loop
        const result = await Axios.get(`${this.getEnvVariable('BACKEND')}/chats/sponsor/pop`, {
          headers: {
            Authorization: `Bearer ${jwt.sign({ id: this.user.id, email: this.user.email }, 'technica')}`,
          },
        });

        if (result.data.email !== undefined) {
          b = false;
        }
      } while (b);
    },
    markComplete() {
      Axios.post(`${this.getEnvVariable('BACKEND')}/chats/sponsor/complete`, {}, {
          headers: {
            Authorization: `Bearer ${jwt.sign({ id: this.user.id, email: this.user.email }, 'technica')}`,
          },
        }).then();;
    },
    goOffline() {
      this.markComplete();
      Axios.post(`${this.getEnvVariable('BACKEND')}/chats/sponsor/leave`, {}, {
          headers: {
            Authorization: `Bearer ${jwt.sign({ id: this.user.id, email: this.user.email }, 'technica')}`,
          },
        }
      ).then((r) => {
        // TODO: Hide the iFrame when going offline
        this.$router.push({ path: '/speed-chatting/thanks' });
      });
    },
    goOnline() {
      this.popHacker();
    },
    onIFrameLoad () {
      if (this.group === 'hacker') {
        this.$refs.jitsiRef.addEventListener('videoConferenceLeft', this.checkVisitedStatus);
      } else {
        this.$refs.jitsiRef.addEventListener('videoConferenceJoined', this.goOnline);
        this.$refs.jitsiRef.addEventListener('participantJoined', this.startTimer);
        this.$refs.jitsiRef.addEventListener('participantLeft', this.endSession);
        // this.$refs.jitsiRef.addEventListener('participantKickedOut', this.endSession);
        this.$refs.jitsiRef.addEventListener('videoConferenceLeft', this.goOffline);
      }
    },
  },
};
</script>

<style scoped>
p{
  text-align: left !important;
}

h4,
h5,
h6{
  text-align: left !important;
  padding-bottom: 1rem;
}

.btn{
  margin-top: 4rem;
  background-color: var(--lavender);
  border-color: var(--lavender)
}

.btn:hover,
.btn:focus,
.btn:active {
  background-color: var(--light-lavender) !important;
  border-color: var(--light-lavender) !important;
}

.page-container {
  display: flex;
  align-items: center;
  flex-direction: column;
  padding-top: 2rem;
  padding-bottom: 2rem;
}
.body-container {
  background: var(--light-lavender);
  height: fit-content;
  padding-top: 2rem;
  padding-left: 3rem;
  padding-right: 3rem;
  padding-bottom: 2rem;
}

</style>
