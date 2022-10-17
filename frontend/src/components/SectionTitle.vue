<template>
  <div>
    <b-row class="section-banner">
      <b-col class="hl"></b-col>
      <b-col class="section-title">
        <h5 class="medium">{{ title }}</h5>
      </b-col>
      <b-col class="hl"></b-col>
    </b-row>
  </div>
</template>

<script>
export default {
  name: 'SectionTitle',
  props: {
    title: String,
  },
};
</script>

<style>
.row.section-banner {
  margin-top: 0px;
}

.section-banner {
  max-height: 50px;
  align-items: center;
}

/* horizontal line */
.hl {
  border-top: 2px solid var(--color-secondary);
  width: 100%;
  height: 10px;
}
</style>
