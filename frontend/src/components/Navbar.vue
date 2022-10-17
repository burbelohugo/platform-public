<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light navigation-box sticky-top">
    <div class="logo-nav">
      <router-link
        to="/"
        class="navbar-brand"
      >
        <img
          alt="Technica logo"
          src="../assets/technica/technica-logo.svg"
          class="img-responsive"
        />
      </router-link>
    </div>
    <template v-if="displayRouteList">
      <button
        class="navbar-toggler"
        type="button"
        data-toggle="collapse"
        data-target="#navbarSupportedContent"
        aria-controls="navbarSupportedContent"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
      </button>

      <div
        class="collapse navbar-collapse"
        id="navbarSupportedContent"
      >
        <ul class="navbar-nav">
          <nav-item
            v-for="navRoute in navRoutes"
            :title="navRoute.name"
            :destinationRoute="navRoute.path"
            :dropdown="navRoute.dropdown"
            :userIsMemberOfTeam="userIsMemberOfTeam"
            :key="navRoute.name"
          />
        </ul>
      </div>
    </template>
  </nav>
</template>

<script>
import NavItem from '@/components/NavItem.vue';

export default {
  name: 'Navbar',
  components: {
    NavItem,
  },
  props: {
    displayRouteList: {
      type: Boolean,
      default: true,
    },
    userIsMemberOfTeam: Boolean,
  },
  data() {
    return {
      navRoutes: this.$router.options.routes.filter(
        (route) => route.displayInNavBar,
      ),
    };
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.navbar {
  background-color: var(--color-foreground) !important;
  box-shadow: 0 4px 4px -5px var(--color-shadow);
  display: flex;
  justify-content: space-between;
}

.navbar-brand img {
  height: 2rem;
  margin-left: 1rem;
}

.navbar-light .navbar-toggler {
  color: transparent;
  border-color: transparent;
}

.navbar-nav {
  margin-left: auto;
}
</style>
