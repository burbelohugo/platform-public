<template>
  <div>
    <h2 class="page-header">Maps</h2>
    <div>
      <h3>Reckord Armory</h3>
      <b-button-group vertical size="lg">
        <b-button @click="openModal(0)" class="button m-0">Basement</b-button>
        <b-button @click="openModal(1)" class="button m-0">First floor</b-button>
      </b-button-group>
      <h3 class="mt-4">ESJ</h3>
      <b-button-group vertical size="lg">
        <b-button @click="openModal(2)" class="button m-0">Ground floor</b-button>
        <b-button @click="openModal(3)" class="button m-0">First floor</b-button>
        <b-button @click="openModal(4)" class="button m-0">Second floor</b-button>
      </b-button-group>
    </div>
    <b-modal
      id='mapModal'
      :title="modalTitle"
      size="xl"
      centered
    >
      <a :href="getImgUrl(modalImg)" target="_blank" rel="noopener noreferrer">
        <img :src="getImgUrl(modalImg)" class="image-fit"/>
      </a>
    </b-modal>
  </div>
</template>

<script>
import Button from '@/components/Button.vue';
import generalMixin from '../mixins/general';
import Content from '../config/content';

export default {
  name: 'Maps',
  mixins: [generalMixin],
  components: {
    Button,
  },
  data() {
    return {
      modalTitle: 'Armory Basement',
      modalImg: 'armoryBasement',
    }
  },
  methods: {
    openModal(map) {
      this.modalTitle = Content.Maps.items[map].title;
      this.modalImg = Content.Maps.items[map].image;
      this.$bvModal.show('mapModal');
    },
    getImgUrl(img) {
      var images = require.context('../../public/venue/', false, /\.png$/)
      return images('./' + img + ".png")
    },
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.image-fit { 
  height: 100%;
  width: 100%; 
}

.button {
  width: 20vw;
  border-radius: 8px;
  background: var(--color-primary-muted-muted) !important;
  color: var(--color-primary);
  border-color: var(--color-primary) !important;
}

.button:hover {
  background: var(--color-primary) !important;
  color: white;
  border-color: var(--color-primary) !important;
}
</style>
