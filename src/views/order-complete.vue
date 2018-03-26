<template>
  <div class="order_complete">
    <template>
      Thanks for buying at WEBSHXP
      <div v-for='item in main.cart'>
        <template v-if='item.variation'>
          <img :src='item.variation.image.src' />
        </template>
        <img v-else :src='item.product.image.src'/>
      </div>
      <router-link :to='{ name: "mainView" }'>home</router-link>
    </template>
  </div>
</template>

<script>
import {mapState} from 'vuex'
import cart from '@/components/cart'

export default {
  name: 'order-complete',
  components: {
    cart
  },
  data() {
    return {
      msg: ''
    }
  },
  mounted() {},
  updated: function() {
    this.$nextTick(function() {
      // Code that will run only after the
      // entire view has been re-rendered
    })
  },
  computed: {
    ...mapState(['main'])
  }
}
</script>

<style scoped lang='scss'>
@import '../style/helpers/_mixins.scss';
@import '../style/helpers/_responsive.scss';
@import '../style/_variables.scss';

.order_complete {
  color: black;
}
</style>
