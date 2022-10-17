<template>
  <b-container class="page-container">
    <div class="sponsor-header">
      <router-link
        to="/sponsors"
        class="back-button-container"
      >
        <Button>
          <span class="text-left">Back to Sponsors</span>
        </Button>
      </router-link>
    </div>
    <b-card class="sponsor-body">
      <template v-if="dataLoaded">
        <b-row>
          <b-col md="8">
            <h3>{{ sponsor.main_title }}</h3>
          </b-col>
        </b-row>
        <b-row>
          <b-col
            md="8"
            class="sponsor-body-left"
          >
            <b-carousel
              v-if="sponsor.images && sponsor.images.length > 0"
              id="carousel-1"
              :interval="7000"
              controls
              class="sponsor-carousel"
            >
              <b-carousel-slide
                v-for="image in sponsor.images"
                :key="image"
                class="carousel-slide"
              >
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
            <h4 class="sponsor-info-title">
              <span class="underlined">About Us</span>
            </h4>
            <div class="sponsor-description">
              <span v-html="sponsor.description"></span>
            </div>
          </b-col>
          <b-col col>
            <div
              v-if="sponsor.main_video_session"
              class="sponsor-info-card"
            >
              <h4 class="sponsor-info-title">
                <span class="underlined">Speak with {{sponsor.main_title}}</span>
              </h4>
              <div v-if="sponsor.booth_hours">
                <strong class="d-block">Open Zoom Room Hours</strong>
                {{ sponsor.booth_hours }}
              </div>
              <div class="sponsor-btn-group">
                <ZoomButton
                  :disabled="!sponsor.booth_open"
                  :href="sponsor.main_video_session"
                  @click="trackSponsorBoothActivity('JOIN_MAIN_ZOOM')"
                  size="sm"
                >
                  <span v-if="sponsor.booth_open">Join the Zoom Call</span>
                  <span v-else>Zoom Room is Closed</span>
                </ZoomButton>
                <a
                  v-if="sponsor.one_on_one_link"
                  :href="sponsor.one_on_one_link"
                  target="_blank"
                ><Button
                    size="sm"
                    secondary
                    @click="trackSponsorBoothActivity('JOIN_1_ON_1')"
                  >
                    <img
                      class="btn-icon btn-icon-left"
                      src="../assets/calendar-icons/calendar.svg"
                    >
                    Schedule a 1 on 1
                  </Button>
                </a>
              </div>
            </div>
            <div
              class="sponsor-info-card"
              v-if="sponsor.email_one || sponsor.email_two"
            >
              <h4 class="sponsor-info-title">
                <span class="underlined">Contact Us</span>
              </h4>
              <div class="sponsor-btn-group">
                <strong v-if="sponsor.email_one_title">{{sponsor.email_one_title}}</strong>
                <a
                  v-if="sponsor.email_one"
                  :href="`mailto:${sponsor.email_one}`"
                  class="email-link"
                  target="_blank"
                >{{sponsor.email_one}}</a>
                <strong v-if="sponsor.email_two_title">{{sponsor.email_two_title}}</strong>
                <a
                  v-if="sponsor.email_two"
                  :href="`mailto:${sponsor.email_two}`"
                  class="email-link"
                  target="_blank"
                >{{sponsor.email_two}}</a>
              </div>
            </div>
            <div
              class="sponsor-info-card"
              v-if="
              sponsor.downloadable_content &&
              sponsor.downloadable_content.length > 0
            "
            >
              <h4 class="sponsor-info-title">
                <span class="underlined">Downloadable Content</span>
              </h4>
              <div class="sponsor-btn-group">
                <a
                  v-for="item in sponsor.downloadable_content"
                  :key="item.title"
                  :href="item.link"
                  target="_blank"
                  @click="trackSponsorBoothActivity('DOWNLOAD_ASSET')"
                >
                  <Button
                    size="sm"
                    class="download-btn"
                  >
                    <img
                      src="../assets/download.svg"
                      alt="Download Icon"
                      class="btn-icon btn-icon-left"
                    >
                    <span class="text-left">{{item.title}}</span>
                  </Button>
                </a>
              </div>
            </div>
          </b-col>
        </b-row>
        <div
          class="sponsor-footer"
          v-if="sponsor.footer_links && sponsor.footer_links.length > 0"
        >
          <h4 class="sponsor-info-title">
            <span class="underlined">{{ sponsor.footer_title || "Job Postings" }}</span>
          </h4>
          <b-row>
            <b-col
              md="4"
              v-for="footerItem in sponsor.footer_links"
              :key="footerItem.title"
              class="job-posting-container"
            >
              <a
                :href="footerItem.link"
                target="_blank"
                style="width: 100%"
                @click="trackSponsorBoothActivity('VIEW_JOB_POSTING')"
              >
                <div class="job-posting">
                  <p class="posting-title">{{ footerItem.title }}</p>
                </div>
              </a>
            </b-col>
          </b-row>
        </div>
      </template>
      <LoadingSpinner
        v-else
        class="loading-spinner-container"
      />
    </b-card>
  </b-container>
</template>

<script>
import Button from '../components/Button.vue';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import ChevronIcon from '../components/ChevronIcon.vue';
import ZoomButton from '../components/ZoomButton.vue';
import generalMixin from '../mixins/general';

export default {
  name: 'SponsorBooth',
  components: {
    Button,
    LoadingSpinner,
    ZoomButton,
    ChevronIcon,
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
    const sponsorData = await this.performGetRequest(
      this.getEnvVariable('BACKEND'),
      'admin/sponsor_booth',
      params,
    );
    if (sponsorData.Items && sponsorData.Items.length > 0) {
      // eslint-disable-next-line prefer-destructuring
      this.sponsor = sponsorData.Items[0];
    } else {
      this.$router.push('/404');
    }
    this.dataLoaded = true;
    await this.trackSponsorBoothActivity('VIEW_BOOTH');
  },
  data() {
    return {
      sponsorDescription:
        'Major League Hacking (MLH) is the official student hackathon league. Each year, we power over 200 weekend-long invention competitions that inspire innovation, cultivate communities and teach computer science skills to more than 65,000 students around the world. <br /><br />MLH has been a community first, mission driven organization from the beginning. We measure our success by the number of hackers we empower, and we want to keep it that way. <br /><br />Have a question about MLH? Head over to our FAQ to find some answers to common questions.',
      slide: 0,
      sponsorId: null,
      dataLoaded: false,
      sponsor: null,
    };
  },
  methods: {
    async trackSponsorBoothActivity(activityName) {
      const params = {
        user_id: this.getUserId(),
        sponsor_id: this.sponsorId,
        activity_name: activityName,
      };
      await this.performPostRequest(
        this.getEnvVariable('BACKEND'),
        'admin/sponsor_activity',
        params,
      );

      if (activityName === 'VIEW_BOOTH') {
        const achievementName = `Viewed sponsor booth for ${this.sponsor.main_title}`;
        // const resp = await this.addAchievement(this.getUserId(), achievementName, 'view-sponsor-booth');
        // console.log('addAchievement', resp);
      }
      if (activityName === 'JOIN_1_ON_1') {
        // console.log('sponsor: ', this.sponsor.main_title);
        const achievementName = `Attended a 1-1 with ${this.sponsor.main_title}`;
        // const resp = await this.addAchievement(this.getUserId(), achievementName, 'sponsor-one-on-one');
        // console.log('addAchievement', resp);
      }
      if (activityName === 'JOIN_MAIN_ZOOM') {
        // console.log('sponsor: ', this.sponsor.main_title);
        const achievementName = `Attended a Zoom Meeting with ${this.sponsor.main_title}`;
        // const resp = await this.addAchievement(this.getUserId(), achievementName, 'sponsor-zoom');
        // console.log('addAchievement', resp);
      }
    },
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
  text-decoration: none;
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
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}

.download-btn:focus,
.download-btn:hover,
.download-btn:active {
  background-color: var(--color-primary-muted) !important;
  border-color: var(--color-primary-muted) !important;
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
  border: 2px solid var(--color-primary);
  background-color: var(--color-primary-muted-muted);
  -webkit-transition: background-color 0.5s;
  -o-transition: background-color 0.5s;
  transition: background-color 0.5s;
  padding: 1rem;
  margin: 1rem 0;
  min-height: 150px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.job-posting:hover {
  background-color: var(--color-muted);
}

.job-posting-link {
  color: var(--color-primary-muted);

  /* Prevent space from inline elements */
  font-size: 0;
}

.job-posting a {
  font-size: 1.25rem;
}

.job-link-icon {
  stroke: var(--color-primary-muted);
}

.loading-spinner-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}
</style>
