<template>
  <div>
    <b-form-group
      label="Schedule Search"
      label-cols-sm="auto"
      class="w-50 mx-auto mb-3"
    >
      <b-form-input
        id="filter-input"
        v-model="filter"
        type="search"
        placeholder="Type to Search"
        debounce="250"
      ></b-form-input>
    </b-form-group>

    <b-table
      striped
      hover
      responsive="sm"
      :bordered="bordered"
      :items="items"
      :fields="fields"
      :sort-by.sync="sortBy"
      :sort-desc.sync="sortDesc"
      :filter="filter"
      :filter-ignored-fields="['zoom_link']"
      head-variant="dark"
      class="pb-5"
      primary-key="id"
    >
      <template #cell(zoom_link)="data">
        <ZoomButton :href="data.item.zoom_link">
          {{getShorterZoomLink(data.item.zoom_link)}}
        </ZoomButton>
      </template>
    </b-table>
  </div>
</template>

<script>
import generalMixin from '../mixins/general';
import ZoomButton from './ZoomButton';

export default {
  name: 'ExpoTable',
  mixins: [generalMixin],
  components: {
    ZoomButton,
  },
  props: {
    items: Array,
  },
  data() {
    return {
      sortBy: 'time',
      sortDesc: false,
      fields: [
        { key: 'team_name', sortable: true },
        { key: 'time', sortable: true },
        { key: 'sponsor_name', sortable: true },
        { key: 'zoom_link', sortable: false },
      ],
      bordered: true,
      filter: null,
    };
  },
  methods: {
    getShorterZoomLink(link) {
      return link.split('?')[0];
    },
  },
};
</script>
