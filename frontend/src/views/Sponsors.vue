<template>
  <div>
    <h2 class="page-header">Sponsor Booths</h2>
    <b-container class="sponsors-container">
      <div v-if="dataLoaded">
        <p>Below is a list of our amazing event sponsors. Click a sponsor's logo below to visit their virtual booth, where you can view more information about their organization, schedule an appointment with them, and more!</p>
        <div class="sponsor-section">
          <sponsor-section :sponsorList="sponsors" />
        </div>
      </div>
      <div v-else>
        <LoadingSpinner />
      </div>
    </b-container>
    <EasterEgg
          :index=2
          :hint="'You’re too smart for this. Feel free to explore the sponsors’ booths before moving on! Once you’re ready, here’s the next Techniclue: decrypt “BSBKQP” to know where to go next (hint: it’s a Caesar cipher with a left shift of 3!)'"
          :fileName="'scavenger-hunt/3.png'"
        />
  </div>
</template>

<script>
import SponsorSection from '@/components/Sponsors/SponsorSection.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import EasterEgg from '@/components/EasterEgg.vue';
import generalMixin from '../mixins/general';

export default {
  name: 'Sponsors',
  components: {
    SponsorSection,
    LoadingSpinner,
    EasterEgg,
  },
  mixins: [generalMixin],
  // create sponsor sections
  data() {
    // Construct the sponsor tier ordering (more expensive -> less expensive)
    const tiers = ['Partner', 'Recruiter', 'API', 'Starter'];
    const tierOrdering = {};
    tiers.forEach((tier, i) => { tierOrdering[tier] = i; });

    return {
      tierOrdering,
      tiers,
      sponsors: [],
      dataLoaded: false,
    };
  },
  async mounted() {
    let rawActiveBooths;

    // Fetch all sponsor info & the active booths
    [this.sponsors, rawActiveBooths] = await Promise.all([
      this.getDataSimple(this.getEnvVariable('BACKEND'), 'projects/sponsorship_info'),
      this.getDataSimple(this.getEnvVariable('BACKEND'), 'admin/sponsor_booths/active'),
    ]);

    // Only show sponsors with valid booth ids
    const activeBooths = new Set(rawActiveBooths);
    this.sponsors = this.sponsors
      .filter((sponsor) => sponsor.booth_id)
      .map((sponsor) => ({
        ...sponsor,
        booth_open: activeBooths.has(sponsor.booth_id),
      }));

    // Sort sponsors by their tiers
    this.sponsors.sort((sponsor1, sponsor2) => this.getTierPosition(sponsor1) - this.getTierPosition(sponsor2));
    this.dataLoaded = true;
  },
  methods: {
    // Returns how highly a sponsor should be ranked based on its tier
    // Lower ranks = more highly placed
    getTierPosition(sponsor) {
      if (!sponsor.tier || this.tierOrdering[sponsor.tier] === undefined) {
        return this.tiers.length;
      }

      return this.tierOrdering[sponsor.tier];
    },
  },

};
</script>

<style scoped>
.sponsors-container {
  padding: 30px;
}
.sponsor-section {
  padding: 10px;
}
</style>
