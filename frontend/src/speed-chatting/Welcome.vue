/* eslint-disable prettier/prettier */
<template>
  <div v-if="group === 'hacker'">
    <div>
      <h2 class="page-header">Welcome to Sponsor Speed Dating!</h2>
      <div
        id="help-body"
        class="container my-3 my-md-5"
      >
          <p>
              Welcome to the speed chatting networking event! You'll be assigned in 1 on 1's with sponsors to network and chat.
          </p>
          <p>
              When you're ready, click the button below to get connected with sponsors.
          </p>
          <Button @click="onClickHacker()">Start Chatting!</Button>
      </div>
    </div>
  </div>
  <div v-else>
     <h2 class="page-header">Welcome to Sponsor Speed Dating!</h2>
      <div
        id="help-body"
        class="container my-3 my-md-7"
      >
          <p>
              Thanks for talking to hackers! Please refer to the spreadsheet sent out on Slack for your room link to start chatting with hackers.
          </p>
          <!-- <Button @click="onClickSponsor()">Go Online!</Button> -->
      </div>
      <!-- <div class="page-container">
        <h4>Frequently Asked Questions</h4>
        <div class="body-container">
            <div class="row">
              <div
                v-for="(items, i) in [leftPanelItems, rightPanelItems]"
                class="col-md"
                :key="i"
              >
                <div v-if="i===0">
                  <h5><b>Hackers:</b></h5>
                </div>
                <div v-else>
                  <h5><b>Sponsors:</b></h5>
                </div>
                <div
                  v-for="item in items"
                  :key="item.title"
                >
                <h6> {{item.title}} </h6>
                </div>
              </div>
            </div>
        </div>
      </div> -->
    </div>
</template>

<script>
import Button from '@/components/Button.vue';
import Axios from 'axios';
import generalMixin from '../mixins/general';
import Content from '../config/content';

const jwt = require('jsonwebtoken');

export default {
  name: 'SpeedChatting',
  mixins: [generalMixin],
  components: {
    Button,
  },
  data() {
    return {
      group: null,
    };
  },
  async created() {
    this.group = this.getUserGroup();
  },
  computed: {
    rightPanelItems() {
      return Content.SpeedChattingResources.rightPanelItems;
    },
    leftPanelItems() {
      return Content.SpeedChattingResources.leftPanelItems;
    },
  },
  async mounted() {
    this.user = jwt.verify(this.$cookie.get('token'), 'technica');
  },
  methods: {
    async onClickHacker() {
      const result = await this.performGetRequest(this.getEnvVariable('BACKEND'), 'speed-chat/link');

      window.open(result, '_blank').focus();
    },
    async onClickSponsor() {
      const result = await this.performGetRequest(this.getEnvVariable('BACKEND'), 'speed-chat/link');

      window.open(result, '_blank').focus();
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
  border-color: var(--lavender);
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
  align-content: left;
  background: var(--light-lavender);
  border: 1px solid var(--light-lavender);
  box-sizing: border-box;
  border-radius: 20px;
  height: fit-content;
  min-width: 70vw;
  width: 70%;
  padding-top: 2rem;
  padding-left: 3rem;
  padding-right: 3rem;
  padding-bottom: 2rem;
}

</style>
