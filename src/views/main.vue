<template>
  <div class="main">
    <router-link tag='div'
                 v-if='main.products.length > 0'
                 v-for='product in main.products'
                 :to='{name: "product", params: {slug: product.slug}}'
                 :key='product.id'
                 class="main__product">
                   <img class="main__product__image" :src='product.images[0].src'/>
                   <h1>{{product.name}}</h1>
                   <h1>{{product.slug}}</h1>
    </router-link>
  </div>
</template>

<script>
import {mapState} from 'vuex'
export default {
  name: 'mainView',
  props: [],
  computed: {
    ...mapState(['main'])
  },
  mounted() {},
  updated: function() {
    this.$nextTick(function() {
      // Code that will run only after the
      // entire view has been re-rendered
    })
  },
  methods: {}
}
</script>

<style scoped lang='scss'>
@import '../style/helpers/_mixins.scss';
@import '../style/helpers/_responsive.scss';
@import '../style/_variables.scss';

.main {
  display: flex;

  &__product {
    width: 200px;
    height: auto;

    &__image {
      width: 100%;
      height: auto;
    }
  }
}
</style>
