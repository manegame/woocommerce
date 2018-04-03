<template>
  <div class="order_complete">
    <template>
      <h1>Thanks for buying at WEBSHXP</h1>
      <div v-for='item in shop.cart'
           :key='item.id'>
        <template v-if='item.data.variation'>
          <img :src='item.data.variation.image.src' />
        </template>
        <img v-else :src='item.data.product.images[0].src'/><br>
        <p>You bought {{item.quantity}} of those bad boys!</p>
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
  computed: {
    ...mapState(['shop'])
  }
}
</script>

<style scoped lang='scss'>
@import '../style/helpers/_mixins.scss';
@import '../style/helpers/_responsive.scss';
@import '../style/_variables.scss';

.order_complete {
  color: black;

  img {
    width: 200px;
  }
}
</style>
