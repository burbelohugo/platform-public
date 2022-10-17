<template>
  <div>
    <b-row
      v-for="row in sponsorGrid"
      :key="row.id"
      class="d-flex justify-content-around"
    >
      <b-col
        v-for="sponsor in row"
        :key="sponsor.id"
        sm="4"
      >
        <router-link :to="'/sponsor?id=' + sponsor.booth_id">
          <SponsorCard v-bind:sponsor="sponsor" />
        </router-link>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import SponsorCard from '@/components/Sponsors/SponsorCard.vue';

export default {
  name: 'SponsorSection',
  components: {
    SponsorCard,
  },
  props: {
    sponsorList: Array,
  },
  data() {
    return {
      sponsorGrid: [],
      numRows: 0,
    };
  },
  async mounted() {
    this.create_grid();
  },
  watch: {
    // watch prop on change, strangely this is needed for init
    sponsorList() {
      this.create_grid();
    },
  },
  methods: {
    create_grid() {
      for (let i = 0; i < this.sponsorList.length; i += 1) {
        if (i % 3 === 0) {
          this.sponsorGrid.push([]);
          this.numRows += 1;
        }
        this.sponsorGrid[this.numRows - 1].push(this.sponsorList[i]);
      }
    },
  },
};
</script>

<style scoped>
.section-banner {
  max-height: 50px;
  align-items: center;
}

.section-title {
  min-width: 15em;
  max-width: 15em;
}

.row {
  justify-content: center;
  align-items: center;
  margin: 1em;
}

.col-sm {
  min-width: 15rem;
  height: 100%;
  padding-top: 1em;
  padding-bottom: 1em;
}

/* horizontal line */
.hl {
  border-top: 6px solid var(--color-border);
  width: 100%;
  height: 10px;
}
</style>
