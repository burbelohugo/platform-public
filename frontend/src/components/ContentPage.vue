<template>
  <div class="page-container">
    <h2 class="page-header">{{ title }}</h2>
    <div class="body-container">
      <div class="row">
        <div
          v-for="(items, i) in [leftPanelItems, rightPanelItems]"
          class="col-md"
          :key="i"
        >
          <div
            v-for="item in items"
            :key="item.title"
          >
            <div class="accordion">
              <button
                class="faq-toggle-icon"
                v-b-toggle="getAccordionId(item)"
                role="button"
                tabindex="0"
                @click="handleAccordionClick"
              >
                <h6>{{ item.title }}</h6>
              </button>
            </div>
            <b-collapse
              class="panel"
              accordion="content-accordion"
              :id="getAccordionId(item)"
            >
              <p
                v-html="item.description"
                class="text-left"
              ></p>
            </b-collapse>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ContentPage',
  methods: {
    getAccordionId(item) {
      return item.title.split(' ').join('-');
    },
    handleAccordionClick(event) {
      const btn = event.currentTarget;

      if (btn.classList.contains('not-collapsed')) {
        btn.blur();
      }
    },
  },
  props: {
    rightPanelItems: Array,
    leftPanelItems: Array,
    title: String,
  },
};
</script>

<style scoped>
.page-container {
  display: flex;
  align-items: center;
  flex-direction: column;
}
.body-container {
  background: var(--color-foreground);
  border: 1px solid var(--color-light-border);
  box-sizing: border-box;
  border-radius: 20px;
  height: fit-content;
  min-width: 70vw;
  width: 70%;
  padding-left: 3rem;
  padding-right: 3rem;
}

.row {
  margin-top: 1rem !important;
}

.faq-toggle-icon {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.5rem;
  font-size: 1rem;
  border: 0;
  background-color: transparent;
  border-radius: 0;
  overflow-anchor: none;
  border-bottom: 3px solid var(--color-light-border);
}

.faq-toggle-icon:hover,
.faq-toggle-icon:focus,
.faq-toggle-icon.not-collapsed {
  border-color: var(--color-primary);
}

.faq-toggle-icon:after {
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
  margin-left: auto;
  content: "";
  background-repeat: no-repeat;
  background-size: 1.25rem;
  transition: transform 0.2s ease-in-out;
  background-image: url("../assets/plus.svg");
}

.faq-toggle-icon.not-collapsed:after {
  transform: rotate(180deg);
  background-image: url("../assets/minus.svg");
}

.accordion {
  display: flex;
  justify-content: space-between;
  border: none;
  padding-bottom: 2%;
  padding-top: 2%;
  margin-bottom: 2%;
  cursor: pointer;
}

.accordion h6 {
  max-width: 95%;
  text-align: left;
}

.col-md {
  -ms-flex-preferred-size: 0;
  flex-basis: 0;
  -ms-flex-positive: 1;
  flex-grow: 1;
  max-width: 100%;
}
</style>
