<template>
  <div class="container content-container col-md-10 col-lg-10 col-xl-6">
        <div class="content-container-title">
            <slot name="title"></slot>
        </div>
        <div class="content-container-progress">
            <slot name="progress"></slot>
        </div>
        <div class="content-container-body">
            <slot name="body"></slot>
        </div>
  </div>
</template>

<script>
export default {
  name: 'ContentContainer',
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .content-container {
    background: var(--color-foreground);
    border-radius: 8px;
    padding: 3rem;
    box-shadow: 0px 4px 4px var(--color-shadow);
    border-radius: 4px;
    overflow-y: auto !important;
  }

  @media (max-width: 800px) {
    .content-container {
      padding: 1rem;
    }
  }

  .content-container-title {
    margin-top: .5rem;
    /* margin-bottom: 1.5rem; */
  }

  .content-container-progress {
    margin-top: 1rem;
    margin-bottom: 1rem;
  }

</style>
