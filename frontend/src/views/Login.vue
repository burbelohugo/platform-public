<template>
  <div class="page-container">
    <div class="login-container">
      <b-alert
        :show="tryingToJoinTeam"
        variant="warning"
        class="team-alert"
      >
        <strong>Warning:</strong> You must log into your platform account before joining a team
      </b-alert>
      <content-container v-if="!loginButtonClicked">
        <template v-slot:title>
          <h3>Login</h3>
        </template>
        <template v-slot:body>
          <p class="description-text">Instead of using a password, enter your email so Technica can send you a magic link to sign in.</p>
          <p
            v-if="emailNotFound && !emailInvalid"
            class="text-error"
          >We could not find your email in our records. Hackers will be invited to the platform via email the week of the event. For further assistance, please contact our support team.</p>
          <p
            v-if="emailInvalid"
            class="text-error"
          >Please enter a valid email address.</p>
          <form @submit.prevent="sendMagicLink">
            <div class="form-group mx-auto">
              <input
                type="email"
                class="form-control mx-auto"
                id="emailInput"
                placeholder="Email"
                v-model="userEmail"
              >
            </div>
            <Button @click="sendMagicLink">Send Me a Magic Link</Button>
            <div class="login-footer">
              <span style="padding-right: .75rem">or</span>
              <Button
                outlined
                @click="openSignupForm()"
              >Sign Up</Button>
            </div>
          </form>
        </template>
      </content-container>

      <content-container v-else>
        <template v-slot:title>
          <h3>Check Your Email...</h3>
        </template>
        <template v-slot:body>
          <p
            class="description-text"
            style="margin-bottom: 3rem"
          >We sent an email to <b>{{ userEmail }}</b>! It has a magic link to help sign you in to Technica.</p>
          <img
            alt="Mail icon"
            src="../assets/mail-icon.svg"
            height="120"
          >
        </template>
      </content-container>
    </div>
  </div>
</template>

<script>
import Button from '@/components/Button.vue';
import ContentContainer from '@/components/ContentContainer.vue';
import generalMixin from '@/mixins/general';

export default {
  name: 'Login',
  components: {
    Button,
    ContentContainer,
  },
  mixins: [generalMixin],
  props: {
    tryingToJoinTeam: Boolean,
  },
  data() {
    return {
      loginButtonClicked: false,
      userEmail: '',
      emailNotFound: false,
      emailInvalid: false,
    };
  },
  methods: {
    async sendMagicLink() {
      if (this.userEmail !== '' && this.userEmail.includes('@')) {
        const params = { email: this.userEmail };
        this.performPostRequest(this.getEnvVariable('BACKEND'), 'authz/email', params);
        this.loginButtonClicked = true;
      } else {
        this.emailInvalid = true;
      }
    },
    verifyUserId() {
      if ((!this.getUserId())) {
        this.$router.push('Login');
      }
    },
    openSignupForm() {
      window.open(this.getEnvVariable('SIGNUP_FORM_LINK'), '_blank');
    },
  },
  mounted() {
    // // console.log('Team?', this.tryingToJoinTeam);
  },
  watch: {
    $route(to) { // watch route changes and kick the user out if they're not properly logged in
      if (to.name !== 'Login') {
        this.verifyUserId();
      }
    },
  },
};
</script>

<style scoped>
.page-container {
  width: 100vw;
}

.login-container {
  margin-top: 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

@media (min-width: 900px) {
  .form-control {
    max-width: 415px;
  }
}

.description-text {
  color: var(--color-muted-text);
}

.login-footer {
  margin-bottom: 3rem;
}

.text-error {
  color: var(--color-error);
}

.team-alert {
  border-radius: var(--border-radius);
}
</style>
