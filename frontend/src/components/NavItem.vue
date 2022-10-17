<template>
  <li
    v-if="!dropdown"
    :id="'navbar-' + title"
    class="nav-item"
  >
    <router-link
      :to="destinationRoute"
      class="nav-link"
    >
      {{ title }}
    </router-link>
  </li>
  <li
    v-else
    class="nav-item dropdown"
  >
    <a
      class="nav-link dropdown-toggle"
      :id="`navbar-${title}`"
      role="button"
      data-toggle="dropdown"
      aria-haspopup="true"
      aria-expanded="false"
    >
      {{ title }}
    </a>
    <div
      class="dropdown-menu"
      :aria-labelledby="`navbar-${title}`"
    >
      <router-link
        v-for="dropdownItem in visibleItemsInDropdown"
        :to="dropdownItem.path"
        :key="dropdownItem.name"
        class="dropdown-item"
      >
        {{ dropdownItem.name }}
      </router-link>
    </div>
  </li>
</template>

<script>
const routesThatRequireTeamMembership = [];

export default {
  name: 'NavItem',
  props: {
    title: String,
    destinationRoute: String,
    dropdown: {
      type: Array,
      default: null,
    },
    userIsMemberOfTeam: Boolean,
  },
  computed: {
    visibleItemsInDropdown() {
      if (this.userIsMemberOfTeam) {
        return this.dropdown;
      }

      return this.dropdown.filter(
        (dropdownItem) => !routesThatRequireTeamMembership.includes(dropdownItem.path),
      );
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.nav-link,
.dropdown-menu,
.dropdown-item {
  color: var(--color-dark-text) !important;
  font-family: var(--title-font);
  font-size: 20px;
  border-radius: 4px;
}

.nav-link:hover,
.nav-link.dropdown-toggle:hover,
.dropdown-item:hover {
  text-decoration: none;
  background-color: var(--color-link-hover-background);
}

.nav-link.router-link-exact-active{
  text-decoration: none;
  background-color: var(--color-link-active-background);
}

.navbar-nav .nav-link {
  padding: 0.5rem;
}

.nav-item {
  margin-left: 0.5rem;
  margin-right: 0.5rem;
  box-sizing: border-box;
}

@media screen and (max-width: 992px) {
  .nav-link {
    width: 100%;
    text-align: left;
  }

  .dropdown-menu {
    border: 0;
    margin-top: 0;
    margin-left: 1rem;
  }
}

.dropdown-item {
  width: auto;
  margin: 0 0.5rem;
  padding: 0.25rem;
}

/* Fix bug with dropdown menu clipping off screen */
.nav-item:last-child .dropdown-menu {
  left: auto;
  right: 0;
}

/* Add live blinking for expo nav item */
#navbar-Expo {
  position: relative;
}
#navbar-Expo::after {
  position: absolute;
  content: "";
  top: 0.6rem;
  right: 0.1rem;
  width: 0.5em;
  height: 0.5em;
  border-radius: 50%;
  background-color: var(--rose);
  animation: 1s infinite alternate ease-in-out blink;
}
@keyframes blink {
  from {
    opacity: 0.25;
  }
  to {
    opacity: 1;
  }
}
</style>
