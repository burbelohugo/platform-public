<template>
  <div class="about">
    <h1 class="error mt-5">Sorry!</h1>
    <h3 class="error">We're still working on setting up your account. Check again later!</h3>
  </div>
</template>

<script>
export default {
  name: 'Loading',
  beforeCreate() {
    if (window.Intercom) {
      window.Intercom('update', {
        hide_default_launcher: true,
      });
    }
  },
  beforeDestroy() {
    if (window.Intercom) {
      window.Intercom('update', {
        hide_default_launcher: false,
      });
    }
  },
}
</script>

<style scoped>

.about {
  text-align: left;
  padding: 10.2rem;
  padding-top: 5.3rem;
}

.error {
  font-size: 7rem;
  font-weight: 600;
  color: var(--color-error);
}

h3.error {
  font-size: 4rem;
  padding-top: 1.5rem;
  font-weight: 600;
  color: var(--color-error);
}

body.event .intercom-lightweight-app {
  display: none;
}
</style>
