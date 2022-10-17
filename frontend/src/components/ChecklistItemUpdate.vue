<template>
    <label class="container" :for="3" @click="handleTextClicked()">
      <input :id="id" v-model="checked" type="checkbox" aria-label="Checkbox for following text input" class="list-checkbox" @change="clicked($event)">
      <span><slot name="text"></slot></span>
    </label>
</template>

<script>
import generalMixin from '../mixins/general';

export default {
  name: 'ChecklistItemUpdate',
  mixins: [generalMixin],
  data() {
    return {
      checked: true,
    };
  },
  props: {
    isChecked: {
      type: Boolean,
      default: true,
    },
    id: {
      type: String,
      default: 'None',
    },
  },
  methods: {
    clicked() {
      this.$emit('click', this.id);
      this.update();
    },
    handleTextClicked() {
      this.checked = !this.checked;
      this.clicked();
    },
    async update() {
      const updateChecklistPostParams = {
        id: this.id,
        is_checked: this.checked,
      };
      await this.performPostRequest(this.getEnvVariable('BACKEND'), 'projects/submission/checklist/update', updateChecklistPostParams);
    },
  },
  async mounted() {
    this.checked = this.isChecked;
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

  /* Customize the label (the container) */
.container {
  display: block;
  position: relative;
  font-size: 20px;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

}

/* Hide the browser's default checkbox */
.container input {
  margin-right: 0.5rem;
}

/* Create a custom checkbox */
.checkmark {
  position: absolute;
  top: 3px;
  left: 0;
  height: 25px;
  width: 25px;
  background-color: var(--color-placeholder);
}

/* When the checkbox is checked, add a background */
.container input:checked ~ .checkmark {
  background-color: var(--color-secondary);
}

/* Create the checkmark/indicator (hidden when not checked) */
.checkmark:after {
  position: absolute;
  display: none;
  content: '\2714';
  color: var(--color-light-text);
}

/* Show the checkmark when checked */
.container input:checked ~ .checkmark:after {
  display: block;
}

/* Style the checkmark/indicator */
.container .checkmark:after {
  left: 5px;
  top: -3px;
}
</style>
