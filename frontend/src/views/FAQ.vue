<template>
  <!--NOTE: we opted to use a view-only google sheet instead of this page during Bitcamp 2021
      to make it easier for organizers to modify this information-->
  <div>
    <ContentPage
      title="Frequently Asked Questions"
      :rightPanelItems="rightPanelItems"
      :leftPanelItems="leftPanelItems"
    />
  </div>
</template>

<script>
import ContentPage from '@/components/ContentPage.vue';
import Content from '@/config/content';

export default {
  name: 'FAQ',
  components: {
    ContentPage,
  },
  computed: {
    rightPanelItems() {
      return Content.FAQ.rightPanelItems;
    },
    leftPanelItems() {
      return Content.FAQ.leftPanelItems;
    },
  },
};
</script>

<style scoped>
</style>
