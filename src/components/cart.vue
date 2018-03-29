<template>
  <div class="cart">
    Shoppin cart
    <ul>
      <li v-for='item in main.cart'
          :key='item.id'>
        <!-- PRICE -->
        <template v-if='item.variation'>
          {{item.product.name}}<span>({{item.variation.attributes[0].option}})</span>
          <span>€{{item.variation.price}}</span>
        </template>
        <template v-else>
          <span>€{{item.product.price}}</span>
        </template>
        <!-- SHIPPING -->
        <span></span>
      </li>
    </ul>
    <p>
      Total: {{cartTotal}}<br />
    </p>
    <p>
      Shipping:
    </p>
    <router-link v-if='$route.name !== "checkout"'
                 tag='button'
                 :to="{ name: 'checkout' }">Checkout</router-link>
  </div>
</template>

<script>
import {mapState, mapGetters} from 'vuex'
export default {
  name: 'cart',
  data() {
    return {}
  },
  computed: {
    ...mapState(['main']),
    ...mapGetters(['cartTotal'])
  },
  mounted: function() {
    this.$nextTick(function() {
      // Code that will run only after the
      // entire view has been re-rendered
    })
  }
}
</script>

<style scoped lang='scss'>
@import '../style/helpers/_mixins.scss';
@import '../style/helpers/_responsive.scss';
@import '../style/_variables.scss';

.cart {
  background: rgb(199, 199, 199);
  width: 400px;
}
</style>
