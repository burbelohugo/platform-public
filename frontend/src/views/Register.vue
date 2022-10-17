<template>
  <div class="page-container">
    <div class="register-container">
      <content-container v-if="displayWelcomeScreen">
        <template v-slot:title>
          <h3>Welcome!</h3>
        </template>
        <template v-slot:progress>
          <ProgressCircles v-bind:full="0" v-bind:half="0" v-bind:empty="6" />
        </template>
        <template v-slot:body>
          <p class="description-text">
            Welcome to Technica! To set up your account, you'll have to go through a few steps:
          </p>
          <ol class="step-list">
            <li>Update your information</li>
            <li>Sign the event waiver</li>
            <li>Learn more about you</li>
            <li>Create a hacker profile (optional)</li>
            <li>Set up your Slack account</li>
          </ol>
          <p class="description-text">Ready to get hacking? Click "Get Started" to begin!</p>
          <Button @click="getStarted()">Get Started</Button>
        </template>
      </content-container>

      <content-container v-if="displayProfileInfoScreen">
        <template v-slot:title>
          <h3>Register</h3>
        </template>
        <template v-slot:progress>
          <ProgressCircles v-bind:full="0" v-bind:half="1" v-bind:empty="5" />
        </template>
        <template v-slot:body>
          <h5>A Little About You</h5>
          <form @submit.prevent="goToProfile">
            <div class="form-group">
              <div class="input-wrapper">
                <label for="exampleInputEmail1" class="input-label">My Name<sup>*</sup></label>
                <input
                  type="text"
                  class="form-control mx-auto"
                  id="nameInput"
                  placeholder="Grace Hopper"
                  v-model.lazy="name"
                />
              </div>
              <div class="input-wrapper">
                <label for="exampleInputEmail1" class="input-label">My Pronouns<sup>*</sup></label>
                <input
                  type="text"
                  class="form-control mx-auto"
                  id="pronounInput"
                  placeholder="e.g. she/her"
                  v-model.lazy="pronouns"
                />
              </div>
              <div class="input-wrapper">
                <label for="exampleInputEmail1" class="input-label">My Email<sup>*</sup></label>
                <input
                  type="email"
                  class="form-control mx-auto"
                  id="emailInput"
                  placeholder="hello@gotechnica.org"
                  v-model.lazy="email"
                />
              </div>
              <div class="input-wrapper">
                <label for="exampleInputEmail1" class="input-label">
                  My Phone Number<sup>*</sup>
                </label>
                <input
                  type="phone"
                  class="form-control mx-auto"
                  id="phoneInput"
                  placeholder="(XXX) XXX - XXXX"
                  v-model.lazy="phone"
                />
              </div>
              <div class="input-wrapper">
                <label for="exampleInputEmail1" class="input-label">
                  My School/Organization<sup>*</sup>
                </label>
                <input
                  type="text"
                  class="form-control mx-auto"
                  id="schoolInput"
                  placeholder="e.g. University of Maryland, College Park"
                  v-model.lazy="school"
                />
              </div>
            </div>
          </form>
          <p v-if="displayIncompleteInfoMessage" class="text-error">
            Please fill out all profile fields.
          </p>
          <p v-if="emailIsInvalid" class="text-error">Please enter a valid email address.</p>
          <Button @click="goToProfile()">Next</Button>
        </template>
      </content-container>

      <content-container v-if="displayAgeConfirmationScreen">
        <template v-slot:title>
          <h3>Register</h3>
        </template>
        <template v-slot:progress>
          <ProgressCircles v-bind:full="1" v-bind:half="1" v-bind:empty="4" />
        </template>
        <template v-slot:body>
          <span v-if="!participantSignedWaiver">
            <h5>Confirm Your Age</h5>
            <p class="description-text">
              We need to confirm your age before you can fill out the rest of your profile.
            </p>
            <Button
              @click="handleAgeSpecificationClick(false)"
              :pinkStyle="true"
              style="margin-right: 1rem"
              >I'm 18 or Over</Button
            >
            <Button @click="handleAgeSpecificationClick(true)">I'm Under 18</Button>
          </span>
          <span v-else>
            <h5>Sign the Event Waiver</h5>
            <p class="description-text">Great job! You've already signed the waiver.</p>
            <Button @click="proceedToDataCollectionScreen()">Continue</Button>
          </span>
        </template>
      </content-container>

      <content-container v-if="displayWaiverScreen" style="max-height: 90vh">
        <template v-slot:title>
          <h3>Register</h3>
        </template>
        <template v-slot:progress>
          <ProgressCircles v-bind:full="1" v-bind:half="1" v-bind:empty="4" />
        </template>
        <template v-slot:body>
          <h5>Sign the Event Waiver</h5>
          <p class="description-text">
            The safety and happiness of our attendees is our #1 priority, and it's vital that
            everyone adheres to our online code of conduct and waiver during the event. Please make
            sure you've signed the online waiver before proceeding.
          </p>
          <Button @click="viewWaiverFile" class="m-5">
            <img class="btn-icon btn-icon-left" src="../assets/document-icon.svg" alt="link" />
            View the Online Waiver
          </Button>
          <div v-if="participantIsMinor">
            <div class="form-group" style="display: flex; justify-content: center">
              <div class="input-wrapper" style="width: 70%">
                <label for="legalNameInput" class="input-label">
                  Name of Parent/Guardian<sup>*</sup>
                </label>
                <input
                  type="text"
                  class="form-control"
                  id="legalNameInput"
                  placeholder="e.g. Jane Smith"
                  v-model.lazy="parentName"
                />
                <label for="legalNameInput" class="input-label">
                  Emergency Contact Information: Name & Relationship<sup>*</sup>
                </label>
                <input
                  type="text"
                  class="form-control"
                  id="legalNameInput"
                  placeholder="e.g. Jane Smith, My Mother"
                  v-model.lazy="emergencyContact"
                />
                <label for="legalNameInput" class="input-label">
                  Emergency Contact Phone Number<sup>*</sup>
                </label>
                <input
                  type="text"
                  class="form-control"
                  id="legalNameInput"
                  placeholder="(XXX) XXX - XXXX"
                  v-model.lazy="emergencyContactPhone"
                />
                <label for="currentDateInput" class="input-label">Today's Date<sup>*</sup></label>
                <input
                  type="text"
                  class="form-control"
                  id="currentDateInput"
                  v-model.lazy="currentDate"
                />
              </div>
            </div>
          </div>
          <div v-else>
            <div class="form-group" style="display: flex; justify-content: center">
              <div class="input-wrapper" style="width: 70%">
                <label for="legalNameInput" class="input-label">My Legal Name<sup>*</sup></label>
                <input
                  type="text"
                  class="form-control"
                  id="legalNameInput"
                  placeholder="Grace Hopper"
                  v-model.lazy="legalName"
                />
                <label for="currentDateInput" class="input-label">Today's Date<sup>*</sup></label>
                <input
                  type="text"
                  class="form-control"
                  id="currentDateInput"
                  v-model.lazy="currentDate"
                />
              </div>
            </div>
          </div>
          <Button
            :disabled="!didViewWaiver"
            @click="proceedToDataCollectionScreen()"
            id="waiverBtn"
          >
            I Accept
          </Button>
        </template>
      </content-container>

      <content-container v-if="displayDataCollectionScreen" style="max-height: 90vh">
        <template v-slot:title>
          <h3>Register</h3>
        </template>
        <template v-slot:progress>
          <ProgressCircles v-bind:full="2" v-bind:half="1" v-bind:empty="3" />
        </template>
        <template v-slot:body>
          <h5>More About You</h5>
          <p class="description-text">
            We want to make sure Technica is accomplishing its goal of encouraging diversity in the
            tech industry.
          </p>
          <form>
            <div class="form-group">
              <div class="input-wrapper">
                <label for="exampleInputEmail1" class="input-label">
                  Are there any accommodations, accessibility related or otherwise, that Technica
                  can provide you with?<sup>*</sup>
                </label>
                <textarea
                  id="accommodationsInput"
                  rows="4"
                  class="form-control hacker-profile-text"
                  v-model.lazy="accommodations"
                ></textarea>
              </div>
              <div class="input-wrapper">
                <label for="exampleInputEmail1" class="input-label">
                  Ethnicity you identify with<sup>*</sup>
                </label>
                <input
                  type="text"
                  class="form-control mx-auto"
                  id="ethnicityInput"
                  v-model.lazy="ethnicity"
                />
              </div>
              <div class="input-wrapper">
                <label for="exampleInputEmail1" class="input-label">
                  Race you identify with<sup>*</sup>
                </label>
                <input
                  type="text"
                  class="form-control mx-auto"
                  id="raceInput"
                  v-model.lazy="race"
                />
              </div>
              <div class="input-wrapper">
                <label for="exampleInputEmail1" class="input-label">
                  Gender Identity you most closely identify with<sup>*</sup> <a href="https://lgbt.uni.edu/gender-identities" target="_blank" class="ml-2">If you're not sure what to select, take a look here!</a>
                </label>
                <select
                  type="select"
                  class="form-control mx-auto"
                  id="genderInput"
                  v-model.lazy="gender"
                >
                  <option v-for="gen in genders" :key="gen">{{gen}}</option>
                </select>
              </div>
              <div class="input-wrapper" v-if="gender=='Other Gender Not Listed Above (Other)'">
                <label for="exampleInputEmail1" class="input-label">
                  Let us know what gender(s) you identify with!<sup>*</sup>
                </label>
                <input
                  type="text"
                  class="form-control mx-auto"
                  id="otherGenderInput"
                  v-model.lazy="gender"
                />
              </div>
            </div>
          </form>
          <p v-if="displayIncompleteInfoMessage" class="text-error">Please fill out all fields.</p>
          <Button @click="proceedToHackerProfileDescriptionScreen()">Next</Button>
        </template>
      </content-container>

      <content-container v-if="displayHackerProfileDescriptionScreen">
        <template v-slot:title>
          <h3>Register</h3>
        </template>
        <template v-slot:progress>
          <ProgressCircles v-bind:full="3" v-bind:half="1" v-bind:empty="2" />
        </template>
        <template v-slot:body>
          <h5>Your Hacker Profile</h5>
          <p class="description-text">
            Your hacker profile is an optional way for you to share more information about
            yourselves with the event sponsors. Describe yourself in 1-2 sentences:
          </p>
          <form>
            <textarea
              id="exampleFormControlTextarea1"
              rows="4"
              class="form-control hacker-profile-text"
              v-model.lazy="profile_text"
              placeholder="E.g. I'm a computer science student at the University of Maryland who loves to code!"
            ></textarea>
          </form>
          <div>
            <b-form-file
              v-model="file1"
              :state="Boolean(file1)"
              :placeholder="profile.resume_file_name || 'Upload your Resume for sponsors to see!'"
              drop-placeholder="Drop resume here..."
              @input="upload"
              class="mb-3"
            ></b-form-file>
          </div>
          <Button @click="proceedToSlackStep()">Next</Button>
        </template>
      </content-container>

      <content-container v-if="displaySlackSetupScreen">
        <template v-slot:title>
          <h3>Register</h3>
        </template>
        <template v-slot:progress>
          <ProgressCircles v-bind:full="4" v-bind:half="1" v-bind:empty="1" />
        </template>
        <template v-slot:body>
          <h5>Set Up Your Slack Account</h5>
          <p class="description-text">
            We'll be using Slack to share announcements, chat with other hackers, and more! Click
            the link below to register for our slack workspace, and come back once you're finished.
          </p>
          <Button v-if="!slackLinkButtonClicked" @click="joinSlack()" outlined>Join Slack</Button>
          <Button v-else @click="goToSlackConfirmationScreen()">I've Joined Slack</Button>
        </template>
      </content-container>

      <content-container v-if="displaySlackConfirmationScreen">
        <template v-slot:title>
          <h3>Register</h3>
        </template>
        <template v-slot:progress>
          <ProgressCircles v-bind:full="5" v-bind:half="1" v-bind:empty="0" />
        </template>
        <template v-slot:body>
          <h5>Confirm Your Slack Account Email</h5>
          <p class="description-text">
            Please confirm the email you just used to sign in to the Technica Slack workspace.
          </p>
          <input
            type="email"
            class="form-control mx-auto shortened-input"
            id="slackEmailInput"
            placeholder="e.g. hello@gotechnica.org"
            v-model.lazy="slackEmail"
          />
          <Button @click="goHome()">Done</Button>
        </template>
      </content-container>
    </div>
  </div>
</template>

<script>
import * as PDFJS from 'pdfjs-dist/legacy/build/pdf.js';
import 'pdfjs-dist/build/pdf.worker.entry';
import Button from "@/components/Button.vue";
import ContentContainer from "@/components/ContentContainer.vue";
import ProgressCircles from "@/components/ProgressCircles.vue";
import generalMixin from "../mixins/general";

export default {
  name: "Register",
  components: {
    Button,
    ContentContainer,
    ProgressCircles,
  },
  mixins: [generalMixin],
  data() {
    return {
      displayWelcomeScreen: true,
      displayProfileInfoScreen: false,
      displayEnrollmentVerificationScreen: false,
      displayHackerProfileDescriptionScreen: false,
      displaySlackSetupScreen: false,
      displayWaiverScreen: false,
      displayDataCollectionScreen: false,
      displaySlackConfirmationScreen: false,
      displayAgeConfirmationScreen: false,
      displayIncompleteInfoMessage: false,
      emailIsInvalid: false,
      genders: [
        "Cisgender Male (Born Male, still identify as Male)",
        "Cisgender Female (Born Female, still identify as Female)",
        "Transgender Male",
        "Transgender Female",
        "Non-binary",
        "Agender",
        "Other Gender Not Listed Above (Other)",
      ],
      name: "",
      email: "",
      school: "",
      phone: "",
      pronouns: "",
      profile_text: "",
      slackEmail: "",
      legalName: "",
      currentDate: "",
      parentName: "",
      emergencyContact: "",
      emergencyContactPhone: "",
      accommodations: "",
      ethnicity: "",
      race: "",
      gender: "",
      slackLinkButtonClicked: false,
      docusignLinkButtonClicked: false,
      enrollmentVerificationFileUpload: null,
      didViewWaiver: false,
      currRegistrationStep: 0,
      totalRegistrationStep: 6,
      profile: null,
      data: null,
      participantIsMinor: true,
      participantSignedWaiver: false,
      resume_link: "",
      resumeLink: null,
      file1: null,
    };
  },
  async mounted() {
    await this.getUser();
  },
  methods: {
    getStarted() {
      this.displayWelcomeScreen = false;
      this.displayProfileInfoScreen = true;
    },
    proceedToSlackStep() {
      this.displayHackerProfileDescriptionScreen = false;
      this.displaySlackSetupScreen = true;
    },
    proceedToHackerProfileDescriptionScreen() {
      if (this.moreInformationCompleted) {
        const data = {
          id: this.getUserId(),
          accommodations: this.accommodations,
          ethnicity: this.ethnicity,
          race: this.race,
          gender: this.gender,
        };
        this.data = data;
        const postParams = {
          hacker_data: data,
          ...data,
        };
        this.performPostRequest(this.getEnvVariable("BACKEND"), "users/update", postParams);

        // console.log(this.gender, "Cisgender Male (Born Male, still identify as Male)")
        if (this.gender.trim() === "Cisgender Male (Born Male, still identify as Male)".trim() && 
            this.getUserGroup() === "hacker") {
          this.setCisgenderMaleCookie();
          this.$router.push('/Loading');
        } else {
          this.displayDataCollectionScreen = false;
          this.displayIncompleteInfoMessage = false;
          this.displayHackerProfileDescriptionScreen = true;
        }
      } else {
        this.displayIncompleteInfoMessage = true;
      }
    },
    proceedToDataCollectionScreen() {
      this.displayWaiverScreen = false;
      this.displayAgeConfirmationScreen = false;
      this.displayDataCollectionScreen = true;
      this.displayIncompleteInfoMessage = false;
    },
    proceedToWaiverScreen() {
      this.displayEnrollmentVerificationScreen = false;
      this.displayAgeConfirmationScreen = true;
    },
    handleAgeSpecificationClick(participantIsMinor) {
      this.participantIsMinor = participantIsMinor;
      this.displayAgeConfirmationScreen = false;
      this.displayWaiverScreen = true;
    },
    viewWaiverFile() {
      if(this.participantIsMinor){
        window.open(this.getEnvVariable("MINOR_WAIVER_LINK"), "_blank");
      } else {
        window.open(this.getEnvVariable("WAIVER_LINK"), "_blank");
      }
      this.didViewWaiver = true;
    },
    goToProfile() {
      if (this.profileInformationCompleted && this.emailAddressIsValid) {
        const profile = {
          id: this.getUserId(),
          email: this.email,
          pronouns: this.pronouns,
          full_name: this.name,
          school: this.school,
          phone: this.phone,
          resume_link: this.resume_link,
        };
        this.profile = profile;
        const postParams = {
          hacker_profile: profile,
          ...profile,
        };
        this.performPostRequest(this.getEnvVariable("BACKEND"), "users/update", postParams);
        this.displayAgeConfirmationScreen = true;
        this.displayProfileInfoScreen = false;
        this.setUserNameCookie(this.name.split(" ")[0]);
        this.legalName = this.name;
        this.currentDate = this.formatCurrentDate(new Date());
      } else if (!this.profileInformationCompleted) {
        this.displayIncompleteInfoMessage = true;
        this.emailIsInvalid = false;
      } else {
        this.emailIsInvalid = true;
        this.displayIncompleteInfoMessage = false;
      }
    },
    goHome() {
      if (this.slackEmail !== "") {
        this.setUserSlackId(this.slackEmail);
      }
      this.setRegisteredCookie();
      this.$router.push("/");
      const newHackerProfile = this.profile;
      newHackerProfile.profile_text = this.profile_text;
      const postParams = {
        id: this.getUserId(),
        profile_text: this.profile_text,
        registration_status: "registered",
        hacker_profile: newHackerProfile,
        legalName: this.legalName,
        currentDate: this.currentDate,
        parentName: this.parentName,
        emergencyContact: this.emergencyContact,
        emergencyContactPhone: this.emergencyContactPhone,
        participantIsMinor: this.participantIsMinor,
      };
      this.performPostRequest(this.getEnvVariable("BACKEND"), "users/update", postParams);
    },
    joinSlack() {
      window.open(this.getEnvVariable("SLACK_INVITE_LINK"), "_blank");
      this.slackLinkButtonClicked = true;
    },
    signWaiver() {
      window.open(this.getEnvVariable("DOCUSIGN_WAIVER_LINK"), "_blank");
      this.docusignLinkButtonClicked = true;
    },
    goToSlackConfirmationScreen() {
      if (this.emailFoundForSlack) {
        this.goHome();
      } else {
        this.displaySlackSetupScreen = false;
        this.displaySlackConfirmationScreen = true;
      }
    },
    async initiateSlackPolling() {
      let result = false;
      while (!result && this.displaySlackSetupScreen) {
        // eslint-disable-next-line no-await-in-loop
        result = await this.setUserSlackId(this.email);
        // eslint-disable-next-line no-await-in-loop
        await this.sleep(500);
      }
      if (result) {
        this.emailFoundForSlack = true;
      }
    },
    async getUser() {
      const userParams = {
        id: this.getUserId(),
      };
      const user = await this.performGetRequest(
        this.getEnvVariable("BACKEND"),
        "users",
        userParams
      );
      if (user) {
        if (user.full_name) {
          this.name = user.full_name;
        }
        if (user.pronouns) {
          this.pronouns = user.pronouns;
        }
        if (user.email) {
          this.email = user.email;
        }
        if (user.phone) {
          this.phone = user.phone;
        }
        if (user.school) {
          this.school = user.school;
        }
        if (user.profile_text) {
          this.profile_text = user.profile_text;
        }
        if (user.signed_waiver) {
          this.participantSignedWaiver = user.signed_waiver;
        }
        if (user.resume_link) {
          this.resume_link = user.resume_link;
        }
        if (user.accommodations) {
          this.accommodations = user.accommodations;
        }
        if (user.ethnicity) {
          this.ethnicity = user.ethnicity;
        }
        if (user.race) {
          this.race = user.race;
        }
      }
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
      this.resumeLink = r.uploadUrl;
      // this.updateProfile();
      const postParams = {
        id: this.getUserId(),
        profile: {resume_link:r.uploadUrl, resume_file_name: this.file1.name},
      }
      this.performPostRequest(this.getEnvVariable("BACKEND"), "users/update", postParams);

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
  },
  computed: {
    profileInformationCompleted() {
      return (
        this.email !== "" &&
        this.pronouns !== "" &&
        this.full_name !== "" &&
        this.school !== "" &&
        this.phone !== ""
      );
    },
    emailAddressIsValid() {
      return this.email !== "" && this.email.includes("@") && this.email.includes(".");
    },
    moreInformationCompleted() {
      return (
        this.accommodations !== "" &&
        this.ethnicity !== "" &&
        this.race !== "" &&
        this.gender !== ""
      );
    },
  },
};
</script>

<style scoped>
.page-container {
  backdrop-filter: blur(40px);
  width: 100vw;
  height: 100vh;
}

.register-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 90%;
}

.text-error {
  color: var(--color-error);
}

.step-list {
  text-align: left;
  padding-left: 8rem;
}

.form-control {
  margin-bottom: 0.5rem;
}

.form-control::placeholder {
  color: var(--color-muted-text);
}

.input-label {
  margin-bottom: 0;
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
}

.input-wrapper {
  text-align: left;
}

.hacker-profile-text {
  margin-bottom: 1rem;
}

.enrollment-verification-form-wrapper {
  padding-left: 20%;
  padding-right: 20%;
  margin-bottom: 1rem;
}

.shortened-input {
  width: 70%;
}

@media (max-width: 1500px) {
  .enrollment-verification-form-wrapper {
    padding-left: 10%;
    padding-right: 10%;
  }
}
</style>
