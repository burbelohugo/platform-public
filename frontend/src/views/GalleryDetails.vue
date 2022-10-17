<template>
  <b-container class="page-container">
    <div class="sponsor-header">
      <router-link to="/gallery" class="back-button-container">
        <ChevronIcon class="btn-icon btn-icon-left" />Back To Project Gallery
      </router-link>
    </div>
    <b-card class="sponsor-body">
      <template v-if="dataLoaded">
        <b-row>
          <b-col md="8">
            <h3>{{ sponsor.name }}</h3>
          </b-col>
        </b-row>
        <b-row>
          <b-col md="8" class="sponsor-body-left">
            <b-carousel
              v-if="sponsor.images && sponsor.images.length > 0"
              id="carousel-1"
              :interval="7000"
              controls
              class="sponsor-carousel"
            >
              <b-carousel-slide v-for="image in sponsor.images" :key="image" class="carousel-slide">
                <template slot="img">
                  <img
                    :src="image"
                    class="carousel-image"
                  />
                </template>
              </b-carousel-slide>
            </b-carousel>
            <img
              v-else-if="sponsor.logo_image"
              class="sponsor-logo-icon"
              :src="sponsor.logo_image"
            />
            <h4 class="project-info-title">
              <span>Description</span>
            </h4>
            <div class="sponsor-description">
              <span>{{ sponsor.description }}</span>
            </div>
            <h4 class="project-info-title">
              <span>Elevator Pitch</span>
            </h4>
            <div class="sponsor-description">
              <span>{{ sponsor.ep }}</span>
            </div>
            <h4 class="project-info-title">
              <span>Built With</span>
            </h4>
            <div class="sponsor-description" v-if="sponsor.technologies">
              <span class="item" v-for="tech in sponsor.technologies" :key="tech">{{tech}}</span>
            </div>
            <h4 class="project-info-title">
              <span>Try It Out</span>
            </h4>
            <div class="sponsor-description" v-if="sponsor.tio">
              <a class="try-it-out-link-style" :href="'https://' + sponsor.tio">{{ sponsor.tio }}</a>
            </div>
          </b-col>
          <b-col col> </b-col>
        </b-row>
        <div class="sponsor-footer" v-if="sponsor.footer_links && sponsor.footer_links.length > 0">
          <b-row> </b-row>
        </div>
      </template>
      <LoadingSpinner v-else class="loading-spinner-container" />
    </b-card>
  </b-container>
</template>

<script>
// import Button from '../components/Button.vue';
import LoadingSpinner from '../components/LoadingSpinner.vue';
// import ChevronIcon from '../components/ChevronIcon.vue';
// import ZoomButton from '../components/ZoomButton.vue';
import generalMixin from '../mixins/general';

export default {
  name: 'SponsorBooth',
  components: {
    // Button,
    LoadingSpinner,
    // ZoomButton,
    // ChevronIcon,
  },
  mixins: [generalMixin],
  async mounted() {
    window.scrollTo(0, 0);
    this.sponsorId = this.$route.query.id;
    // console.log(this.sponsorId);
    if (!this.sponsorId) {
      this.$router.push('/404');
    }
    const params = {
      id: this.sponsorId,
    };
    const endpoint = "https://ql5n6ac9dc.execute-api.us-east-1.amazonaws.com/dev/submit";
    const url = "get_project";
    const sponsorData = await this.performGetRequest(
      endpoint,
      url,
      params,
    );
    if (sponsorData.Items && sponsorData.Items.length > 0) {
      // eslint-disable-next-line prefer-destructuring
      this.sponsor = sponsorData.Items[0];
    } else {
      this.$router.push('/404');
    }
    this.dataLoaded = true;
  },
  data() {
    return {
      slide: 0,
      sponsorId: null,
      dataLoaded: false,
      sponsor: null,
    };
  },
  methods: {

  },
};
</script>

<style scoped>
.page-container {
  padding-bottom: 2rem;
}

.row {
  margin-top: 0;
}

.back-button-container {
  display: flex;
  align-items: center;
}

.sponsor-carousel {
  margin-bottom: 2rem;
  border-radius: var(--border-radius);
  overflow: hidden;
  background-color: var(--color-midnight);
}

.carousel-image {
  height: 420px;
  width: 100%;
  object-fit: contain;
}

/* Overriding carousel controls */
::v-deep .carousel-control-prev-icon,
::v-deep .carousel-control-next-icon {
  border: 2px solid var(--color-dark-text);
  height: 3rem;
  width: 3rem;
  padding: 0.5rem;
  background-color: var(--color-foreground);
  border-radius: 50%;
  background-image: url("../assets/carousel-arrow.svg");
}
::v-deep .carousel-control-next-icon {
  transform: rotate(180deg);
}
::v-deep .carousel-control-prev,
::v-deep .carousel-control-next {
  opacity: 0.75;
}

::v-deep .carousel-control-prev:hover,
::v-deep .carousel-control-next:hover {
  opacity: 1;
}

.sponsor-logo-icon {
  display: block;
  width: 100%;
  margin: 1rem auto;
}

.sponsor-header {
  margin: 2rem 0;
}

.sponsor-body {
  text-align: left;
}

.sponsor-description {
  margin: 1rem 0;
}

.sponsor-info-card {
  margin-bottom: 3rem;
}

.sponsor-info-title {
  font-weight: bold;
  font-family: var(--body-font);
  font-size: 22px;
  margin-bottom: 1rem;
}

/* This is in a seperate element to enable the underline to
   not fill the width of the row */
.underlined {
  position: relative;
}

/* Can't just use regular underlines/borders because of long
 sponsor names */
.underlined::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  top: 100%;
  height: 4px;
  background-color: var(--color-secondary);
}

/* These rules make the width of each .btn and <a> inside
 `.sponsor-btn-group`s as wide as the widest child */
.sponsor-btn-group {
  display: inline-flex;
  flex-direction: column;
}

.sponsor-btn-group .btn,
.sponsor-btn-group a {
  width: 100%;
}

.btn {
  margin-left: 0;
  margin-right: 0;
}

.download-btn {
  background-color: var(--color-bark);
  border-color: var(--color-bark);
}

.download-btn:focus,
.download-btn:hover,
.download-btn:active {
  background-color: var(--color-soil) !important;
  border-color: var(--color-soil) !important;
}

.email-link:not(:last-child) {
  margin-bottom: 1rem;
}

.posting-title {
  font-style: normal;
  font-weight: 600;
  font-size: 18px;
  line-height: 22px;
  margin-bottom: 1rem;
}

.job-posting-container {
  display: flex;
}

.job-posting {
  width: 100%;
  border-radius: var(--border-radius);
  border: 2px solid var(--color-soil);
  padding: 1rem;
  margin: 1rem 0;
  min-height: 150px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.job-posting-link {
  color: var(--color-soil);

  /* Prevent space from inline elements */
  font-size: 0;
}

.job-posting a {
  font-size: 1.25rem;
}

.job-link-icon {
  stroke: var(--color-soil);
}

.loading-spinner-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.item {
  background-color: #a88aa8;
  border-radius: 4px;
  padding: 4px 8px;
  margin-right: 19px;
  font-weight: 600;
  font-size: 16px;
  line-height: 20px;
  /* identical to box height, or 125% */
  stroke: var(--color-soil);
  color: #ffffff;
}

.project-info-title {
  font-family: DINPro;
  font-style: normal;
  font-weight: 500;
  font-size: 36px;
  color: #a88aa8;
}

.try-it-out-link-style {
  color: #2d2d2d;
  font-size: 24px;
}
</style>
