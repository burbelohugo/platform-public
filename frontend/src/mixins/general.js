import Axios from 'axios';
import Config from '../config/general';

export default {
  methods: {
    // use this where the get data endpoint uses the AWS Document Client
    // (AKA data is already formatted JSON)
    async getDataSimple(baseUrl, endpoint) {
      try {
        const result = await Axios.get(`${baseUrl}/${endpoint}`);
        return result.data;
      } catch (e) {
        console.error(e);
        return null;
      }
    },
    async getData(baseUrl, endpoint) {
      try {
        const result = await Axios.get(`${baseUrl}/${endpoint}`);
        return this.processDynamoResponse(result.data);
      } catch (e) {
        console.error(e);
        return null;
      }
    },
    processDynamoResponse(rawResponse) {
      return rawResponse.map((item) => this.formatDynamoItem(item));
    },
    formatDynamoItem(item) {
      // Not sure why this just returns a new object with
      // const formattedItem = {};
      // Object.keys(item).forEach((key) => {
      //   formattedItem[key] = item[key];
      // });
      // return formattedItem;
      return item;
    },
    async performGetRequest(baseUrl, endpoint, params) {
      const config = {
        params: params,
        headers: { Authorization: `Bearer ${this.$cookie.get('token')}` },
      };
      try {
        const result = await Axios.get(`${baseUrl}/${endpoint}`, config);
        return this.formatDynamoItem(result.data);
      } catch (e) {
        console.error(e);
        return null;
      }
    },
    async performPostRequest(baseUrl, endpoint, params) {
      const headers = {
        headers: {
          Authorization: `Bearer ${this.$cookie.get('token')}`,
        },
      };
      try {
        const result = await Axios.post(`${baseUrl}/${endpoint}`, params, headers);
        return result.data;
      } catch (e) {
        console.error(e);
        return null;
      }
    },
    async performRawPostRequest(endpoint, params) {
      try {
        const result = await Axios.put(endpoint, params, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return result.data;
      } catch (e) {
        console.error(e);
        return null;
      }
    },
    getUserId() {
      return this.$cookie.get('userId');
    },
    setUserIdCookie(id) {
      this.$cookie.set('userId', id, 100);
    },
    removeUserIdCookie() {
      this.$cookie.delete('userId');
    },
    setRegisteredCookie() {
      this.$cookie.set('registered', true);
    },
    removeRegisteredCookie() {
      this.$cookie.delete('registered');
    },
    getUserName() {
      return this.$cookie.get('userName');
    },
    setUserNameCookie(name) {
      this.$cookie.set('userName', name, 100);
    },
    removeUserNameCookie() {
      this.$cookie.delete('userName');
    },
    getUserGroup() {
      return this.$cookie.get('group') || 'hacker';
    },
    setUserGroupCookie(group) {
      this.$cookie.set('group', group, 100);
    },
    removeUserGroupCookie() {
      this.$cookie.delete('group');
    },
    getSponsorBoothId() {
      return this.$cookie.get('sponsorBoothId');
    },
    setSponsorBoothIdCookie(id) {
      this.$cookie.set('sponsorBoothId', id, 100);
    },
    setCisgenderMaleCookie() {
      this.$cookie.set('snap', true);
    },
    removeCisgenderMaleCookie() {
      this.$cookie.delete('snap');
    },
    removeSponsorBoothIdCookie() {
      this.$cookie.delete('sponsorBoothId');
    },
    async setVersion() {
      const resp = await this.performGetRequest(this.getEnvVariable('BACKEND'), 'version');
      this.$cookie.set('version', resp.v)
    },
    getVersion() {
      return this.$cookie.get('version')
    },
    async checkIfUserHasTeam() {
      const teamParams = {
        user_id: this.getUserId(),
      };
      const team = await this.performGetRequest(this.getEnvVariable('BACKEND'), 'teams/membership', teamParams);
      if (team[0]) {
        return true;
      }
      return false;
    },
    getCurrentEnvironment() {
      if (window.location.hostname === 'platform.gotechnica.org') {
        return 'prd';
      }
      if (window.location.hostname === 'platform.beta.gotechnica.org') {
        return 'stg';
      }
      return 'dev';
    },
    getEnvVariable(variableName) {
      if (Config.shared[variableName]) {
        return Config.shared[variableName];
      }
      return Config[this.getCurrentEnvironment()][variableName];
    },
    async activityTracking(actionName) {
      const params = {
        user_id: this.getUserId(),
        action: actionName,
        user_name: this.getUserName(),
      };
      await this.performPostRequest(this.getEnvVariable('BACKEND'), 'users/activity', params);
    },
    getDayOfTheWeek(date) {
      const weekday = new Array(7);
      weekday[0] = 'Sunday';
      weekday[1] = 'Monday';
      weekday[2] = 'Tuesday';
      weekday[3] = 'Wednesday';
      weekday[4] = 'Thursday';
      weekday[5] = 'Friday';
      weekday[6] = 'Saturday';
      return weekday[date.getDay()];
    },
    formatAMPM(date) {
      // Convert to AM/PM local time
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    },
    sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    },
    formatCurrentDate(date) {
      return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    },
    async setUserSlackId(email = null) {
      const user = await this.performGetRequest(this.getEnvVariable('BACKEND'), 'users', { id: this.getUserId() });
      if (!user.slack_id) {
        const slackId = await this.performGetRequest(this.getEnvVariable('BACKEND'), 'projects/lookup_user', { email: email || user.email });
        if (slackId.user) {
          const rawSlackId = slackId.user.id;
          await this.performPostRequest(this.getEnvVariable('BACKEND'), 'users/update', { id: this.getUserId(), slack_id: rawSlackId });
          return true;
        }
      } else {
        return true;
      }
      return false;
    },
    setCurrentUserCookie(userObj) {
      this.$cookie.set('user', JSON.stringify(userObj), 100);
    },
    setToken(token) {
      this.$cookie.set('token', token, 100);
    },
    removeCurrentUserCookie(userObj) {
      this.$cookie.delete('user', JSON.stringify(userObj), 100);
    },
    getCurrentUser() {
      return JSON.parse(this.$cookie.get('user'));
    },

    // eslint-disable-next-line camelcase
    async addAchievement(user_id, achievement_name, type) {
      const params = {
        user_id,
        achievement_name,
        type,
        points: 10,
      };
      return this.performPostRequest(this.getEnvVariable('BACKEND'), 'add_achievement', params);
    },
  },
};
