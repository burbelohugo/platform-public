<template>
  <div id="app">
    <navbar
      v-if="!['Event', 'Loading'].includes($route.name)"
      :displayRouteList="displayRouteList"
      :userIsMemberOfTeam="userIsMemberOfTeam"
    />
    <router-view @teamMembershipChanged="teamMembershipChanged" />
  </div>
</template>

<script>
// eslint-disable-next-line no-unused-vars
import Vue from 'vue';
import Navbar from '@/components/Navbar.vue';
import generalMixin from '@/mixins/general.js';

const routesWithoutNavBar = ['Login', 'Register', 'Authenticate'];

export default {
  name: 'App',
  components: {
    Navbar,
  },
  computed: {
    displayRouteList() {
      return !routesWithoutNavBar.includes(this.$route.name);
    },
  },
  async created() {
    // store current version
    await this.setVersion()
  },
  async mounted() {
    while (!this.$route.name) {
      // eslint-disable-next-line no-await-in-loop
      await this.sleep(5000);
      await this.checkVersion();
    }
    this.userIsMemberOfTeam = await this.checkIfUserHasTeam();
  },
  data() {
    return {
      userIsMemberOfTeam: false,
    };
  },
  mixins: [generalMixin],
  methods: {
    teamMembershipChanged(change) {
      this.userIsMemberOfTeam = change;
    },
    async checkVersion() {
      const resp = await this.performGetRequest(this.getEnvVariable('BACKEND'), 'version');
      if (resp.v > this.getVersion()) {
        window.location.reload(true);
        await this.setVersion();
      }
    }
  },
};
</script>
