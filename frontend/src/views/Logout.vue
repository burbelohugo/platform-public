<template>
  <div class="page-container">
    <div class="login-container">
      <div class="container content-container col-md-7 col-lg-8 col-xl-4">
        <div class="content-container-title">
          <h3>Log Out of Technica?</h3>
        </div>
        <div class="content-container-body">
          <p class="description-text">You can always log back in at any time via a new magic link.</p>
          <Button
            @click="goBack"
            outlined
            style="margin-right: 2rem;"
          >
            Cancel
          </Button>
          <Button @click="logout">Log Out</Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Button from '@/components/Button.vue';
import GeneralMixin from '../mixins/general';

export default {
  name: 'Logout',
  components: {
    Button,
  },
  mixins: [GeneralMixin],
  data() {
    return {
      loginButtonClicked: false,
      userEmail: '',
      emailNotFound: false,
      emailInvalid: false,
    };
  },
  methods: {
    logout() {
      this.removeUserIdCookie();
      this.removeUserNameCookie();
      this.removeUserGroupCookie();
      this.removeSponsorBoothIdCookie();
      this.removeCurrentUserCookie();
      this.$router.push('Login');
    },
    goBack() {
      this.$router.go(-1);
    },
  },
};
</script>

<style scoped>
.page-container {
  width: 100vw;
  height: 100vh;
}

.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 90%;
}

.content-container {
  border-radius: 8px;
  padding: 3rem;
  background-color: var(--color-foreground);
  border-radius: var(--border-radius);
}

@media (max-width: 800px) {
  .content-container {
    padding: 1rem;
  }
}

@media (min-width: 900px) {
  .form-control {
    max-width: 415px;
  }
}

.content-container-title {
  margin-top: 3rem;
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
</style>
