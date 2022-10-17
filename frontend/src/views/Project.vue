<template>
  <div>
    <h2 class="page-header">My Project</h2>
    <EasterEgg
      :index=4
      :hint="'You’re too good at this! Submit your project here whenever you’ve completed it. You’ve completed the Technica 2021 Scavenger Hunt!'"
      :fileName="'scavenger-hunt/5.png'"
    />
    <div class="container mx-auto">
      <div v-if="dataLoaded && hasTeam">
        <div
          v-if="projectHasAlreadyBeenSubmitted || !readyButtonClicked"
          class="row"
        >
          <div class="col-md-1"></div>
          <div class="col-md-10">
            <div
              class="card"
              style="margin-bottom: 2rem;"
            >
              <div class="card-body">
                <p>
                  If you are ready to submit your Technica Hack, please click on the button below! <b>Only one hacker needs to submit per team.</b>
                </p>
                <p>
                  If the button is grayed out, another member of your team has already submitted your project!
                </p>
              </div>
            </div>
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
          <h4>I have...</h4>
          <div class="content-container row-xl-6">
            <div class="checklist-body">
              <div
                v-for="checklistItem in checklistItems"
                :key="checklistItem.title"
                class="checklist-item"
              >
                <checklist-item
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
                </checklist-item>
              </div>
            </div>
            <div>
              <form @submit.prevent="sendMagicLink">
                <div class="form-group mx-auto">
                  <input
                    type="text"
                    class="form-control col-xl-4 mx-auto project-form-input"
                    id="nameInput"
                    placeholder="Team Name"
                    v-model="teamName"
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
      </div>
      <div
        v-if="dataLoaded && !hasTeam"
        class="display-container"
        style="flex-direction: column; justify-content: center;"
      >
        <div style="margin-bottom: 1rem;">You must create or join a team in order to submit your project, even if you are a hacker working alone.</div>
        <Button
          @click="createTeam()"
          class="create-team-button"
        >Create or Join a Team</Button>
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
  </div>
</template>

<script>
import Button from '@/components/Button.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import ChecklistItem from '@/components/ChecklistItem.vue';
import EasterEgg from '@/components/EasterEgg.vue';
import generalMixin from '../mixins/general';

export default {
  name: 'Project',
  mixins: [generalMixin],
  components: {
    Button,
    ChecklistItem,
    LoadingSpinner,
    EasterEgg,
  },
  data() {
    return {
      projectHasAlreadyBeenSubmitted: false,
      readyButtonClicked: false,
      dataLoaded: false,
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
      teamName: '',
      devLink: '',
      currentTeamId: null,
      checklistCounter: 0,
    };
  },
  async created() {
    await this.getTeam();
    this.dataLoaded = true;
  },
  methods: {
    closeModal() {
      this.$bvModal.hide('projectSubmissionModal');
    },
    createTeam() {
      this.$router.push('Team');
    },
    async clickSubmitButton() {
      this.dataLoaded = false;
      const params = {
        team_id: this.currentTeamId,
        project_submitted: true,
      };
      await this.performPostRequest(this.getEnvVariable('BACKEND'), 'teams/submission', params);
      await this.getTeam();
      this.dataLoaded = true;
      this.$bvModal.show('projectSubmissionModal');
    },
    clickReadyButton() {
      this.readyButtonClicked = true;
    },
    async getTeam() {
      const teamParams = {
        user_id: this.getUserId(),
      };
      const team = await this.performGetRequest(this.getEnvVariable('BACKEND'), 'teams/membership', teamParams);
      if (team[0]) {
        this.hasTeam = true;
        const params = {
          team_id: team[0].team_id,
        };
        // check submission status of project
        const status = await this.performGetRequest(this.getEnvVariable('BACKEND'), 'teams/submission', params);
        this.projectHasAlreadyBeenSubmitted = status[0].project_submitted;
        if (this.projectHasAlreadyBeenSubmitted) {
          this.readyButtonText = 'Project has been submitted';
          this.readyButtonDisabled = true;
        }
        // get checklist items for team
        const checklist = await this.performGetRequest(this.getEnvVariable('BACKEND'), 'projects/submission/checklist', params);
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
        this.currentTeamId = team[0].team_id;
      }
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
  computed: {
    checklistDisabled() {
      return (this.devLink === '' || this.teamName === '') || this.checklistCounter !== this.checklistItems.length;
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.card,
.card-body {
  border: 0;
  border-radius: var(--border-radius);
  background-color: var(--color-foreground-accent);
}

.filler {
  cursor: text !important;
}

.content-container {
  border-radius: 8px;
  padding: 3rem;
  background-color: var(--color-foreground);
  border-radius: 4px;
  text-align: center;
  margin-bottom: 2rem;
}

.checklist-item {
  float: left;
}

.checklist-body {
  width: 80%;
  display: inline-block;
}

.form-control {
  margin-bottom: 1rem;
}
</style>
