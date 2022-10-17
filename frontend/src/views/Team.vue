<template>
  <div class="page">
  <b-card-group deck>
    <b-card class="team">
      <div v-if="dataLoaded">
        <h3 class="page-header">My Team</h3>
        <b-container>
          <b-row
            align-h="center"
            class="mt-0"
          >
            <b-col cols="12">
              <p>
                Looking for teammates to collaborate with on your hack? Head over to our <router-link :to="'/schedule?event=' + teamFormationEventId">team formation event</router-link>.
              </p>
              <p>Once you know who your teammates are, use this page to create your team in the Technica system! You can then do things like submit your project or request a mentor as a team.</p>
              <p>
                <strong>You still need to create a team, even if you are a hacker working alone.</strong>
              </p>
            </b-col>
          </b-row>

          <div
            v-if="!currentTeam && !teamCreationLoading"
            class="create-team-container"
          > 
            <Button
              @click="createTeam()"
              class="create-team-button"
            >
              Create Team
            </Button>
          </div>
          <div v-if="teamCreationLoading">
            <LoadingSpinner />
          </div>
          <div
            v-else
            class="team-section"
          >
            <b-row
              v-if="currentTeam"
              align-h="center"
              class="team-list-container mt-4"
            >
              <b-card class="w-100 mb-5">
                <div class="d-flex flex-column align-items-center justify-content-center mb-5 mt-3">
                  <template v-if="teamMembers.length < 4">
                    <p>To add new members to your team, send them the <strong>custom invite link</strong> below:</p>
                    <b-input-group class="col-15">
                      <b-input
                        readonly
                        :value=magicInviteLink
                        class="flex-0"
                        v-model="magicInviteLink"
                        @click="handleLinkInputClick"
                      />
                      <b-input-group-append>
                        <Button
                          v-clipboard:copy="magicInviteLink"
                          v-clipboard:success="showLinkToast"
                          size="sm"
                          class="copy-button"
                        >
                          <img
                            class="btn-icon btn-icon-left"
                            src="../assets/copy-icon.svg"
                          >
                          Copy Invite Link
                        </Button>

                        <b-toast
                          id="linkCopyToast"
                          auto-hide-delay="2000"
                          variant="success"
                          no-close-button
                        >
                          Copied team invite link!
                        </b-toast>
                      </b-input-group-append>
                    </b-input-group>
                  </template>
                  <p
                    class="m-0"
                    v-else
                  >
                    You have reached the maximum team size and cannot invite additional
                    members.
                  </p>
                </div>
                <b-table
                  outlined
                  head-variant="light"
                  responsive
                  :items="teamMembers"
                />

                <Button
                  @click="leaveTeam()"
                  class="create-team-button mt-3"
                  outlined
                >
                  Leave Team
                </Button>

              </b-card>

            </b-row>
          </div>
        </b-container>
      </div>
      <div v-else>
        <LoadingSpinner />
      </div>
    </b-card>
    <b-card>
      <div class="container mx-auto">
        <div v-if="dataLoaded && hasTeam">
          <h3 class="page-header">{{currentTeam.name}}</h3>
          <div
            v-if="projectHasAlreadyBeenSubmitted || !readyButtonClicked"
            class="row"
          >
            <div class="col-md-1"></div>
            <div class="col-md-10">
              <p>
                If you are ready to submit your Technica Hack, please click on the button below! <b>Only one hacker needs to submit per team.</b>
              </p>
              <p>
                If the button is grayed out, another member of your team has already submitted your project!
              </p>
              <Button
                @click="clickReadyButton"
                :disabled="this.readyButtonDisabled"
              >
                {{this.readyButtonText}}
              </Button>
            </div>
          </div>

          <div v-else>
            <p>In order to submit your project and get credit for your hack, you'll need to complete a few steps. First, submit your hack on Devpost, then submit your hack using the fields below. Click "Submit My Project" when you're done. <b>If you need to edit your submission after submitting, please reach out to the Technica organizing team.</b></p>
          </div>
        </div>
        <div
          v-if="dataLoaded && !hasTeam"
          class="display-container"
          style="flex-direction: column; justify-content: center;"
        >
          <h3 class="page-header">Submit Hack</h3>
          <div style="margin-bottom: 1rem;">You must create or join a team in order to submit your project, even if you are a hacker working alone.</div>
        </div>
        <LoadingSpinner v-if="!dataLoaded" />
        <b-modal
          id="projectSubmissionModal"
          title="Congratulations!"
          size="lg"
          centered
        >
          <p>Great work! We've received your project submission.</p>
          <p>If you have any questions, don't hesitate to reach out to the Technica organizing team.</p>
          <template v-slot:modal-footer>
            <Button
              @click="closeModal()"
              size="sm"
            >Close</Button>
          </template>
        </b-modal>
      </div>
      
      <div v-if="dataLoaded && hasTeam && !projectHasAlreadyBeenSubmitted && readyButtonClicked">

          <h4 style="margin-top: 0.4rem;">I have...</h4>
          <div class="content-container row-xl-6">
            <div class="checklist-body">
              <div
                v-for="checklistItem in checklistItems"
                :key="checklistItem.title"
                class="checklist-item-update"
              >
                <checklist-item-update
                  :isChecked="checklistItem.checked"
                  :id="checklistItem.id"
                  @click="toggleCheckboxChecked"
                >
                  <template v-slot:text>
                    {{ checklistItem.title }} <a
                      :href="checklistItem.link"
                      target="_blank"
                    >{{ checklistItem.linkText }}</a>
                  </template>
                </checklist-item-update>
              </div>
            </div>
            <div>
              <form @submit.prevent="sendMagicLink">
                <div class="form-group mx-auto">
                  <input
                    type="text"
                    class="form-control col-xl-4 mx-auto project-form-input"
                    id="nameInput"
                    placeholder="Devpost Project Name"
                    v-model="devProjectName"
                  >
                  <input
                    type="text"
                    class="form-control col-xl-4 mx-auto project-form-input"
                    id="linkInput"
                    placeholder="Devpost Link"
                    v-model="devLink"
                  >
                  <!-- Prize categories will be implemented in a future ticket -->
                  <!-- <input type="text" class="form-control col-xl-4 mx-auto project-form-input" id="emailInput" placeholder="Prize Categories" v-model="teamName"> -->
                </div>
              </form>
            </div>
          </div>
          <Button
            :disabled="checklistDisabled"
            @click="clickSubmitButton"
          >
            Submit My Project
          </Button>
      </div>
    </b-card>
  </b-card-group>
    <EasterEgg
      :index=4
      :hint="'You’re too good at this! Submit your project here whenever you’ve completed it. You’ve completed the Technica 2021 Scavenger Hunt!'"
      :fileName="'scavenger-hunt/5.png'"
      class="mt-5"
    />
  </div>
</template>

<script>
import Vue from 'vue';
import VueClipboard from 'vue-clipboard2';
import Button from '@/components/Button.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import ZoomButton from '@/components/ZoomButton';
import ChecklistItemUpdate from '@/components/ChecklistItemUpdate.vue';
import EasterEgg from '@/components/EasterEgg.vue';
import generalMixin from '../mixins/general';

Vue.use(VueClipboard);

export default {
  name: 'Team',
  components: {
    Button,
    LoadingSpinner,
    ZoomButton,
    ChecklistItemUpdate,
    EasterEgg,
  },
  mixins: [generalMixin],
  data() {
    return {
      hasTeam: false,
      teamName: '',
      invites: [],
      invitesToCurrentTeam: [],
      inviteEmail: '',
      currentTeam: null,
      dataLoaded: false,
      teamCreationLoading: false,
      continuePolling: true,
      projectHasAlreadyBeenSubmitted: false,
      readyButtonClicked: false,
      readyButtonText: "I'm Ready to Submit!",
      readyButtonDisabled: false,
      checklistItems: [
        {
          title: 'completed my project and am ready to submit',
          link: '',
          linkText: '',
        },
        {
          title: 'submitted my hack on Devpost:',
          link: this.getEnvVariable('DEVPOST_LINK'),
          linkText: 'Technica Devpost',
        },
        {
          title: 'submitted my hack to Technica below:',
          link: '',
        },
      ],
      devLink: '',
      devProjectName: '',
      currentTeamId: null,
      checklistCounter: 0,
    };
  },
  async mounted() {
    await Promise.all([
      this.activityTracking('TEAMS'),
      this.getTeam(),
    ]);

    this.dataLoaded = true;
  },
  computed: {
    teamFormationEventId() {
      return this.getEnvVariable('eventIds').teamFormation;
    },
    teamMembers() {
      // Only return relevant information to the table
      return this.currentTeam.members.map((member) => ({
        full_name: member.full_name,
        email: member.email,
        school: member.school,
      }));
    },
    magicInviteLink() {
      return `${document.location.origin}/join-team/${this.currentTeam.id}`;
    },
    privateVideoLink() {
      return `https://video-app-0821-9375-dev.twil.io?teamId=${this.currentTeam.id}&userName=${this.getUserName()}&passcode=26223308219375`;
    },
    checklistDisabled() {
      return (this.devLink === '' || this.devProjectName === '') || this.checklistCounter !== this.checklistItems.length;
    },
  },
  methods: {
    closeModal() {
      this.$bvModal.hide('projectSubmissionModal');
    },
    async createTeam() {
      this.teamCreationLoading = true;
      const createdTeam = await this.performPostRequest(
        this.getEnvVariable("BACKEND"),
        "teams/create",
        {},
      );
      // await this.activityTracking('TEAM_CREATION');
      // after creating the new team, join it
      const joinTeamPostParams = {
        team_id: createdTeam.id,
        user_id: this.getUserId(),
      };
      await this.performPostRequest(
        this.getEnvVariable('BACKEND'),
        'teams/join',
        joinTeamPostParams,
      );
      await this.getTeam();
      this.$emit('teamMembershipChanged', true);
      this.teamName = '';
      // create checklist items for the team
      await this.createChecklist();
      this.teamCreationLoading = false;
    },
    async createChecklist() {
      this.checklistItems.forEach(async (item) => {
        const createChecklistPostParams = {
          team_id: this.currentTeam.id,
          checklist_item_id: item.title,
        };
        await this.performPostRequest(
          this.getEnvVariable('BACKEND'),
          'projects/submission/checklist',
          createChecklistPostParams,
        );
      });
    },
    async getTeam() {
      const teamParams = {
        user_id: this.getUserId(),
      };
      const team = await this.performGetRequest(
        this.getEnvVariable('BACKEND'),
        'teams/membership',
        teamParams,
      );

      if (team.team) {
        const params = {
          team_id: team.team,
        };
        const teamMembers = await this.performGetRequest(
          this.getEnvVariable('BACKEND'),
          'teams/members',
          params,
        );

        this.currentTeam = {};
        this.currentTeam.members = teamMembers.sort();
        this.currentTeam.name = '';
        this.currentTeam.id = team.team;
        this.$emit('teamMembershipChanged', true);

        this.hasTeam = true;

        // check submission status of project
        const status = await this.performGetRequest(this.getEnvVariable('BACKEND'), 'teams/submission', params);

        this.projectHasAlreadyBeenSubmitted = status.project_submitted;
        if (this.projectHasAlreadyBeenSubmitted) {
          this.readyButtonText = 'Project has been submitted';
          this.readyButtonDisabled = true;
        }

        const checklist = await this.performGetRequest(this.getEnvVariable('BACKEND'), 'projects/submission/checklist', params);

        // console.log(checklist);

        Object.values(checklist).forEach((k) => {
          const item = this.checklistItems.find((j) => k.checklist_item_id === j.title);

          if (item) {
            item.id = k.id;
            item.checked = k.is_checked;
            if (item.checked) {
              this.readyButtonClicked = true;
              this.checklistCounter += 1;
            }
          }
        });
        this.currentTeamId = team.team;
      }
    },
    async leaveTeam() {
      this.dataLoaded = false;

      const teamParams = {
        user_id: this.getUserId(),
      };
      const team = await this.performGetRequest(
        this.getEnvVariable('BACKEND'),
        'teams/membership',
        teamParams,
      );

      if (team.team) {
        const params = {
          user_id: this.getUserId(),
          team_id: team.team,
        };

        await this.performPostRequest(this.getEnvVariable('BACKEND'), 'teams/leave', params,);
        this.currentTeam = null;
        this.teamName = '';
        this.hasTeam = false;
        this.invites = [];
        this.invitesToCurrentTeam = [];
        this.inviteEmail = '';
        this.$emit('teamMembershipChanged', false);
        this.dataLoaded = true;
      }
    },
    /**
     * Shows a new alert
     */
    showLinkToast() {
      this.$bvToast.show('linkCopyToast');
    },
    /**
     * Select the entire input value on click
     */
    handleLinkInputClick(event) {
      // See this stackoverflow post:
      // https://stackoverflow.com/questions/4067469/selecting-all-text-in-html-text-input-when-clicked
      const input = event.currentTarget;
      input.setSelectionRange(0, input.value.length);
    },
    async clickSubmitButton() {
      this.dataLoaded = false;
      
      const params = {
        team_id: this.currentTeamId,
        project_submitted: true,
        devpost_project_name: this.devLink,
        devpost_link: this.devProjectName.toLowerCase().replace(/\s/g,''),
      };
      await this.performPostRequest(this.getEnvVariable('BACKEND'), 'teams/submission', params);
      await this.getTeam();
      this.dataLoaded = true;
      this.$bvModal.show('projectSubmissionModal');
    },
    clickReadyButton() {
      this.readyButtonClicked = true;
    },
    toggleCheckboxChecked(id) {
      const item = this.checklistItems.find((j) => id === j.id);
      item.checked = !item.checked;
      if (item.checked) {
        this.checklistCounter += 1;
      } else {
        this.checklistCounter -= 1;
      }
    },
  },
};
</script>

<style scoped>
.page {
  box-sizing: border-box;
  width: 100%;
  padding: 2rem 4rem;
  /* display: grid; */
  gap: 2rem;
  grid-template-rows: 440px 440px;
  grid-template-areas:
    "team project"
    "team other";
  place-items: stretch;
}

.page-header {
  margin: 1rem;
}

.team {
  grid-area: team;
  min-height: 0;
}

.copy-button {
  z-index: 0;
  margin: 0;
}

.create-team-container {
  display: inline-block;
}

div ::v-deep #linkCopyToast {
  margin-top: 75px;
}

.filler {
  cursor: text !important;
}

.content-container {
  padding: 1rem 0;
  text-align: center;
}

.checklist-item-update {
  float: left;
}

.checklist-body {
  width: 100%;
  display: inline-block;
  text-align: left;
}
</style>
