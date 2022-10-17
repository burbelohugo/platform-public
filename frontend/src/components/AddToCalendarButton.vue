<template>
  <b-dropdown
    id="add-to-cal-dropdown"
    variant="secondary"
    size="sm"
  >
    <template
      #button-content
      class="d-flex"
    >
      <img
        src="../assets/calendar-icons/calendar.svg"
        class="btn-icon btn-icon-left"
      />
      <span class="toggler-text">Add to Calendar</span>
    </template>
    <b-dropdown-item
      v-for="{ serviceName, linkText } in services"
      :href="generateAddToCalendarLink(selectedEvent, serviceName)"
      :key="serviceName"
      target="_blank"
    >
      <img
        :src="require(`@/assets/calendar-icons/${serviceName}.svg`)"
        class="btn-icon btn-icon-left"
      >
      <span class="dropdown-item-link-text">{{ linkText }}</span>
    </b-dropdown-item>
  </b-dropdown>

</template>

<script>
import generalMixin from '../mixins/general';
import scheduleMixin from '../mixins/schedule';

export default {
  props: {
    selectedEvent: Object,
  },
  mixins: [generalMixin, scheduleMixin],
  computed: {
    services() {
      return [
        { serviceName: 'google', linkText: 'Google' },
        { serviceName: 'apple', linkText: 'Apple' },
        { serviceName: 'outlook', linkText: 'Outlook' },
      ];
    },
  },
};
</script>

<style scoped>
/* Use the deep select (>>>) to target inaccessible class in a child component */
#add-to-cal-dropdown >>> .dropdown-toggle {
  display: flex;
  align-items: center;
}

#add-to-cal-dropdown >>> .dropdown-toggle:after {
  margin-left: auto;
}

#add-to-cal-dropdown >>> .dropdown-menu {
  min-width: 100%;
}

#add-to-cal-dropdown >>> .dropdown-item {
  width: auto;
  margin: 0 0.5rem;
  padding: 0.25rem;
  font-weight: bold;
  font-size: 1em;
  color: var(--color-dark-text);
  border-radius: 4px;
}

#add-to-cal-dropdown >>> .dropdown-item:hover {
  background-color: var(--color-link-hover-background);
}

.toggler-text {
  margin-right: 0.5rem;
}

.dropdown-item-link-text {
  vertical-align: middle;
}
</style>
