<template>
  <div>
    <ContentPage
      title="Hacker Resources"
      :rightPanelItems="rightPanelItems"
      :leftPanelItems="leftPanelItems"
    />
  </div>
</template>

<script>
import ContentPage from '../components/ContentPage.vue';
import Content from '../config/content';

export default {
  name: 'FAQ',
  components: {
    ContentPage,
  },
  computed: {
    rightPanelItems() {
      return Content.HackerResources.rightPanelItems;
    },
    leftPanelItems() {
      return Content.HackerResources.leftPanelItems;
    },
  },
};
</script>

<style scoped>
</style>
