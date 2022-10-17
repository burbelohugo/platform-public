<template>
  <div class="about">
    <h2 class="page-header">Project Gallery</h2>
    <div v-if="dataLoaded" class="gallery-container">
      <div class="gallery-container-inner">
        <div class="project-list">
          <a
            v-for="project in projectsList.concat(projectsList)"
            :key="project.projectId"
            class="project-card"
            :href="project.url"
          >
            <div class="card-image">
              <img :src="project.coverImage" height="100%" width="100%" class="card-img-el" />
            </div>
            <div class="card-body">
              <div class="card-title">
                <h5>{{ project.name }}</h5>
              </div>
              <div class="card-description">{{ project.description }}</div>
            </div>
          </a>
        </div>
      </div>
      <div class="prize-filter">
        <h4>Filter by Prize</h4>
        <div
          v-for="prize in prizes"
          :key="prize.name"
          class="checklist-item"
        >
          <checklist-item
            :isChecked="prize.checked"
            :id="prize.name"
            @click="toggleCheckboxChecked"
          >
            <template v-slot:text>
              {{ prize.name }}
            </template>
          </checklist-item>
        </div>
      </div>
    </div>
    <LoadingSpinner v-else class="loading-spinner-container" />
  </div>
</template>

<script>
import generalMixin from "../mixins/general";
import ChecklistItem from '@/components/ChecklistItem.vue';
import LoadingSpinner from '../components/LoadingSpinner.vue';

export default {
  name: "Gallery",
  mixins: [generalMixin],
  components: {
    ChecklistItem,
    LoadingSpinner
  },
  methods: {
    toggleCheckboxChecked(name) {
      if (!name) {
        return;
      }
      const item = this.prizes.find((j) => name === j.name);
      item.checked = !item.checked;
    },
    showProject(prizes) {
      let s = false;
      prizes.forEach(p => {
        if(this.checkedPrizes.includes(p)) {
          s = true;
        }
      })
      return s;
    }
  },
  async mounted() {
    const endpoint = "https://ql5n6ac9dc.execute-api.us-east-1.amazonaws.com/dev/submit";
    const url = "get_projects";
    const projects = await this.performGetRequest(endpoint, url, {});
    // console.log(projects)
    this.projectsList = projects;
    this.dataLoaded = true;
  },
  computed: {
    checkedPrizes() {
      return this.prizes.filter(pp => pp.checked).map(pp => pp.name);
    },
    filteredProjectsList() {
      return this.projectsList
      // return this.projectsList.filter(p => {
      //   // console.log(p)
      //   let checkedPrizes = this.prizes.filter(pp => pp.checked).map(pp => pp.name);
      //   // console.log(checkedPrizes)
      //   let showProject = false;
      //   // console.log(p.prizes)
      //   p.prizes.forEach(prize => {
      //     if(checkedPrizes.includes(prize)) {
      //       showProject = true;
      //     }
      //   })
      //   return showProject;
      // })
    }
  },
  data() {
    return {
      projectsList: [],
      dataLoaded: false,
      prizes: [
        {name: "JP Morgan's Best Financial Hack", checked: true},
        {name: "Microsoft's Best Use of Azure", checked: true},
        {name: "Google: Best Cloud Development Hack for Good", checked: true},
        {name: "Technica: Best Welcome Home Hack", checked: true},
      ]
    };
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.project-list {
  display: flex;
  flex-flow: row wrap;
}

.gallery-container {
  display: flex;
  justify-content: center;
  /* border: 1px solid blue; */
  width: 100vw;
  height: 200vh;
  padding-left: 2.5rem;
  padding-right: 2.5rem;
}

.gallery-container-inner {
  /* border: 1px solid red; */
  width: 70%;
  height: 90%;
}

.project-card {
  height: 400px;
  width: 300px;
  border-top-left-radius: 11.698px;
  border-top-right-radius: 11.698px;
  margin-left: 5rem;
  margin-top: 2.5rem;
  color: black !important;
}

.project-card:hover {
  box-shadow: 0 3px 5px rgb(0 0 0 / 0.2);
  cursor: pointer;
}

.card-image {
  height: 50%;
  width: 100%;
}

.card-img-el {
  border-top-left-radius: 11.698px;
  border-top-right-radius: 11.698px;
}

.card-body {
  height: calc(50%);
  width: calc(100%);
  display: inline-block;
  text-overflow: ellipsis;
  background: white;
  overflow: clip;
  border-bottom-left-radius: 11.698px;
  border-bottom-right-radius: 11.698px;
}

.card-description {
  height: calc(100%);
  width: calc(100%);
  display: inline-block;
  text-overflow: ellipsis;
}

.prize-filter {
  width: 25%;
  height: fit-content;
  background: #E5E5E5;
  border-radius: 15px;
  margin-top: 2.5rem;
  text-align: left;
  padding-left: 1rem;
  padding-top: 1rem;
  padding-bottom: 2rem;
}
</style>
