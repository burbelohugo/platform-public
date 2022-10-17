<template>
  <div class="pb-5">
    <b-container id="mentor-container">
      <h2 class="page-header mb-0">Request a Mentor</h2>
      <div class="row justify-content-center mt-0">
        <p class="page-description col-md-10">
          Need help with your hack? Send a request using the form below, and one of our mentors
          will connect with you over Slack. Please be as detailed as possible in your request,
          including specific coding languages/technologies you're using.
        </p>
      </div>
    </b-container>
    <div
      class="mentor-body"
      style="display: flex"
    >
      <div class="mentor-left">
        <div class="mentor-form">
          <div style="margin-top: -1rem">
            <form @submit.prevent="goToProfile">
              <div class="form-group">
                <div class="input-wrapper">
                  <input
                    type="text"
                    class="form-control mx-auto title-large"
                    id="titleInput"
                    placeholder="Title"
                    v-model="requestTitle"
                  />
                </div>

                <div class="dropdown">
                  <a
                    class="nav-link mx-auto dropdown-toggle dropdown-border"
                    href="#"
                    role="button"
                    id="dropdownMenuLink"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    {{ topicDropdown }}
                  </a>

                  <div
                    class="dropdown-menu"
                    aria-labelledby="dropdownMenuLink"
                  >
                    <a
                      class="dropdown-item"
                      href="#"
                      v-for="option in options"
                      :key="option.value"
                      :value="option.value"
                      @click="topicDropdown = option.value"
                    >{{ option.value }}</a>
                  </div>
                </div>

                <div class="input-wrapper">
                  <textarea
                    id="exampleFormControlTextarea1"
                    rows="7"
                    class="form-control mx-auto"
                    v-model="requestDescription"
                    placeholder="Describe your issue here (optional)."
                  ></textarea>
                </div>
              </div>
            </form>
          </div>
          <div class="mentor-form-buttons">
            <Button
              outlined
              style="margin-right: 1rem"
              @click="clearFields"
            >
              Clear
            </Button>
            <Button
              size="lg"
              @click="submitMentorRequest"
              class="mr-0"
            >
              Submit Request
            </Button>
          </div>
        </div>
      </div>
      <div class="mentor-right">
        <div class="mentor-request-list">
          <div class="mentor-request-list-header">Unresolved</div>
          <div
            v-if="!requestsLoading && requests.length > 0"
            class="mentor-request-list-body"
          >
            <Banner
              v-for="request in requests"
              :text="request.title"
              :key="request.title + request.description"
              @view="viewRequest(request)"
              :displayViewButton="true"
              :hideLogo="true"
            />
          </div>
          <div
            v-if="!requestsLoading && requests.length <= 0"
            class="mentor-request-list-body"
          >
            <Banner
              text="Once you submit a mentorship request, it will be displayed here!"
              :hideLogo="true"
            />
          </div>
          <div
            v-if="requestsLoading"
            class="mentor-request-list-body"
          >
            <LoadingSpinner />
          </div>
        </div>
      </div>
    </div>

    <b-modal
      id="mentorRequestModal"
      title="View Request"
      size="lg"
      centered
    >
      <p><b>Title:</b> {{ currentRequest.title }}</p>
      <p v-if="currentRequest.topic">
        <b>Topic:</b> {{ currentRequest.topic }}
      </p>
      <p v-if="currentRequest.description">
        <b>Description:</b> {{ currentRequest.description }}
      </p>
      <template v-slot:modal-footer>
        <Button
          @click="resolveCurrentRequest()"
          size="sm"
          outlined
        >
          Resolve Request
        </Button>
        <Button
          @click="closeModal()"
          size="sm"
        >Close</Button>
      </template>
    </b-modal>
  </div>
</template>

<script>
import Button from '@/components/Button.vue';
import Banner from '@/components/Banner.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import generalMixin from '../mixins/general';

export default {
  name: 'RequestMentor',
  components: {
    Button,
    Banner,
    LoadingSpinner,
  },
  mixins: [generalMixin],
  data() {
    return {
      requestTitle: '',
      requestDescription: '',
      requestsLoading: true,
      requests: [],
      topicDropdown: 'Topic',
      currentRequest: {},
      options: [
        {
          value: 'IOS',
        },
        {
          value: 'Android',
        },
        {
          value: 'Backend',
        },
        {
          value: 'Frontend',
        },
        {
          value: 'Hardware',
        },
        {
          value: 'Other',
        },
      ],
    };
  },
  async mounted() {
    await Promise.all([
      this.activityTracking('REQUEST_MENTOR'),
      this.getMentorRequests(),
      this.setUserSlackId(),
    ]);
  },
  methods: {
    async submitMentorRequest() {
      if (!this.requestTitle) {
        return;
      }
      this.requestsLoading = true;
      const requestMentorPostParams = {
        user_id: this.getUserId(),
        title: this.requestTitle || ' ',
        topic: this.topicDropdown || ' ',
        description: this.requestDescription || ' ',
      };
      this.clearFields();
      await this.performPostRequest(
        this.getEnvVariable('BACKEND'),
        'projects/mentorship_requests',
        requestMentorPostParams,
      );
      await this.getMentorRequests();
      this.requestsLoading = false;
    },
    closeModal() {
      this.$bvModal.hide('mentorRequestModal');
    },
    async getMentorRequests() {
      this.requestsLoading = true;
      const params = {
        user_id: this.getUserId(),
      };
      const invites = await this.performGetRequest(
        this.getEnvVariable('BACKEND'),
        'projects/mentorship_requests/user',
        params,
      );
      this.requests = [];
      Object.keys(invites).forEach((k) => {
        if (!invites[k].resolved) {
          this.requests.push(invites[k]);
        }
      });
      this.requestsLoading = false;
    },
    clearFields() {
      this.requestTitle = '';
      this.requestTopic = '';
      this.requestDescription = '';
    },
    viewRequest(request) {
      this.currentRequest = request;
      this.$bvModal.show('mentorRequestModal');
    },
    async resolveRequest(request) {
      const params = {
        id: request.id,
        resolved: true,
      };
      await this.performPostRequest(
        this.getEnvVariable('BACKEND'),
        'projects/mentorship_requests/update',
        params,
      );
    },
    async resolveCurrentRequest() {
      this.closeModal();
      this.requestsLoading = true;
      await this.resolveRequest(this.currentRequest);
      await this.getMentorRequests();
      this.requestsLoading = false;
    },
  },
};
</script>

<style scoped>
.mentor-body {
  display: flex;
  padding-left: 10rem;
  padding-right: 10rem;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
}
.mentor-left {
  height: fit-content;
  width: 40%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-flow: column;
}
.mentor-right {
  height: 70vh;
  width: 40%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-flow: column;
}
.mentor-form {
  height: 100%;
  width: 100%;
}
.mentor-description {
  height: fit-content;
  width: 80%;
  margin-top: 10%;
  background: var(--color-foreground-accent);
  border-radius: 8px;
  padding: 1rem;
}
.input-wrapper {
  margin-top: 1rem;
  margin-bottom: 1rem;
}
.title-large {
  font-style: normal;
  font-weight: 500;
  font-size: 24px;
  line-height: 33px;
}
.form-control {
  border: 1px solid var(--color-border) !important;
  width: 80%;
  border-radius: var(--border-radius);
}
.mentor-form-buttons {
  float: right;
  margin-right: 10%;
}
.mentor-request-list {
  height: 100%;
  width: 80%;
  background: var(--color-foreground);
  box-sizing: border-box;
  border-radius: var(--border-radius);
}
.mentor-request-list-header {
  width: 100%;
  font-style: normal;
  font-weight: 500;
  font-size: 2rem !important;
  padding: 1rem 0 0.5rem;
  line-height: 31px;
  color: var(--color-primary);
}
.mentor-request-list-body {
  height: 90%;
  width: 100%;
  border-top: 4px solid var(--color-primary);
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-flow: column;
  overflow-y: auto;
}
.dropdown-menu,
.dropdown-item {
  color: var(--color-muted-text);
  font-size: 18px;
  font-weight: 600;
}
.dropdown-toggle {
  padding-left: 13.5px !important;
  padding-right: 13.5px !important;
  padding-top: 6.75px !important;
  padding-bottom: 6.75px !important;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--color-muted-text);
}
.dropdown {
  padding-left: 17.5px;
  padding-right: 17.5px;
}
.dropdown-menu {
  width: 80%;
  border-radius: 0 0 var(--border-radius) var(--border-radius);
}
.dropdown-item {
  padding-top: 5px;
  padding-bottom: 5px;
  padding-left: 10px;
  margin-left: 5px;
}
.dropdown-item:hover {
  background: var(--color-link-hover-background);
  border-radius: 4px;
  width: 93%;
}
@media (max-width: 1950px) {
  .dropdown-item:hover {
    width: 90%;
  }
}
@media (max-width: 1800px) {
  .dropdown-item:hover {
    width: 85%;
  }
}
.dropdown-border {
  padding-left: 10px;
  padding-right: 10px;
  border: 1px solid var(--color-border) !important;
  background: var(--color-foreground);
  width: 80%;
  border-radius: var(--border-radius);
}

@media (max-width: 1400px) {
  .mentor-body {
    padding: 2rem;
  }

  .mentor-left,
  .mentor-right {
    width: 50%;
  }
}

.page-description {
  padding: 1rem 3rem;
}
</style>
