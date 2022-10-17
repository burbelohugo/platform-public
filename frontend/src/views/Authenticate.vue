<template>
  <div>
    <LoadingSpinner />
  </div>
</template>

<script>
import generalMixin from '../mixins/general';
import LoadingSpinner from '../components/LoadingSpinner.vue';

export default {
  name: 'Authenticate',
  mixins: [generalMixin],
  components: {
    LoadingSpinner,
  },
  async created() {
    const params = { lid: this.$route.query.lid };
    const tokenResponse = await this.performGetRequest(this.getEnvVariable('BACKEND'), 'authz/token', params);
    if (tokenResponse === null) {
      this.$router.push('Login');
    }
    const { token } = tokenResponse;
    const { user } = tokenResponse;
    // if user does not exist, redirect to login screen
    if (user && user.id && token) {
      this.setToken(token);
      this.setCurrentUserCookie(user);
      this.setUserIdCookie(user.id);
      this.setUserNameCookie(user.full_name.split(' ')[0]);
      this.setUserGroupCookie(user.group);
      this.setSponsorBoothIdCookie(user.sponsor_booth);
      if (user.gender === "Cisgender Male (Born Male, still identify as Male)" &&
          user.group === "hacker") {
        this.setCisgenderMaleCookie();
      } else {
        this.removeCisgenderMaleCookie();
      }
      if (user.hacker_profile) {
        this.setRegisteredCookie();
      } else {
        this.removeRegisteredCookie();
      }
      this.$emit('teamMembershipChanged', true);
      if (!user.registration_status || user.registration_status === 'email_invite_sent') {
        this.$router.push('Register');
      } else {
        this.$router.push('/');
      }
    } else {
      this.$router.push('Login');
    }
  },
};
</script>
