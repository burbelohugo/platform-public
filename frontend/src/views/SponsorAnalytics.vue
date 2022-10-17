<template>
  <div>
    <h2 class="mt-3">Sponsor Analytics</h2>
    <p class="w-50 m-auto">
      Welcome to your Sponsor Booths analytics page! Here, you can see how hackers are interacting with your Sponsor Booths, view hacker profiles, and open/close your Zoom Room!
    </p>
    <div class="page-container">
      <div
        v-if="dataLoaded"
        class="sponsor-body"
      >
        <div class="sponsor-body-left">
          <div
            class="sponsor-stat"
            style="margin-top: 5rem"
          >
            <div class="sponsor-stat-title">Total Page Views</div>
            <div class="sponsor-stat-body">
              {{ totalViews }}
            </div>
          </div>
          <div
            class="sponsor-stat"
            style="margin-top: 5rem"
          >
            <div class="sponsor-stat-title">Total Open Session Participants</div>
            <div class="sponsor-stat-body">
              {{ totalParticipants }}
            </div>
          </div>
          <div
            class="sponsor-stat"
            style="margin-top: -5rem"
          >
            <div class="sponsor-stat-title">Total Job Posting Clicks</div>
            <div class="sponsor-stat-body">
              {{ totalJobPostingClicks }}
            </div>
          </div>
          <div
            class="sponsor-stat"
            style="margin-top: -5rem"
          >
            <div class="sponsor-stat-title">Total Asset Downloads</div>
            <div class="sponsor-stat-body">
              {{ totalAssetDownloads }}
            </div>
          </div>
        </div>
        <div class="sponsor-body-right">
          <div class="sponsor-info-card">
            <div class="sponsor-info-title">Sponsor Booth Settings</div>
            <Button @click="toggleBooth()">{{toggleBoothText}}</Button>
            <ZoomButton
              :href="sponsor.main_video_session"
              :disabled="!boothOpen"
              size="lg"
            >
              Join Zoom Room
            </ZoomButton>
            <router-link :to="'/sponsor?id=' + sponsorId">
              <Button>View Live Sponsor Booth</Button>
            </router-link>
          </div>
          <div class="sponsor-info-card">
            <div class="sponsor-info-title">Hacker Profiles</div>
            <div class="sponsor-info-list">
              <router-link to="/profiles">
                <Button>View Hacker Profiles</Button>
              </router-link>
            </div>
          </div>
        </div>
      </div>
      <LoadingSpinner v-else />
    </div>
  </div>
</template>

<script>
import Button from '../components/Button.vue';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import ZoomButton from '../components/ZoomButton.vue';
import generalMixin from '../mixins/general';

export default {
  name: 'SponsorBooth',
  components: {
    Button,
    LoadingSpinner,
    ZoomButton,
  },
  mixins: [generalMixin],
  async mounted() {
    window.scrollTo(0, 0);
    this.sponsorId = this.$route.query.id;
    if (!this.sponsorId) {
      this.$router.push('/404');
    }
    const params = {
      id: this.sponsorId,
    };
    const sponsorData = await this.performGetRequest(
      this.getEnvVariable('BACKEND'),
      'admin/sponsor_booth',
      params,
    );

    // console.log({ sponsorData });
    if (sponsorData.Items && sponsorData.Items.length > 0) {
      // eslint-disable-next-line prefer-destructuring
      this.sponsor = sponsorData.Items[0];
    } else {
      this.$router.push('/404');
    }
    await this.getSponsorAnalyticsStats();

    this.boothOpen = this.sponsor.booth_open;
    this.dataLoaded = true;
  },
  data() {
    return {
      sponsorDescription:
        'Major League Hacking (MLH) is the official student hackathon league. Each year, we power over 200 weekend-long invention competitions that inspire innovation, cultivate communities and teach computer science skills to more than 65,000 students around the world. <br /><br />MLH has been a community first, mission driven organization from the beginning. We measure our success by the number of hackers we empower, and we want to keep it that way. <br /><br />Have a question about MLH? Head over to our FAQ to find some answers to common questions.',
      slide: 0,
      sliding: null,
      sponsorId: null,
      dataLoaded: false,
      sponsor: null,
      boothOpen: false,
      boothError: false,
      totalViews: 0,
      totalParticipants: 0,
      totalAssetDownloads: 0,
      totalJobPostingClicks: 0,
    };
  },
  methods: {
    onSlideStart() {
      this.sliding = true;
    },
    onSlideEnd() {
      this.sliding = false;
    },
    async getSponsorAnalyticsStats() {
      // get_sponsor_activity
      const totalViews = await this.performGetRequest(
        this.getEnvVariable('BACKEND'),
        'admin/sponsor_activity',
        {
          sponsorId: this.sponsorId,
          activityType: 'VIEW_BOOTH',
        },
      );
      this.totalViews = Object.keys(totalViews).length;
      const totalParticipants = await this.performGetRequest(
        this.getEnvVariable('BACKEND'),
        'admin/sponsor_activity',
        {
          sponsorId: this.sponsorId,
          activityType: 'JOIN_MAIN_ZOOM',
        },
      );
      this.totalParticipants = Object.keys(totalParticipants).length;
      const totalDownloads = await this.performGetRequest(
        this.getEnvVariable('BACKEND'),
        'admin/sponsor_activity',
        {
          sponsorId: this.sponsorId,
          activityType: 'DOWNLOAD_ASSET',
        },
      );
      this.totalAssetDownloads = Object.keys(totalDownloads).length;
      const totalJobPostingClicks = await this.performGetRequest(
        this.getEnvVariable('BACKEND'),
        'admin/sponsor_activity',
        {
          sponsorId: this.sponsorId,
          activityType: 'VIEW_JOB_POSTING',
        },
      );
      this.totalJobPostingClicks = Object.keys(totalJobPostingClicks).length;
    },
    async toggleBooth() {
      // Toggles whether the sponsor's open zoom session is active or not
      const request = {
        booth_open: !this.boothOpen,
        id: this.sponsorId,
      };

      const response = await this.performPostRequest(
        this.getEnvVariable('BACKEND'),
        'admin/sponsor_booth/update',
        request,
      );

      // If the request didn't fail
      if (response === null) {
        this.boothError = true;
        return;
      }

      // Otherwise, toggle the booth state
      this.boothError = false;
      this.boothOpen = !this.boothOpen;
    },
  },
  computed: {
    toggleBoothText() {
      if (this.boothError) {
        const verb = this.boothOpen ? 'Closing' : 'Opening';
        return `Error ${verb} Booth. Try Again?`;
      }

      return this.boothOpen ? 'Close Zoom Room' : 'Open Zoom Room';
    },
  },
};
</script>

<style scoped>
.page-container {
  display: flex;
  justify-content: center;
  flex-direction: row;
  flex-wrap: wrap;
}

.sponsor-header {
  margin-top: 1rem;
  width: 80vw;
  display: flex;
  justify-content: space-between;
  align-content: center;
  margin-bottom: 2rem;
}

.sponsor-body {
  height: 80vh;
  width: 80vw;
}

.sponsor-footer {
  height: 30vh;
  width: 80vw;
  margin-top: 0rem;
}

.sponsor-body {
  display: flex;
  justify-content: center;
  align-items: center;
}

.sponsor-body-left {
  display: flex;
  width: 70%;
  min-height: 100%;
  height: fit-content;
  /* border: 1px solid purple; */
  flex-direction: row;
  /* justify-content: center; */
  flex-wrap: wrap;
}

.sponsor-body-right {
  display: flex;
  width: 30%;
  height: 100%;
  /* border: 1px solid black; */
  justify-content: flex-start;
  align-items: center;
  flex-direction: column;
}

.sponsor-description {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: fit-content;
  min-height: 40%;
  width: 100%;
  /* border: 1px solid green; */
  padding-left: 5rem;
  padding-right: 5rem;
  margin-bottom: 2rem;
}

.sponsor-images {
  height: 100%;
  width: 70%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.sponsor-info-card {
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1rem;
}

.sponsor-info-title {
  font-style: normal;
  font-weight: bold;
  font-size: 18px;
  line-height: 24px;
  text-align: center;
  opacity: 0.8;
  border-bottom: 4px solid var(--color-secondary);
  width: fit-content;
  margin-bottom: 0.5rem;
  margin-top: 3rem;
}

.sponsor-footer-inner {
  width: 90%;
  height: 100%;
  margin-left: 4rem;
}

.sponsor-info-list {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.sponsor-footer-row-a {
  width: 100%;
  height: 25%;
  /* border: 1px solid green; */
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-top: 1rem;
}

.sponsor-footer-row-b {
  width: 100%;
  height: 75%;
  /* border: 1px solid red; */
  display: flex;
  justify-content: center;
  align-items: flex-start;
  flex-direction: column;
  /* margin-bottom: 5rem; */
}

.posting-list {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 80%;
}

.sponsor-stat {
  width: 50%;
  height: 10%;
}

.sponsor-stat-title {
  font-style: normal;
  font-weight: normal;
  font-size: 35px;
  line-height: 36px;
  text-align: center;
}

.sponsor-stat-body {
  font-style: normal;
  font-weight: 500;
  font-size: 66px;
  line-height: 66px;
  text-align: center;
}
</style>
