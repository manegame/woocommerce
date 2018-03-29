<template>
  <div class="main">
    <loader v-if='main.products.length === 0' />
    <router-link tag='div'
                 v-else
                 v-for='product in main.products'
                 :to='{name: "product", params: {slug: product.slug}}'
                 :key='product.id'
                 class="main__product">
                   <mg class="main__product__image" :source='product.images[0].src'/>
                   <h1>{{product.name}}</h1>
    </router-link>
    <cart />
  </div>
</template>

<script>
import {mapState} from 'vuex'
import mg from '@/components/base/mg'
import loader from '@/components/base/loader'
import cart from '@/components/cart'

export default {
  name: 'mainView',
  components: { cart, mg, loader },
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
