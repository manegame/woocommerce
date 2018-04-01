<template>
  <div class="cart">
    Shoppin cart
    <ul>
      <li v-for='item in main.cart'
          :key='item.data.id'>
        <!-- PRICE -->
        <template v-if='item.data.variation'>
          {{item.data.product.name}}<span>({{item.data.variation.attributes[0].option}})</span>
          <span>€{{item.data.variation.price}}</span>
        </template>
        <template v-else>
          <span>€{{item.data.product.price}}</span><br>
        </template><span>amount: {{item.quantity}}</span>
        <span @click='ADD_TO_CART(item.data)'>+</span>
        <span @click='REMOVE_FROM_CART(item.data)'>-</span>
      </li>
    </ul>
    <p>Items: {{cartTotal}}</p>
    <p>Shipping: {{shippingTotal}}</p>
    <p>Total: {{total}}</p>
    <router-link v-if='$route.name !== "checkout"'
                 tag='button'
                 :to="{ name: 'checkout' }">Checkout</router-link>
  </div>
</template>

<script>
import {mapState, mapGetters, mapActions} from 'vuex'
export default {
  name: 'cart',
  data() {
    return {}
  },
  computed: {
    ...mapState(['main']),
    ...mapGetters(['cartTotal', 'shippingTotal']),
    total() {
      return this.cartTotal + this.shippingTotal
    }
  },
  mounted: function() {
    this.$nextTick(function() {
      // Code that will run only after the
      // entire view has been re-rendered
    })
  },
  methods: {
    ...mapActions([
      'ADD_TO_CART',
      'REMOVE_FROM_CART'
    ])
  },
  watch: {
    shippingTotal(newV, oldV) {
      console.log('new value', newV, oldV)
    }
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
