<template>
  <div class="about">
    <h1 class="error">404</h1>
    <h1 class="sorry">Sorry! We can't find the page you were looking for.</h1>
    <Button @click="goBack">Back to Homepage</Button>
  </div>
</template>

<script>
import Button from '@/components/Button.vue';
import generalMixin from '../mixins/general';

export default {
  name: '404',
  components: {
    Button,
  },
  mixins: [generalMixin],
  methods: {
    goBack() {
      this.$router.push({ name: 'Home' });
    },
  },
  async created() {
    // if user does not exist, redirect to login screen
    if (!this.getUserId()) {
      this.$router.push('Login');
    }
  },
};
</script>

<style scoped>
.about {
  text-align: left;
  padding: 10.2rem;
  padding-top: 5.3rem;
}

.error {
  font-size: 7.1rem;
  font-weight: 600;
  color: var(--color-error);
}

.sorry {
  font-size: 4.75rem;
  padding-top: 0.9rem;
  font-weight: 600;
  padding-bottom: 3.25rem;
  line-height: 100%;
  background: linear-gradient(
    to bottom right,
    var(--color-flame) 5.87%,
    var(--color-bitcamp) 40.41%,
    var(--color-mango) 64.94%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

html {
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: cover;
}
</style>
