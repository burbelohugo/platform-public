<template>
  <div class="page-container">
    <div v-if="dataLoaded" class="container pt-5" >
        <div style="text-align: left" v-if="getUserGroup() === 'sponsor'">
          <Button @click="returnToProfilesPage()" >
            Return to Profiles
          </Button>
        </div>
          <b-card no-body>
            <b-card-body>

            <b-row class="mt-4">
              <b-col md='3'>
                <img src="../assets/technica-orb.png" class="logo-icon"/>
              </b-col>

              <b-col md='9'>
              <div class="profile-header-name">
                <h3 class="w-100">
                  {{ profile.full_name }}
                  <span v-if="resumeLink" style="cursor: pointer" class="ml-3">
                    <a :href="resumeLink" target="_blank">
                      <Button outline>
                      <span style="color: black">Resume </span>
                      <img src="../assets/link.svg" class="ml-2" />
                      </Button>
                    </a>
                  </span>
                </h3>
                <h6>{{ profile.pronouns }}</h6>
                <p>{{ profile.profile_text }}</p>
              </div>
              </b-col>
            </b-row>

            </b-card-body>

      <p v-if="!this.urlUserId" class="m-0 mt-3 text-muted" style="font-size:16px">
        Your hacker profile is an optional way for you to share more information
        about yourself with the event sponsors. <br> Only sponsors can see this
        information.
      </p>
            <b-row class="m-0">

            <!-- CONTACT SECTION -->
            <b-col md='4' class="card-section">
              <b-card-body>
              <h5 class="profile-footer-box-title">Contact and Connect</h5>
              <p v-if="profile.email" class="profile-footer-box-content">
                <a :href="'mailto:' + profile.email" target="_blank">My Email</a>
              </p>
              <p v-if="profile.linkedin" class="profile-footer-box-content">
                <a :href="this.getClickableLink(profile.linkedin)" target="_blank">My LinkedIn</a>
              </p>
              <p v-if="profile.github" class="profile-footer-box-content">
                <a :href="this.getClickableLink(profile.github)" target="_blank">My Github</a>
              </p>
              <p v-if="!profile.linkedin && !profile.github && !this.urlUserId">
                Add more contact information by clicking the edit button below!
              </p>
              </b-card-body>
            </b-col>

            <!-- ACADEMICS SECTION -->
            <b-col md='4' class="card-section">
            <b-card-body>
              <h5 class="profile-footer-box-title">Academics</h5>
              <p v-if="profile.school" class="profile-footer-box-content">
                School: {{ profile.school }}
              </p>
              <p v-if="profile.gpa" class="profile-footer-box-content">
                GPA: {{ profile.gpa }}
              </p>
              <p v-if="profile.year" class="profile-footer-box-content">
                {{ profile.year }}
              </p>
              <p v-if="!profile.gpa && !profile.year && !this.urlUserId">
                Add more academic information by clicking the edit button below!
              </p>
            </b-card-body>
            </b-col>

            <!-- HACK SECTION -->
            <b-col md='4' class="card-section">
            <b-card-body>
              <h5 class="profile-footer-box-title">Our Hack</h5>
              <p v-if="profile.project_description" class="profile-footer-box-content">
                {{ profile.project_description }}
              </p>
              <p v-if="profile.devpost" class="profile-footer-box-content">
                <a :href="this.getClickableLink(profile.devpost)" target="_blank">Link to Project
                  <img src="../assets/link.svg" style="margin-left: 0.5rem"/>
                </a>
              </p>
              <p v-if="!profile.project_description && !this.urlUserId">
                Add information about your Technica project by clicking the edit
                button below!
              </p>
            </b-card-body>
            </b-col>

            </b-row>


            <b-card-body class="" v-if="!this.urlUserId">
              <Button size="lg" :editButton="true" @click="openModal()">
                <img src="../assets/edit.svg" class="btn-icon btn-icon-left">
                Edit Information
              </Button>

              <router-link to="/logout" class="navbar-brand">
                <Button>Logout</Button>
              </router-link>

            </b-card-body>


          </b-card>

    <div v-if="!this.urlUserId">
      <Passport />
    </div>


    </div>
    <LoadingSpinner v-else />
    <b-modal
      id="editProfileModal"
      title="Edit Profile"
      size="xl"
      centered
    >
      <div class="modal-body">
        <div class="modal-half">
          <h5>1) Basic Information</h5>
          <form @submit.prevent="goToProfile">
            <div class="form-group">
              <div class="input-wrapper">
                <label
                  for="exampleInputEmail1"
                  class="input-label"
                >My Name</label>
                <input
                  type="text"
                  class="form-control mx-auto"
                  id="nameInput"
                  placeholder="Grace Hopper"
                  v-model="profile.full_name"
                />
              </div>
              <div class="input-wrapper">
                <label
                  for="exampleInputEmail1"
                  class="input-label"
                >My Pronouns</label>
                <input
                  type="text"
                  class="form-control mx-auto"
                  id="pronounInput"
                  placeholder="e.g. she/her"
                  v-model="profile.pronouns"
                />
              </div>
              <div class="input-wrapper">
                <label
                  for="exampleInputEmail1"
                  class="input-label"
                >My Email</label>
                <input
                  type="email"
                  class="form-control mx-auto"
                  id="emailInput"
                  placeholder="hello@bit.camp"
                  v-model="profile.email"
                />
              </div>
              <div class="input-wrapper">
                <label
                  for="exampleInputEmail1"
                  class="input-label"
                >LinkedIn</label>
                <input
                  type="url"
                  class="form-control mx-auto"
                  id="linkedinInput"
                  placeholder="https://www.linkedin.com/in/example-username"
                  v-model="profile.linkedin"
                />
              </div>
              <div class="input-wrapper">
                <label
                  for="exampleInputEmail1"
                  class="input-label"
                >Github</label>
                <input
                  type="url"
                  class="form-control mx-auto"
                  id="githubInput"
                  placeholder="https://github.com/example"
                  v-model="profile.github"
                />
              </div>
              <form>
                <label
                  for="exampleFormControlTextarea1"
                  class="input-label"
                >Bio</label>
                <textarea
                  id="exampleFormControlTextarea1"
                  rows="3"
                  class="form-control hacker-profile-text"
                  v-model="profile.profile_text"
                  placeholder="e.g. I'm a computer science student at the University of Maryland who loves to code!"
                ></textarea>
              </form>
            </div>
          </form>
          <div>
            <b-form-file
              v-model="file1"
              :state="Boolean(file1)"
              :placeholder="profile.resume_file_name || 'Upload Resume'"
              drop-placeholder="Drop resume here..."
              @input="upload"
            ></b-form-file>
          </div>
        </div>
        <div class="modal-half">
          <h5>3) Academics</h5>
          <form @submit.prevent="goToProfile">
            <div class="form-group">
              <div class="input-wrapper">
                <label
                  for="exampleInputEmail1"
                  class="input-label"
                >School</label>
                <input
                  type="text"
                  class="form-control mx-auto"
                  id="schoolInput"
                  placeholder="e.g. University of Maryland, College Park"
                  v-model="profile.school"
                />
              </div>
              <div class="input-wrapper">
                <label
                  for="exampleInputEmail1"
                  class="input-label"
                >GPA</label>
                <input
                  type="text"
                  class="form-control mx-auto"
                  id="gpaInput"
                  placeholder="My GPA"
                  v-model="profile.gpa"
                />
              </div>
              <div class="input-wrapper">
                <label
                  for="exampleInputEmail1"
                  class="input-label"
                >Major</label>
                <input
                  type="text"
                  class="form-control mx-auto"
                  id="majorInput"
                  placeholder="e.g. Computer Science"
                  v-model="profile.major"
                />
              </div>
              <div class="input-wrapper">
                <label
                  for="exampleInputEmail1"
                  class="input-label"
                >Year</label>
                <input
                  type="text"
                  class="form-control mx-auto"
                  id="yearInput"
                  placeholder="e.g. College Junior"
                  v-model="profile.year"
                />
              </div>
            </div>
          </form>
          <h5>4) Hack</h5>
          <form @submit.prevent="goToProfile">
            <div class="form-group">
              <div class="input-wrapper">
                <label
                  for="exampleInputEmail1"
                  class="input-label"
                >Devpost Project Link</label>
                <input
                  type="url"
                  class="form-control mx-auto"
                  id="schoolInput"
                  placeholder="https://devpost.com/software/example"
                  v-model="profile.devpost"
                />
              </div>
              <form>
                <label
                  for="exampleFormControlTextarea1"
                  class="input-label"
                >2 Sentence Description of Project</label>
                <textarea
                  id="exampleFormControlTextarea1"
                  rows="3"
                  class="form-control hacker-profile-text"
                  v-model="profile.project_description"
                  placeholder="e.g. For my Technica project, we designed a cool website."
                ></textarea>
              </form>
            </div>
          </form>
        </div>
      </div>
      <template v-slot:modal-footer>
        <Button
          @click="closeModal()"
          size="sm"
        >Save</Button>
      </template>
    </b-modal>


  </div>
</template>

<script>
import * as PDFJS from 'pdfjs-dist/legacy/build/pdf.js';
import generalMixin from '../mixins/general';
import usersMixin from '../mixins/users';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import Passport from './Passport.vue';
import 'pdfjs-dist/build/pdf.worker.entry';

export default {
  name: 'HackerProfile',
  mixins: [generalMixin, usersMixin],
  components: {
    Button,
    LoadingSpinner,
    Passport,
  },
  data() {
    return {
      currentTeam: null,
      user: null,
      profile: {},
      dataLoaded: false,
      file1: null,
      resumeLink: null,
      urlUserId: null,
    };
  },
  async mounted() {
    await this.getUser();
    this.dataLoaded = true;
    this.resumeLink = this.profile.resume_link;
  },
  methods: {
    returnToProfilesPage() {
      this.$router.push(`/profiles`);
    },
    async getUser() {
      window.scrollTo(0, 0);
      this.urlUserId = this.$route.query.id;
      const userParams = {
        id: this.urlUserId || this.getUserId(),
      };
      this.user = await this.performGetRequest(
        this.getEnvVariable('BACKEND'),
        'users',
        userParams,
      );
      if (this.user.hacker_profile) {
        this.profile = this.user.hacker_profile;
      } else if (this.urlUserId) {
        this.profile = this.user;
      } else {
        this.profile = this.user;
        await this.updateProfile();
        await this.getUser();
      }
    },
    async updateProfile() {
      const userParams = {
        id: this.getUserId(),
        hacker_profile: this.profile,
      };
      await this.performPostRequest(
        this.getEnvVariable('BACKEND'),
        'users/update',
        userParams,
      );
    },
    openModal() {
      this.$bvModal.show('editProfileModal');
    },
    closeModal() {
      this.$bvModal.hide('editProfileModal');
      this.updateProfile();
    },
    async upload(file) {
      const userParams = {
        filename: this.file1.name,
        filetype: this.file1.filetype,
      };
      const r = await this.performPostRequest(
        this.getEnvVariable('BACKEND'),
        'users/resume',
        userParams,
      );
      await this.performRawPostRequest(r.putUrl, file);
      this.profile.resume_link = r.uploadUrl;
      this.profile.resume_file_name = this.file1.name;
      this.updateProfile();
      this.resumeLink = this.profile.resume_link;

      // below is for resume parsing
      let text = '';
      const pdfVersion = '2.10.377';
      // eslint-disable-next-line no-import-assign
      PDFJS.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfVersion}/pdf.worker.js`;

      const loadingTask = PDFJS.getDocument(this.resumeLink);
      await loadingTask.promise.then((doc) => {
        const { numPages } = doc;

        let lastPromise;
        lastPromise = doc.getMetadata();

        const loadPage = async (pageNum) => {
          const page = await doc.getPage(pageNum);

          return page.getTextContent().then((content) => {
            // we only want the page text (strings)
            const strings = content.items.map((item) => item.str);
            text += strings.join(' ');
          });
        };

        for (let i = 1; i <= numPages; i += 1) {
          lastPromise = lastPromise.then(loadPage.bind(null, i));
        }
        return lastPromise;
      });

      const resumeParams = {
        user_id: this.getUserId(),
        resume_text: text,
      };
      await this.performPostRequest(
        this.getEnvVariable('BACKEND'),
        'users/resume_text',
        resumeParams,
      );
    },
    getClickableLink(link) {
      return link.startsWith('http://') || link.startsWith('https://') ? link : `http://${link}`;
    },
  },
};
</script>

<style scoped>

.card-section {
  border: 1px solid var(--color-border);
  border-right: none;
  text-align: left;
}

.card-section:first-child {
  border-left: none;
}

.logo-icon {
  text-align: left;
  height: 100px;
}

.page-container {
  width: 100vw;
  height: 100vh;
}

.member-list-item {
  width: 100%;
  border: 2px solid var(--color-border);
  box-sizing: border-box;
  box-shadow: 0px 2px 2px var(--color-shadow);
  border-radius: 4px;
  display: flex;
}

.member-list-photo {
  background: var(--color-foreground);
  border-radius: 8px;
  width: 13rem;
  height: 13rem;
  margin: 3px;
}

.member-list-info {
  margin-top: 1rem;
  margin-bottom: 2rem;
  margin-right: 1rem;
  margin-left: 0.75rem;
  border-radius: 4px;
}

.profile-header {
  height: 40%;
  width: 100%;
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.profile-footer {
  width: 100%;
  display: flex;
  justify-content: space-around;
  margin-bottom: 5rem;
}

.profile-header-title {
  width: fit-content;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.profile-header-name,
.profile-header-name a {
  text-align: left;
  color: var(--color-dark-text);
}

.profile-footer-box {
  background: var(--color-foreground);
  padding: 1rem 1.5rem;
  border: 2px solid var(--color-border);
  box-sizing: border-box;
  border-radius: 8px;
  flex: 0 0 30%;
}

.profile-footer-box-title {
  font-style: normal;
  font-weight: bold;
  font-size: 24px;
  margin-top: 1rem;
}

.profile-bottom {
  display: flex;
  justify-content: flex-start;
  padding: 1rem;
}

.modal-body {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  overflow-y: auto;
}

.modal-half {
  width: 50%;
  height: 60vh;
  padding: 1rem;
}

.form-control {
  margin-bottom: 0.5rem;
}

.input-label {
  margin-bottom: 0;
  font-style: normal;
  font-weight: normal;
  font-size: 16px;
}

.input-wrapper {
  text-align: left;
}

@media (max-width: 1200px) {
  .display-container {
    width: 90vw;
  }

  .modal-half {
    height: 80vh;
  }
}

@media (max-width: 1500px) {
  .profile-footer-box {
    min-height: 130%;
  }
}
</style>
